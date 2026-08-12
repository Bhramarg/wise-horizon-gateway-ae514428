import { createHash, randomBytes } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;
type ResultStatus = Database["public"]["Enums"]["result_status"];

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

async function assertAdmin(client: Client, userId: string) {
  const { data } = await client.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Administrator access required.");
}

export function gradeFor(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 40) return "E";
  return "F";
}

export async function getPortalOverviewForUser(client: Client, userId: string, email?: string) {
  const [{ data: roles }, { data: memberships }] = await Promise.all([
    client.from("user_roles").select("role").eq("user_id", userId),
    client.from("institution_members").select("institution_id, active, institutions(id, name, code, active)").eq("user_id", userId),
  ]);
  const role = roles?.some((item) => item.role === "admin") ? "admin" : roles?.some((item) => item.role === "dms") ? "dms" : null;
  if (role) {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("students").delete().lt("expires_at", new Date().toISOString());
    } catch {
      // retention sweep is best-effort
    }
  }
  const [{ data: institutions }, { data: students }, { data: results }, { data: tags }] = await Promise.all([
    client.from("institutions").select("id, name, code, active").order("name"),
    client
      .from("students")
      .select("id, institution_id, student_number, full_name, programme, date_of_birth, expires_at, photo_path, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    client
      .from("results")
      .select(
        "id, institution_id, student_id, qualification, academic_period, marks, total, grade, status, verification_code, review_note, portfolio_path, portfolio_key_hash, submitted_at, issued_at, created_at, students(full_name, student_number)",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    client
      .from("certificate_tags")
      .select("id, result_id, ndef_payload, status, password_protected, written_at, locked_at, last_test_at, write_counter")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  return {
    userId,
    email: email ?? "",
    role,
    memberships: memberships ?? [],
    institutions: institutions ?? [],
    students: students ?? [],
    results: results ?? [],
    tags: tags ?? [],
  };
}

export async function claimInitialAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) !== 0) throw new Error("The initial administrator has already been assigned.");
  const { error: insertError } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
  if (insertError) throw insertError;
  return { ok: true as const };
}

export async function createInstitutionForAdmin(client: Client, userId: string, input: { name: string; code: string }) {
  await assertAdmin(client, userId);
  const { data, error } = await client
    .from("institutions")
    .insert({ name: input.name, code: input.code.trim().toUpperCase() })
    .select("id, name, code, active")
    .single();
  if (error) throw error;
  return data;
}

export async function createDmsAccount(client: Client, userId: string, input: { email: string; password: string; institutionId: string }) {
  await assertAdmin(client, userId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email.toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: { must_change_password: true },
  });
  if (error || !data.user) throw error ?? new Error("Could not create the account.");
  const newUserId = data.user.id;
  const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: newUserId, role: "dms" });
  const { error: membershipError } = await supabaseAdmin
    .from("institution_members")
    .insert({ user_id: newUserId, institution_id: input.institutionId });
  if (roleError || membershipError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    throw roleError ?? membershipError;
  }
  return { id: newUserId, email: input.email.toLowerCase() };
}

export type StudentInput = {
  institutionId: string;
  fullName: string;
  studentNumber: string;
  programme: string;
  dateOfBirth?: string | undefined;
  caste?: string | undefined;
  birthmark?: string | undefined;
  faceIdNumber?: string | undefined;
  address?: string | undefined;
  guardians: Array<{ relation: string; name: string; occupation?: string; contact?: string }>;
  photoPath?: string | undefined;
  prevSchoolDocPath?: string | undefined;
};

export async function addStudent(client: Client, userId: string, input: StudentInput) {
  const { data, error } = await client
    .from("students")
    .insert({
      institution_id: input.institutionId,
      created_by: userId,
      full_name: input.fullName,
      student_number: input.studentNumber,
      programme: input.programme,
      date_of_birth: input.dateOfBirth || null,
      caste: input.caste || null,
      birthmark: input.birthmark || null,
      face_id_number: input.faceIdNumber || null,
      address: input.address || null,
      guardians: input.guardians as unknown as Json,
      photo_path: input.photoPath || null,
      prev_school_doc_path: input.prevSchoolDocPath || null,
    })
    .select("id, full_name, expires_at")
    .single();
  if (error) throw error;
  return data;
}

