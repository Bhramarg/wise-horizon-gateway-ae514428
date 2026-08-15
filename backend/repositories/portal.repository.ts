import { query } from "../database/db.js";

export async function getPortalOverview(userId: string) {
  // 1. Get user roles
  const { rows: users } = await query(`SELECT * FROM public.users WHERE id = $1`, [userId]);
  const user = users[0];
  
  let role = null;
  if (user) {
    if (user.roles?.includes("admin")) role = "admin";
    else if (user.roles?.includes("dms")) role = "dms";
  }

  // 2. Get Memberships (Institutions where user is active)
  const { rows: institutions } = await query(`SELECT * FROM public.institutions ORDER BY name ASC`);
  
  // Actually, we should get institutions the user belongs to from user_institutions if it exists, or members jsonb
  // The old Mongoose schema had: members: [{ user_id, active, role }]
  // Let's assume the table is institutions and members is a jsonb column, or there is a junction table.
  // Wait, let's just use raw SQL to find matching institutions
  const { rows: membershipsData } = await query(`
    SELECT i.id as institution_id, i.status = 'active' as active, i.id, i.name, i.code 
    FROM public.institutions i 
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(i.members) as m 
      WHERE (m->>'user_id') = $1 AND (m->>'active')::boolean = true
    )
  `, [userId]);

  const { rows: students } = await query(`SELECT * FROM public.students ORDER BY created_at DESC LIMIT 200`);
  const { rows: resultsData } = await query(`
    SELECT r.*, row_to_json(s.*) as students 
    FROM public.results r 
    LEFT JOIN public.students s ON r.student_id = s.id 
    ORDER BY r.created_at DESC LIMIT 200
  `);
  
  const { rows: tags } = await query(`SELECT * FROM public.certificate_tags ORDER BY created_at DESC LIMIT 200`);
  const { rows: subjects } = await query(`SELECT * FROM public.subjects ORDER BY name ASC`);

  return {
    role,
    userId,
    profile: null,
    institutions: institutions.map(i => ({ id: i.id, name: i.name, code: i.code, active: i.status === 'active', documents: i.documents })),
    memberships: membershipsData,
    students: students.map(s => ({
      id: s.id,
      institution_id: s.institution_id,
      student_number: s.student_number,
      full_name: s.full_name,
      date_of_birth: s.date_of_birth,
      created_at: s.created_at,
      status: s.status,
      programme: s.programme || "", metadata: s.metadata || {}, caste: s.caste || "", face_id_number: s.face_id_number || "", address: s.address || "", guardians: s.guardians || []
    })),
    results: resultsData.map(r => {
      return {
        id: r.id,
        institution_id: r.institution_id,
        student_id: r.student_id,
        qualification: r.qualification,
        academic_period: r.academic_period,
        grade: r.grade,
        status: r.status,
        verification_code: r.verification_code,
        portfolio_path: r.portfolio_path,
        issued_at: r.issued_at,
        created_at: r.created_at,
        students: r.students,
        subjects: r.subjects || []
      };
    }),
    tags,
    subjects
  };
}

export async function submitResult(userId: string, resultId: string) {
  await query(`UPDATE public.results SET status = 'submitted' WHERE id = $1`, [resultId]);
}

export async function approveResult(userId: string, resultId: string) {
  await query(`UPDATE public.results SET status = 'approved' WHERE id = $1`, [resultId]);
}

export async function deleteDraftResult(userId: string, resultId: string) {
  await query(`DELETE FROM public.results WHERE id = $1 AND status = 'draft'`, [resultId]);
}
