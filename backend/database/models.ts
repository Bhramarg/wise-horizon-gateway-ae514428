import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  requiresPasswordChange: { type: Boolean, default: false },
  roles: [{ type: String, enum: ['admin', 'dms'] }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const InstitutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  email: String,
  phone: String,
  address: String,
  city: String,
  country: String,
  status: { type: String, default: 'active' },
  documents: { type: Array, default: [] },
  members: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true }
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const StudentSchema = new mongoose.Schema({
  institution_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  student_number: { type: String, required: true },
  full_name: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  gender: String,
  national_id: String,
  email: String,
  phone: String,
  address: String,
  enrollment_date: Date,
  status: { type: String, default: 'active' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
StudentSchema.index({ institution_id: 1, student_number: 1 }, { unique: true });

const ResultSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  institution_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  academic_period: { type: String, required: true },
  qualification: { type: String, required: true },
  grade: String,
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'issued', 'revoked'], default: 'draft' },
  verification_code: { type: String, unique: true, sparse: true },
  portfolio_path: String,
  metadata: { type: Object, default: {} },
  issued_at: Date,
  revoked_at: Date,
  revocation_reason: String,
  review_note: String,
  subjects: [{
    subject_code: String,
    subject_name: String,
    credits: Number,
    grade: String,
    score: Number
  }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const CertificateTagSchema = new mongoose.Schema({
  result_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Result', required: true },
  tag_uid: { type: String, required: true, unique: true },
  status: { type: String, enum: ['prepared', 'written', 'locked', 'revoked', 'replaced'], default: 'prepared' },
  locked_at: Date,
  write_count: { type: Number, default: 0 },
  last_scanned_at: Date,
  metadata: { type: Object, default: {} },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }
});

const CertificateTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  description: String,
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const CertificateTemplateVersionSchema = new mongoose.Schema({
  template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateTemplate', required: true },
  version_number: { type: Number, required: true },
  html: String,
  css: String,
  background_asset: String,
  page2_html: String,
  page2_css: String,
  page2_background_asset: String,
  metadata: { type: Object, default: {} },
  is_published: { type: Boolean, default: false },
  published_at: Date,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
});
CertificateTemplateVersionSchema.index({ template_id: 1, version_number: 1 }, { unique: true });

export const User = mongoose.model('User', UserSchema);
export const Institution = mongoose.model('Institution', InstitutionSchema);
export const Student = mongoose.model('Student', StudentSchema);
export const Result = mongoose.model('Result', ResultSchema);
export const CertificateTag = mongoose.model('CertificateTag', CertificateTagSchema);
export const Subject = mongoose.model('Subject', SubjectSchema);
export const CertificateTemplate = mongoose.model('CertificateTemplate', CertificateTemplateSchema);
export const CertificateTemplateVersion = mongoose.model('CertificateTemplateVersion', CertificateTemplateVersionSchema);