export async function addResult(
  client: Client,
  userId: string,
  input: {
    institutionId: string;
    studentId: string;
    qualification: string;
    academicPeriod: string;
    marks: Array<{ subject: string; score: number; maxScore: number }>;
    submit: boolean;
  },
) {
  const obtained = input.marks.reduce((sum, item) => sum + item.score, 0);
  const maximum = input.marks.reduce((sum, item) => sum + item.maxScore, 0) || 1;
  const percentage = Math.round((obtained / maximum) * 10000) / 100;
  const { data, error } = await client
    .from("results")
    .insert({
      institution_id: input.institutionId,
      student_id: input.studentId,
      created_by: userId,
      qualification: input.qualification,
      academic_period: input.academicPeriod,
      marks: input.marks as unknown as Json,
      total: percentage,
      grade: gradeFor(percentage),
      status: input.submit ? "submitted" : "draft",
      submitted_at: input.submit ? new Date().toISOString() : null,
    })
    .select("id, verification_code, total, grade")
    .single();
  if (error) throw error;
  // The learner record becomes permanent once a marksheet exists.
  await client.from("students").update({ expires_at: null }).eq("id", input.studentId);
  return data;
}

export async function submitResultForEvaluation(client: Client, userId: string, resultId: string) {
  const { data, error } = await client
    .from("results")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", resultId)
    .in("status", ["draft", "review_required"])
    .select("id")
    .single();
  if (error) throw error;
  void userId;
  return data;
}

export async function attachPortfolio(client: Client, resultId: string, path: string) {
  const { data, error } = await client.from("results").update({ portfolio_path: path }).eq("id", resultId).select("id").single();
  if (error) throw error;
  return data;
}

const KEY_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function issuePortfolioKey(client: Client, resultId: string) {
  const bytes = randomBytes(10);
  const key = Array.from(bytes)
    .map((byte) => KEY_ALPHABET[byte % KEY_ALPHABET.length])
    .join("");
  const { error } = await client
    .from("results")
    .update({ portfolio_key_hash: sha256(key), portfolio_key_issued_at: new Date().toISOString() })
    .eq("id", resultId);
  if (error) throw error;
  return { key };
}

export async function prepareTag(client: Client, userId: string, input: { resultId: string; origin: string }) {
  const { data: result, error: resultError } = await client
    .from("results")
    .select("verification_code, status")
    .eq("id", input.resultId)
    .single();
  if (resultError || !result) throw resultError ?? new Error("Result not found.");
  // 128-bit tag secret and a 32-bit tag write password — never returned to the operator UI.
  const secret = randomBytes(16).toString("hex");
  const tagPassword = randomBytes(4).toString("hex").toUpperCase();
  const payload = `${input.origin.replace(/\/$/, "")}/verify/${result.verification_code}?t=${secret}`;
  const { data, error } = await client
    .from("certificate_tags")
    .insert({
      result_id: input.resultId,
      created_by: userId,
      ndef_payload: payload,
      payload_digest: sha256(payload),
      secret_hash: sha256(secret),
      tag_password_hash: sha256(tagPassword),
    })
    .select("id, status")
    .single();
  if (error) throw error;
  await client.from("tag_events").insert({ tag_id: data.id, actor_id: userId, event_type: "prepared" });
  // payload + password travel to the writer only; the UI never renders them.
  return { id: data.id, status: data.status, writePayload: payload, tagPassword };
}

export async function recordWrittenTag(
  client: Client,
  userId: string,
  input: { tagId: string; serialNumber: string | undefined; locked: boolean },
) {
  const uidHash = input.serialNumber ? sha256(input.serialNumber) : null;
  const now = new Date().toISOString();
  const { data: tag, error } = await client
    .from("certificate_tags")
    .update({
      status: input.locked ? "locked" : "written",
      written_at: now,
      locked_at: input.locked ? now : null,
      password_protected: input.locked,
      tag_uid_hash: uidHash,
      write_counter: 1,
    })
    .eq("id", input.tagId)
    .eq("status", "prepared")
    .select("id")
    .single();
  if (error) throw error;
  const { error: eventError } = await client
    .from("tag_events")
    .insert({ tag_id: input.tagId, actor_id: userId, event_type: input.locked ? "locked" : "written", tag_uid_hash: uidHash });
  if (eventError) throw eventError;
  return tag;
}

