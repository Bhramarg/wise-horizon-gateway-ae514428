-- Add documents column to institutions table to store an array of document objects
ALTER TABLE institutions ADD COLUMN documents JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for institution files
INSERT INTO storage.buckets (id, name, public) VALUES ('institution-files', 'institution-files', false) ON CONFLICT DO NOTHING;

-- RLS for institution-files bucket
CREATE POLICY "Admins can manage institution files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'institution-files' AND (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')))
  WITH CHECK (bucket_id = 'institution-files' AND (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')));

CREATE POLICY "DMS can read institution files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'institution-files');
