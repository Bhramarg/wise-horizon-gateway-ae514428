export const VALID_PLACEHOLDERS = [
  // Student
  "{{ learner_name }}",
  "{{ student_number }}",
  "{{ programme }}",
  "{{ date_of_birth }}",
  "{{ gender }}",
  "{{ caste }}",
  "{{ address }}",
  "{{ country }}",
  "{{ birthmark }}",
  "{{ face_id_number }}",
  "{{ father_name }}",
  "{{ mother_name }}",
  // Academic
  "{{ qualification }}",
  "{{ academic_period }}",
  "{{ institution }}",
  "{{ total_marks }}",
  "{{ obtained_marks }}",
  "{{ percentage }}",
  "{{ grade }}",
  "{{ issued_date }}",
  "{{ verification_code }}",
  // Dynamic
  "{{ qr_code }}",
  "{{ marks_table }}",
  "{{ summary_table }}",
];

// Add subject 1-15 placeholders
for (let i = 1; i <= 15; i++) {
  VALID_PLACEHOLDERS.push(`{{ subject_${i}_name }}`);
  VALID_PLACEHOLDERS.push(`{{ subject_${i}_score }}`);
  VALID_PLACEHOLDERS.push(`{{ subject_${i}_grade }}`);
  VALID_PLACEHOLDERS.push(`{{ subject_${i}_min }}`);
  VALID_PLACEHOLDERS.push(`{{ subject_${i}_max }}`);
  VALID_PLACEHOLDERS.push(`{{ subject_${i}_isced }}`);
}

export interface NormalizedCertificateData {
  candidate: {
    learner_name?: string;
    student_number?: string;
    date_of_birth?: string;
    gender?: string;
    caste?: string;
    address?: string;
    country?: string;
    birthmark?: string;
    face_id_number?: string;
    father_name?: string;
    mother_name?: string;
  };
  academic: {
    qualification?: string;
    academic_period?: string;
    programme?: string;
    institution?: string;
  };
  result: {
    total_marks?: string;
    obtained_marks?: string;
    percentage?: string;
    grade?: string;
  };
  subjects: Array<{
    name: string;
    score: string;
    grade: string;
    min: string;
    max: string;
    isced: string;
    category?: string; // Optional for marks table
  }>;
  verification: {
    verification_code?: string;
    issued_date?: string;
    qr_code_url?: string;
  };
}

export function generatePlaceholderMap(data: NormalizedCertificateData): Record<string, string> {
  const map: Record<string, string> = {
    "{{ learner_name }}": data.candidate.learner_name || "",
    "{{ student_number }}": data.candidate.student_number || "",
    "{{ programme }}": data.academic.programme || "",
    "{{ date_of_birth }}": data.candidate.date_of_birth || "",
    "{{ gender }}": data.candidate.gender || "",
    "{{ caste }}": data.candidate.caste || "",
    "{{ address }}": data.candidate.address || "",
    "{{ country }}": data.candidate.country || "",
    "{{ birthmark }}": data.candidate.birthmark || "",
    "{{ face_id_number }}": data.candidate.face_id_number || "",
    "{{ father_name }}": data.candidate.father_name || "",
    "{{ mother_name }}": data.candidate.mother_name || "",
    "{{ qualification }}": data.academic.qualification || "",
    "{{ academic_period }}": data.academic.academic_period || "",
    "{{ institution }}": data.academic.institution || "",
    "{{ total_marks }}": data.result.total_marks || "",
    "{{ obtained_marks }}": data.result.obtained_marks || "",
    "{{ percentage }}": data.result.percentage ? `${data.result.percentage}%` : "",
    "{{ grade }}": data.result.grade || "",
    "{{ issued_date }}": data.verification.issued_date || "",
    "{{ verification_code }}": data.verification.verification_code || "",
  };

  // Subject placeholders 1 through 15
  for (let i = 1; i <= 15; i++) {
    const subject = data.subjects && data.subjects[i - 1];
    map[`{{ subject_${i}_name }}`] = subject?.name || "";
    map[`{{ subject_${i}_score }}`] = subject?.score || "";
    map[`{{ subject_${i}_grade }}`] = subject?.grade || "";
    map[`{{ subject_${i}_min }}`] = subject?.min || "";
    map[`{{ subject_${i}_max }}`] = subject?.max || "";
    map[`{{ subject_${i}_isced }}`] = subject?.isced || "";
  }

  return map;
}

export function validateTemplateHtml(html: string): string[] {
  const regex = /{{[^}]+}}/g;
  const matches = html.match(regex);
  const errors: string[] = [];

  if (!matches) return errors;

  // Normalize spacing in matches (e.g. "{{ learner_name }}" -> "{{ learner_name }}")
  const usedPlaceholders = matches.map(m => m.replace(/{{ ?(.*?) ?}}/, "{{ $1 }}"));

  for (const placeholder of usedPlaceholders) {
    if (!VALID_PLACEHOLDERS.includes(placeholder)) {
      errors.push(placeholder);
    }
  }

  return Array.from(new Set(errors)); // Unique errors
}
