-- Add Page 2 columns to certificate_template_versions
ALTER TABLE public.certificate_template_versions
ADD COLUMN page2_html text,
ADD COLUMN page2_css text,
ADD COLUMN page2_background_asset text;

-- Notify pgrst to reload the schema cache so Lovable UI gets the updated columns
NOTIFY pgrst, 'reload schema';