export async function recordTagTest(client: Client, userId: string, input: { tagId: string; payload: string }) {
  const { data: tag, error } = await client
    .from("certificate_tags")
    .select("id, payload_digest, status")
    .eq("id", input.tagId)
    .single();
  if (error || !tag) throw error ?? new Error("Tag not found.");
  const match = tag.payload_digest === sha256(input.payload);
  await client.from("tag_events").insert({
    tag_id: tag.id,
    actor_id: userId,
    event_type: match ? "verified" : "scan_mismatch",
  });
  if (match) await client.from("certificate_tags").update({ last_test_at: new Date().toISOString() }).eq("id", tag.id);
  return { match };
}

export async function revokeTag(client: Client, userId: string, tagId: string) {
  const { data, error } = await client
    .from("certificate_tags")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", tagId)
    .select("id")
    .single();
  if (error) throw error;
  await client.from("tag_events").insert({ tag_id: tagId, actor_id: userId, event_type: "revoked" });
  return data;
}

export async function setResultStatus(
  client: Client,
  userId: string,
  input: { resultId: string; status: ResultStatus; note?: string | undefined },
) {
  await assertAdmin(client, userId);
  const now = new Date().toISOString();
  const patch: Database["public"]["Tables"]["results"]["Update"] = { status: input.status, review_note: input.note ?? null };
  if (input.status === "issued") {
    patch.approved_by = userId;
    patch.approved_at = now;
    patch.issued_at = now;
  }
  if (input.status === "revoked") {
    patch.revoked_at = now;
    patch.revocation_reason = input.note ?? "Revoked by WISE";
  }
  const { data, error } = await client.from("results").update(patch).eq("id", input.resultId).select("id, status").single();
  if (error) throw error;
  return data;
}

export async function deleteResultAsAdmin(client: Client, userId: string, resultId: string) {
  await assertAdmin(client, userId);
  const { error } = await client.from("results").delete().eq("id", resultId);
  if (error) throw error;
  return { ok: true as const };
}

export async function signedFileUrl(client: Client, input: { bucket: string; path: string }) {
  const { data, error } = await client.storage.from(input.bucket).createSignedUrl(input.path, 300);
  if (error) throw error;
  return { url: data.signedUrl };
}

export async function getPublicCertificate(code: string, token?: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("results")
    .select(
      "id, verification_code, qualification, academic_period, marks, total, grade, status, issued_at, revoked_at, portfolio_path, students(full_name, student_number, programme), institutions(name, code)",
    )
    .eq("verification_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const approved = data.status === "issued";
  const revoked = data.status === "revoked";
  let fullAccess = false;
  if (approved && token) {
    const { data: tags } = await supabaseAdmin
      .from("certificate_tags")
      .select("secret_hash, status")
      .eq("result_id", data.id)
      .in("status", ["written", "locked"]);
    fullAccess = (tags ?? []).some((tag) => tag.secret_hash === sha256(token));
  }

  return {
    state: approved ? ("approved" as const) : revoked ? ("revoked" as const) : ("pending" as const),
    verificationCode: data.verification_code,
    learner: data.students?.full_name ?? "—",
    studentNumber: data.students?.student_number ?? "—",
    programme: data.students?.programme ?? "—",
    qualification: data.qualification,
    academicPeriod: data.academic_period,
    institution: data.institutions?.name ?? "—",
    issuedAt: data.issued_at,
    fullAccess,
    hasPortfolio: Boolean(data.portfolio_path),
    grade: fullAccess ? data.grade : null,
    total: fullAccess ? data.total : null,
    marks: fullAccess ? (data.marks as unknown as Array<{ subject: string; score: number; maxScore: number }>) : null,
  };
}

export async function redeemPortfolioKey(code: string, key: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("results")
    .select("portfolio_path, portfolio_key_hash, status")
    .eq("verification_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.status !== "issued" || !data.portfolio_path || !data.portfolio_key_hash) {
    throw new Error("This portfolio is not available yet.");
  }
  if (data.portfolio_key_hash !== sha256(key.trim())) throw new Error("Invalid portfolio key.");
  const { data: signed, error: signError } = await supabaseAdmin.storage.from("portfolios").createSignedUrl(data.portfolio_path, 300);
  if (signError) throw signError;
  return { url: signed.signedUrl };
}
