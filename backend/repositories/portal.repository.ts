import { User, Institution, Student, Result, CertificateTag, Subject } from "../database/models.js";
import { connectDB } from "../database/db.js";

export async function getPortalOverview(userId: string) {
  await connectDB();

  // 1. Get user roles
  const user = await User.findById(userId);
  const role = user?.roles?.includes("admin") ? "admin" : 
               user?.roles?.includes("dms") ? "dms" : null;

  // 2. Get Memberships (Institutions where user is active)
  const institutions = await Institution.find().sort({ name: 1 });
  const memberships = institutions
    .filter(i => i.members.some(m => m.user_id.toString() === userId && m.active))
    .map(i => ({
      institution_id: i._id,
      active: i.status === 'active',
      id: i._id,
      name: i.name,
      code: i.code
    }));

  const students = await Student.find().sort({ created_at: -1 }).limit(200);
  
  const resultsData = await Result.find().populate('student_id').sort({ created_at: -1 }).limit(200);
  const tags = await CertificateTag.find().sort({ created_at: -1 }).limit(200);
  const subjects = await Subject.find().sort({ name: 1 });

  return {
    role,
    userId,
    profile: null,
    institutions: institutions.map(i => ({ id: i._id, name: i.name, code: i.code, active: i.status === 'active', documents: i.documents })),
    memberships,
    students: students.map(s => ({
      id: s._id,
      institution_id: s.institution_id,
      student_number: s.student_number,
      full_name: s.full_name,
      date_of_birth: s.date_of_birth,
      created_at: s.created_at,
      status: s.status,
      programme: "", metadata: {}, caste: "", face_id_number: "", address: s.address || "", guardians: []
    })),
    results: resultsData.map(r => {
      const student = r.student_id as any;
      return {
        id: r._id,
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
        students: {
          full_name: student?.full_name,
          student_number: student?.student_number,
          date_of_birth: student?.date_of_birth,
        }
      }
    }),
    tags: tags.map(t => ({
      id: t._id, result_id: t.result_id, ndef_payload: t.tag_uid, status: t.status, locked_at: t.locked_at, write_counter: t.write_count
    })),
    subjects: subjects.map(s => ({ id: s._id, name: s.name, code: s.code })),
    layouts: []
  };
}

export async function addStudent(userId: string, input: any) {
  await connectDB();
  const student = await Student.create({
    institution_id: input.institutionId,
    student_number: input.studentNumber,
    full_name: input.fullName,
    date_of_birth: input.dateOfBirth,
    gender: input.gender,
    national_id: input.nationalId,
    email: input.email,
    phone: input.phone,
    address: input.address,
    enrollment_date: input.enrollmentDate,
    created_by: userId
  });
  return { ...student.toObject(), id: student._id };
}

export async function addResult(userId: string, input: any) {
  await connectDB();
  const result = await Result.create({
    student_id: input.studentId,
    institution_id: input.institutionId,
    academic_period: input.academicPeriod,
    qualification: input.qualification,
    grade: input.grade,
    created_by: userId,
    status: 'draft',
    subjects: input.subjects || []
  });
  return { ...result.toObject(), id: result._id };
}

export async function submitResultForEvaluation(userId: string, resultId: string) {
  await connectDB();
  await Result.findByIdAndUpdate(resultId, { status: 'submitted' });
}

export async function setResultStatus(userId: string, input: { resultId: string, status: string, note?: string }) {
  await connectDB();
  await Result.findByIdAndUpdate(input.resultId, { 
    status: input.status, 
    review_note: input.note || "" 
  });
}

export async function deleteDraftResult(userId: string, resultId: string) {
  await connectDB();
  const result = await Result.findById(resultId);
  if (!result) throw new Error("Result not found");
  
  if (result.status !== 'draft' && result.status !== 'revoked') {
    throw new Error("Only draft or revoked results can be deleted");
  }
  await Result.findByIdAndDelete(resultId);
}
