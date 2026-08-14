-- Phase 7: Certificate Template Versioning & Lifecycle
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null, -- e.g., 'Marksheet', 'Certificate'
  level text, -- e.g., 'L2', 'L3'
  status text not null default 'DRAFT', -- DRAFT, TESTING, APPROVED, PUBLISHED, LOCKED
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.certificate_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.certificate_templates(id) on delete cascade,
  version int not null,
  html text,
  css text,
  background_asset text,
  paper_size text default 'A4',
  orientation text default 'portrait',
  metadata jsonb, -- For storing drag & drop fields if any
  created_at timestamp with time zone default now(),
  published_at timestamp with time zone,
  created_by uuid references auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.issued_certificates (
  id uuid primary key default gen_random_uuid(),
  result_id uuid, -- Reference to results table (assuming it's named results or similar)
  template_version_id uuid references public.certificate_template_versions(id),
  verification_code text unique,
  pdf_path text,
  pdf_hash text,
  generated_at timestamp with time zone default now(),
  issued_at timestamp with time zone
);

-- RLS Policies
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to templates for authenticated users" 
ON public.certificate_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to template versions for authenticated users" 
ON public.certificate_template_versions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to issued certificates for authenticated users" 
ON public.issued_certificates FOR SELECT TO authenticated USING (true);

-- Allow write access to admins only (using generic auth policy for now, since this is a backend-managed tool or portal user)
CREATE POLICY "Allow all access to templates for authenticated users" 
ON public.certificate_templates FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all access to template versions for authenticated users" 
ON public.certificate_template_versions FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all access to issued certificates for authenticated users" 
ON public.issued_certificates FOR ALL TO authenticated USING (true);
