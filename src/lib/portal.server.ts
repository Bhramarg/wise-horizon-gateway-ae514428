import { createHash } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

async function assertAdmin(client: Client, userId: string) {
  const { data } = await client.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Administrator access required.");
}

export async function getPortalOverviewForUser(client: Client, userId: string, email?: string) {
  const [{ data: roles }, { data: memberships }] = await Promise.all([
    client.from("user_roles").select("role").eq("user_id", userId),
    client.from("institution_members").select("institution_id, active, institutions(id, name, code, active)").eq("user_id", userId),
  ]);
  const role = roles?.some((item) => item.role === "admin") ? "admin" : roles?.some((item) => item.role === "dms") ? "dms" : null;
  const [{ data: institutions }, { data: students }, { data: results }, { data: tags }] = await Promise.all([
    client.from("institutions").select("id, name, code, active").order("name"),
    client.from("students").select("id, institution_id, student_number, full_name, programme, date_of_birth, created_at").order("created_at", { ascending: false }).limit(100),
    client.from("results").select("id, institution_id, student_id, qualification, academic_period, marks, total, grade, status, verification_code, submitted_at, issued_at, students(full_name, student_number)").order("created_at", { ascending: false }).limit(100),
    client.from("certificate_tags").select("id, result_id, ndef_payload, status, written_at, locked_at, write_counter").order("created_at", { ascending: false }).limit(100),
  ]);
  return { userId, email: email ?? "", role, memberships: memberships ?? [], institutions: institutions ?? [], students: students ?? [], results: results ?? [], tags: tags ?? [] };
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
  const { data, error } = await client.from("institutions").insert({ name: input.name, code: input.code.trim().toUpperCase() }).select("id, name, code, active").single();
  if (error) throw error;
  return data;
}

export async function createDmsAccount(client: Client, userId: string, input: { email: string; password: string; institutionId: string }) {
  await assertAdmin(client, userId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.createUser({ email: input.email.toLowerCase(), password: input.password, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("Could not create the account.");
  const newUserId = data.user.id;
  const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: newUserId, role: "dms" });
  const { error: membershipError } = await supabaseAdmin.from("institution_members").insert({ user_id: newUserId, institution_id: input.institutionId });
  if (roleError || membershipError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    throw roleError ?? membershipError;
  }
  return { id: newUserId, email: input.email.toLowerCase() };
}

export async function addStudent(client: Client, userId: string, input: { institutionId: string; fullName: string; studentNumber: string; programme: string; dateOfBirth?: string }) {
  const { data, error } = await client.from("students").insert({
    institution_id: input.institutionId,
    created_by: userId,
    full_name: input.fullName,
    student_number: input.studentNumber,
    programme: input.programme,
    date_of_birth: input.dateOfBirth || null,
  }).select("id").single();
  if (error) throw error;
  return data;
}

export async function addResult(client: Client, userId: string, input: { institutionId: string; studentId: string; qualification: string; academicPeriod: string; marks: Array<{ subject: string; score: number }>; submit: boolean }) {
  const total = input.marks.reduce((sum, item) => sum + item.score, 0) / input.marks.length;
  const grade = total >= 80 ? "A" : total >= 70 ? "B" : total >= 60 ? "C" : total >= 50 ? "D" : "F";
  const { data, error } = await client.from("results").insert({
    institution_id: input.institutionId,
    student_id: input.studentId,
    created_by: userId,
    qualification: input.qualification,
    academic_period: input.academicPeriod,
    marks: input.marks as unknown as Json,
    total,
    grade,
    status: input.submit ? "submitted" : "draft",
    submitted_at: input.submit ? new Date().toISOString() : null,
  }).select("id, verification_code").single();
  if (error) throw error;
  return data;
}

export async function approveAndIssueResult(client: Client, userId: string, resultId: string) {
  await assertAdmin(client, userId);
  const now = new Date().toISOString();
  const { data, error } = await client.from("results").update({ status: "issued", approved_by: userId, approved_at: now, issued_at: now }).eq("id", resultId).eq("status", "submitted").select("id, verification_code").single();
  if (error) throw error;
  return data;
}

export async function prepareTag(client: Client, userId: string, input: { resultId: string; origin: string }) {
  const { data: result, error: resultError } = await client.from("results").select("verification_code, status").eq("id", input.resultId).single();
  if (resultError || !result || result.status !== "issued") throw resultError ?? new Error("Only issued results can be written to NFC tags.");
  const payload = `${input.origin.replace(/\/$/, "")}/verify/${result.verification_code}`;
  const digest = createHash("sha256").update(payload).digest("hex");
  const { data, error } = await client.from("certificate_tags").insert({ result_id: input.resultId, created_by: userId, ndef_payload: payload, payload_digest: digest }).select("id, ndef_payload, status").single();
  if (error) throw error;
  return data;
}

export async function recordWrittenTag(client: Client, userId: string, input: { tagId: string; serialNumber?: string; locked: boolean }) {
  const uidHash = input.serialNumber ? createHash("sha256").update(input.serialNumber).digest("hex") : null;
  const now = new Date().toISOString();
  const { data: tag, error } = await client.from("certificate_tags").update({
    status: input.locked ? "locked" : "written",
    written_at: now,
    locked_at: input.locked ? now : null,
    tag_uid_hash: uidHash,
    write_counter: 1,
  }).eq("id", input.tagId).eq("status", "prepared").select("id").single();
  if (error) throw error;
  const { error: eventError } = await client.from("tag_events").insert({ tag_id: input.tagId, actor_id: userId, event_type: input.locked ? "locked" : "written", tag_uid_hash: uidHash });
  if (eventError) throw eventError;
  return tag;
}

export async function getPublicCertificate(code: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("results").select("verification_code, qualification, academic_period, total, grade, status, issued_at, revoked_at, students(full_name, student_number), institutions(name, code)").eq("verification_code", code).in("status", ["issued", "revoked"]).maybeSingle();
  if (error) throw error;
  return data;
}