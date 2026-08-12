ALTER TYPE result_status ADD VALUE IF NOT EXISTS 'on_hold';
ALTER TYPE result_status ADD VALUE IF NOT EXISTS 'review_required';

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS caste text,
  ADD COLUMN IF NOT EXISTS birthmark text,
  ADD COLUMN IF NOT EXISTS face_id_number text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS guardians jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS photo_path text,
  ADD COLUMN IF NOT EXISTS prev_school_doc_path text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '72 hours');

ALTER TABLE public.results
  ADD COLUMN IF NOT EXISTS review_note text,
  ADD COLUMN IF NOT EXISTS portfolio_path text,
  ADD COLUMN IF NOT EXISTS portfolio_key_hash text,
  ADD COLUMN IF NOT EXISTS portfolio_key_issued_at timestamptz;

ALTER TABLE public.certificate_tags
  ADD COLUMN IF NOT EXISTS secret_hash text,
  ADD COLUMN IF NOT EXISTS tag_password_hash text,
  ADD COLUMN IF NOT EXISTS password_protected boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_test_at timestamptz;

CREATE OR REPLACE FUNCTION private.purge_expired_students()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE removed integer;
BEGIN
  WITH gone AS (
    DELETE FROM public.students s
    WHERE s.expires_at IS NOT NULL
      AND s.expires_at < now()
      AND NOT EXISTS (SELECT 1 FROM public.results r WHERE r.student_id = s.id)
    RETURNING 1
  )
  SELECT count(*) INTO removed FROM gone;
  RETURN removed;
END;
$$;

CREATE POLICY "Institution users manage student files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id IN ('student-files','portfolios') AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'dms'::app_role)))
WITH CHECK (bucket_id IN ('student-files','portfolios') AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'dms'::app_role)));