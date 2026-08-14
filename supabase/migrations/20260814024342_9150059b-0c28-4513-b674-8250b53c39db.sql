CREATE TYPE public.subject_category AS ENUM ('fixed', 'changeable', 'optional');

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('L1','L2','L3','L4','L5')),
  code text NOT NULL,
  name text NOT NULL,
  category public.subject_category NOT NULL DEFAULT 'fixed',
  total_marks integer NOT NULL DEFAULT 100 CHECK (total_marks > 0),
  passing_marks integer NOT NULL DEFAULT 33 CHECK (passing_marks >= 0),
  theory_marks integer NOT NULL DEFAULT 100 CHECK (theory_marks >= 0),
  practical_marks integer NOT NULL DEFAULT 0 CHECK (practical_marks >= 0),
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (level, code)
);

GRANT SELECT ON public.subjects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read subjects" ON public.subjects
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'dms'::app_role));

CREATE POLICY "Admins manage subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY "Institution users create tags" ON public.certificate_tags;

CREATE POLICY "Institution users create tags" ON public.certificate_tags
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      private.has_role(auth.uid(), 'admin'::app_role)
      OR (
        private.has_role(auth.uid(), 'dms'::app_role)
        AND EXISTS (
          SELECT 1 FROM public.results r
          WHERE r.id = certificate_tags.result_id
            AND r.status IN ('draft','submitted','approved','issued')
            AND private.is_institution_member(auth.uid(), r.institution_id)
        )
      )
    )
  );