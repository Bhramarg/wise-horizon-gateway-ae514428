import { query } from "../database/db.js";

export async function getPortalOverview(userId: string) {
  // 1. Get roles
  const rolesRes = await query("SELECT role FROM user_roles WHERE user_id = $1", [userId]);
  const role = rolesRes.rows.some((r) => r.role === "admin") ? "admin" : 
               rolesRes.rows.some((r) => r.role === "dms") ? "dms" : null;

  // 2. Get Memberships
  const memRes = await query(`
    SELECT m.institution_id, m.active, 
           i.id, i.name, i.code, i.status as active
    FROM institution_members m
    JOIN institutions i ON i.id = m.institution_id
    WHERE m.user_id = $1
  `, [userId]);

  const institutionsRes = await query("SELECT id, name, code, status as active, documents FROM institutions ORDER BY name");
  const studentsRes = await query(`
    SELECT id, institution_id, student_number, full_name, date_of_birth, created_at, status
    FROM students
    ORDER BY created_at DESC LIMIT 200
  `);
  const resultsRes = await query(`
    SELECT r.id, r.institution_id, r.student_id, r.qualification, r.academic_period, r.grade, r.status, r.verification_code, r.portfolio_path, r.issued_at, r.created_at,
           s.full_name as student_full_name, s.student_number, s.date_of_birth
    FROM results r
    JOIN students s ON s.id = r.student_id
    ORDER BY r.created_at DESC LIMIT 200
  `);
  const tagsRes = await query("SELECT id, result_id, tag_uid as ndef_payload, status, locked_at, write_count as write_counter FROM certificate_tags ORDER BY created_at DESC LIMIT 200");
  const subjectsRes = await query("SELECT id, name, code FROM subjects ORDER BY name"); // Wait, does subjects table exist?

  return {
    role,
    userId,
    profile: null,
    institutions: institutionsRes.rows,
    memberships: memRes.rows,
    students: studentsRes.rows.map(s => ({ ...s, programme: "", metadata: {}, caste: "", face_id_number: "", address: "", guardians: [] })),
    results: resultsRes.rows.map(r => ({
      ...r,
      students: {
        full_name: r.student_full_name,
        student_number: r.student_number,
        date_of_birth: r.date_of_birth,
      }
    })),
    tags: tagsRes.rows,
    subjects: subjectsRes.rows || [],
    layouts: []
  };
}

export async function addStudent(userId: string, input: any) {
  const { institutionId, studentNumber, fullName, dateOfBirth, gender, nationalId, email, phone, address, enrollmentDate } = input;
  const res = await query(`
    INSERT INTO students (institution_id, student_number, full_name, date_of_birth, gender, national_id, email, phone, address, enrollment_date, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [institutionId, studentNumber, fullName, dateOfBirth, gender, nationalId, email, phone, address, enrollmentDate, userId]);
  return res.rows[0];
}

export async function addResult(userId: string, input: any) {
  const { studentId, institutionId, academicPeriod, qualification, grade } = input;
  const res = await query(`
    INSERT INTO results (student_id, institution_id, academic_period, qualification, grade, created_by, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'draft')
    RETURNING *
  `, [studentId, institutionId, academicPeriod, qualification, grade, userId]);
  
  // also add subjects if provided
  if (input.subjects && input.subjects.length > 0) {
    for (const sub of input.subjects) {
      await query(`
        INSERT INTO result_subjects (result_id, subject_code, subject_name, score)
        VALUES ($1, $2, $3, $4)
      `, [res.rows[0].id, sub.code, sub.name, sub.score]);
    }
  }
  return res.rows[0];
}

export async function submitResultForEvaluation(userId: string, resultId: string) {
  await query("UPDATE results SET status = 'submitted' WHERE id = $1", [resultId]);
}

export async function setResultStatus(userId: string, input: { resultId: string, status: string, note?: string }) {
  await query("UPDATE results SET status = $1, review_note = $2 WHERE id = $3", [input.status, input.note || "", input.resultId]);
}

export async function deleteDraftResult(userId: string, resultId: string) {
  // Allow deleting if status is draft or revoked
  const check = await query("SELECT status FROM results WHERE id = $1", [resultId]);
  if (check.rows.length === 0) throw new Error("Result not found");
  const status = check.rows[0].status;
  if (status !== 'draft' && status !== 'revoked') {
    throw new Error("Only draft or revoked results can be deleted");
  }
  await query("DELETE FROM results WHERE id = $1", [resultId]);
}
