-- Standard PostgreSQL Schema for WISE Project on Neon DB

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.app_role AS ENUM ('admin', 'dms');
CREATE TYPE public.result_status AS ENUM ('draft', 'submitted', 'approved', 'issued', 'revoked');
CREATE TYPE public.tag_status AS ENUM ('prepared', 'written', 'locked', 'revoked', 'replaced');
CREATE TYPE public.tag_event_type AS ENUM ('prepared', 'written', 'verified', 'locked', 'revoked', 'replaced', 'scan_mismatch');

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  email text,
  phone text,
  address text,
  city text,
  country text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  documents jsonb DEFAULT '[]'::jsonb
);

CREATE TABLE public.institution_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(institution_id, user_id)
);

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE RESTRICT,
  student_number text NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text,
  national_id text,
  email text,
  phone text,
  address text,
  enrollment_date date,
  status text NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(institution_id, student_number)
);

CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE RESTRICT,
  academic_period text NOT NULL,
  qualification text NOT NULL,
  grade text,
  status public.result_status NOT NULL DEFAULT 'draft',
  verification_code text UNIQUE,
  portfolio_path text,
  metadata jsonb DEFAULT '{}'::jsonb,
  issued_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.result_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
  subject_code text NOT NULL,
  subject_name text NOT NULL,
  credits numeric(5,2),
  grade text,
  score numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.certificate_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid NOT NULL REFERENCES public.results(id) ON DELETE RESTRICT,
  tag_uid text NOT NULL UNIQUE,
  status public.tag_status NOT NULL DEFAULT 'prepared',
  locked_at timestamptz,
  write_count integer NOT NULL DEFAULT 0,
  last_scanned_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tag_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES public.certificate_tags(id) ON DELETE CASCADE,
  event_type public.tag_event_type NOT NULL,
  actor_id uuid REFERENCES public.users(id),
  device_info jsonb,
  ip_address text,
  location jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.certificate_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.certificate_templates(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  html text,
  css text,
  background_asset text,
  page2_html text,
  page2_css text,
  page2_background_asset text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(template_id, version_number)
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER results_updated_at BEFORE UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER certificate_tags_updated_at BEFORE UPDATE ON public.certificate_tags FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER templates_updated_at BEFORE UPDATE ON public.certificate_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX students_institution_idx ON public.students(institution_id);
CREATE INDEX results_institution_status_idx ON public.results(institution_id, status);
CREATE INDEX results_student_idx ON public.results(student_id);
CREATE INDEX certificate_tags_result_idx ON public.certificate_tags(result_id);
CREATE INDEX tag_events_tag_time_idx ON public.tag_events(tag_id, occurred_at DESC);
