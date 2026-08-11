CREATE TYPE public.app_role AS ENUM ('admin', 'dms');
CREATE TYPE public.result_status AS ENUM ('draft', 'submitted', 'approved', 'issued', 'revoked');
CREATE TYPE public.tag_status AS ENUM ('prepared', 'written', 'locked', 'revoked', 'replaced');
CREATE TYPE public.tag_event_type AS ENUM ('prepared', 'written', 'verified', 'locked', 'revoked', 'replaced', 'scan_mismatch');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institutions TO authenticated;
GRANT ALL ON public.institutions TO service_role;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.institution_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institution_members TO authenticated;
GRANT ALL ON public.institution_members TO service_role;
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id),
  student_number text NOT NULL,
  full_name text NOT NULL,
  date_of_birth date,
  programme text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, student_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id),
  student_id uuid NOT NULL REFERENCES public.students(id),
  academic_period text NOT NULL,
  qualification text NOT NULL,
  marks jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric,
  grade text,
  status public.result_status NOT NULL DEFAULT 'draft',
  verification_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  submitted_at timestamptz,
  approved_at timestamptz,
  issued_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_by uuid NOT NULL,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.results TO authenticated;
GRANT ALL ON public.results TO service_role;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.certificate_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
  tag_uid_hash text,
  ndef_payload text NOT NULL,
  payload_digest text NOT NULL,
  status public.tag_status NOT NULL DEFAULT 'prepared',
  write_counter integer NOT NULL DEFAULT 0,
  written_at timestamptz,
  locked_at timestamptz,
  revoked_at timestamptz,
  replaced_by uuid REFERENCES public.certificate_tags(id),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (result_id, status) DEFERRABLE INITIALLY DEFERRED
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificate_tags TO authenticated;
GRANT ALL ON public.certificate_tags TO service_role;
ALTER TABLE public.certificate_tags ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tag_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES public.certificate_tags(id) ON DELETE CASCADE,
  event_type public.tag_event_type NOT NULL,
  actor_id uuid,
  tag_uid_hash text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.tag_events TO authenticated;
GRANT ALL ON public.tag_events TO service_role;
ALTER TABLE public.tag_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_institution_member(_user_id uuid, _institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institution_members
    WHERE user_id = _user_id AND institution_id = _institution_id AND active
  )
$$;
GRANT EXECUTE ON FUNCTION public.is_institution_member(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles) THEN RAISE EXCEPTION 'Administrator already configured'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_certificate(_verification_code text)
RETURNS TABLE (
  valid boolean,
  student_name text,
  student_number text,
  institution_name text,
  qualification text,
  academic_period text,
  grade text,
  issued_at timestamptz,
  status public.result_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (r.status = 'issued' AND r.revoked_at IS NULL),
    s.full_name,
    s.student_number,
    i.name,
    r.qualification,
    r.academic_period,
    r.grade,
    r.issued_at,
    r.status
  FROM public.results r
  JOIN public.students s ON s.id = r.student_id
  JOIN public.institutions i ON i.id = r.institution_id
  WHERE r.verification_code = _verification_code
    AND r.status IN ('issued', 'revoked')
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER results_updated_at BEFORE UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER certificate_tags_updated_at BEFORE UPDATE ON public.certificate_tags FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users read institutions" ON public.institutions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.is_institution_member(auth.uid(), id));
CREATE POLICY "Admins manage institutions" ON public.institutions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members read own membership" ON public.institution_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage memberships" ON public.institution_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution users read students" ON public.students FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.is_institution_member(auth.uid(), institution_id));
CREATE POLICY "Institution users create students" ON public.students FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND public.is_institution_member(auth.uid(), institution_id))));
CREATE POLICY "Institution users update students" ON public.students FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND public.is_institution_member(auth.uid(), institution_id))) WITH CHECK (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND public.is_institution_member(auth.uid(), institution_id)));
CREATE POLICY "Admins delete students" ON public.students FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution users read results" ON public.results FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.is_institution_member(auth.uid(), institution_id));
CREATE POLICY "DMS creates draft results" ON public.results FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND status = 'draft' AND (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND public.is_institution_member(auth.uid(), institution_id))));
CREATE POLICY "Institution users update results" ON public.results FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND public.is_institution_member(auth.uid(), institution_id) AND status IN ('draft', 'submitted'))) WITH CHECK (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND public.is_institution_member(auth.uid(), institution_id) AND status IN ('draft', 'submitted')));
CREATE POLICY "Admins delete results" ON public.results FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution users read tags" ON public.certificate_tags FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND public.is_institution_member(auth.uid(), r.institution_id)));
CREATE POLICY "Institution users create tags" ON public.certificate_tags FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND r.status = 'issued' AND public.is_institution_member(auth.uid(), r.institution_id)))));
CREATE POLICY "Institution users update tags" ON public.certificate_tags FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND public.is_institution_member(auth.uid(), r.institution_id)))) WITH CHECK (public.has_role(auth.uid(), 'admin') OR (public.has_role(auth.uid(), 'dms') AND EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND public.is_institution_member(auth.uid(), r.institution_id))));
CREATE POLICY "Admins delete tags" ON public.certificate_tags FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution users read tag events" ON public.tag_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.certificate_tags t JOIN public.results r ON r.id = t.result_id WHERE t.id = tag_id AND public.is_institution_member(auth.uid(), r.institution_id)));
CREATE POLICY "Institution users append tag events" ON public.tag_events FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid() AND (public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.certificate_tags t JOIN public.results r ON r.id = t.result_id WHERE t.id = tag_id AND public.has_role(auth.uid(), 'dms') AND public.is_institution_member(auth.uid(), r.institution_id))));

CREATE INDEX students_institution_idx ON public.students(institution_id);
CREATE INDEX results_institution_status_idx ON public.results(institution_id, status);
CREATE INDEX results_student_idx ON public.results(student_id);
CREATE INDEX certificate_tags_result_idx ON public.certificate_tags(result_id);
CREATE INDEX tag_events_tag_time_idx ON public.tag_events(tag_id, occurred_at DESC);