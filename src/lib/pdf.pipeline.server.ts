import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { buildFinalHtml } from "./template.server";
import { generateCertificatePdf } from "./pdf.server";
import { NormalizedCertificateData } from "./certificateEngine";
import { gradeFor } from "./portal.server";

type Client = SupabaseClient<Database>;

export async function issueCertificatePipeline(client: Client, resultId: string) {
  // 1. Fetch Result and Student Data
  const { data: result, error: resultErr } = await client
    .from("results")
    .select("*, students(*), institutions(*)")
    .eq("id", resultId)
    .single();

  if (resultErr || !result) throw new Error("Result not found");
  if (!result.students) throw new Error("Student data missing");

  // 2. Find the PUBLISHED template for this qualification (level)
  const { data: template, error: tmplErr } = await client
    .from("certificate_templates")
    .select("id, status")
    .eq("level", result.qualification)
    .eq("status", "PUBLISHED")
    .single();

  if (tmplErr || !template) {
    throw new Error(`No PUBLISHED template found for qualification: ${result.qualification}`);
  }

  // 3. Get the latest version of this template
  const { data: latestVersion, error: verErr } = await client
    .from("certificate_template_versions")
    .select("id")
    .eq("template_id", template.id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (verErr || !latestVersion) {
    throw new Error(`No template versions found for template ${template.id}`);
  }

  const templateVersionId = latestVersion.id;

  // 4. Build NormalizedCertificateData
  const studentMeta = (result.students.metadata as any) || {};
  const marks = (result.marks as any[]) || [];
  
  const subjects = marks.map(m => ({
    name: m.subjectName 
      ? `<div style="line-height: 1.2;"><span style="font-size: 1.15em; font-weight: 600;">${m.subjectName}</span><br><span style="font-size: 0.85em; opacity: 0.8;">${m.subject}</span></div>`
      : m.subject,
    score: String(m.score),
    grade: gradeFor((m.score / m.maxScore) * 100),
    min: String(Math.floor(m.maxScore * 0.33)),
    max: String(m.maxScore),
    isced: "0000" // Optional, could map from subjects table if joined
  }));

  const data: NormalizedCertificateData = {
    candidate: {
      learner_name: result.students.full_name,
      student_number: result.students.student_number,
      date_of_birth: result.students.date_of_birth || "",
      gender: studentMeta.gender || "",
      caste: result.students.caste || "",
      address: result.students.address || "",
      country: studentMeta.country || "",
      birthmark: result.students.birthmark || "",
      face_id_number: result.students.face_id_number || "",
      father_name: (result.students.guardians as any[])?.find(g => g.relation.toLowerCase() === 'father')?.name || "",
      mother_name: (result.students.guardians as any[])?.find(g => g.relation.toLowerCase() === 'mother')?.name || "",
    },
    academic: {
      qualification: result.qualification,
      academic_period: result.academic_period,
      programme: result.students.programme || "",
      institution: result.institutions?.name || "",
    },
    result: {
      total_marks: String(result.total),
      obtained_marks: String(marks.reduce((acc, m) => acc + m.score, 0)),
      percentage: result.total ? ((marks.reduce((acc, m) => acc + m.score, 0) / result.total) * 100).toFixed(2) : "",
      grade: result.grade || "",
    },
    subjects,
    verification: {
      verification_code: result.verification_code || "",
      issued_date: new Date().toLocaleDateString("en-GB").replace(/\//g, " - "),
    }
  };

  // 5. Generate PDF
  const html = await buildFinalHtml(client, templateVersionId, data);
  const pdfBuffer = await generateCertificatePdf(html);

  // 6. Compute SHA-256
  const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  // 7. Upload to Storage securely
  // We use the student-files bucket but under a dedicated issued-certificates/ structure
  const year = new Date().getFullYear();
  const pdfPath = `issued-certificates/${year}/WISE/${resultId}/certificate.pdf`;

  const { error: uploadErr } = await client.storage
    .from("student-files")
    .upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true
    });

  if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

  // 8. Record in issued_certificates
  const { error: insertErr } = await client
    .from("issued_certificates")
    .insert({
      result_id: resultId,
      template_version_id: templateVersionId,
      verification_code: result.verification_code,
      pdf_path: pdfPath,
      pdf_hash: pdfHash,
      issued_at: new Date().toISOString()
    });

  if (insertErr) throw new Error(`Failed to record issued certificate: ${insertErr.message}`);

  return { success: true, pdfHash, pdfPath };
}
