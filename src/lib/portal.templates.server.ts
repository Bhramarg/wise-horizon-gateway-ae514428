import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export async function listCertificateTemplates(client: Client) {
  const { data, error } = await client
    .from("certificate_templates")
    .select("*, versions:certificate_template_versions(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCertificateTemplate(client: Client, userId: string, input: { name: string; type: string; level: string }) {
  const { data: tmpl, error } = await client
    .from("certificate_templates")
    .insert({
      name: input.name,
      type: input.type,
      level: input.level,
      status: "DRAFT"
    })
    .select("id")
    .single();
  if (error) throw error;

  // Create initial version 1
  const { data: version, error: vErr } = await client
    .from("certificate_template_versions")
    .insert({
      template_id: tmpl.id,
      version: 1,
      created_by: userId
    })
    .select("id")
    .single();
  if (vErr) throw vErr;

  return { id: tmpl.id, versions: [{ id: version.id }] };
}

export async function saveTemplateVersion(client: Client, userId: string, input: { 
  version_id: string; 
  html: string; 
  css: string; 
  background_asset: string; 
  metadata: any 
}) {
  const { error } = await client
    .from("certificate_template_versions")
    .update({
      html: input.html,
      css: input.css,
      background_asset: input.background_asset,
      metadata: input.metadata
    })
    .eq("id", input.version_id);
  if (error) throw error;
  return { ok: true };
}

export async function publishTemplate(client: Client, templateId: string) {
  const { error } = await client
    .from("certificate_templates")
    .update({ status: "PUBLISHED", updated_at: new Date().toISOString() })
    .eq("id", templateId);
  if (error) throw error;
  return { ok: true };
}

export async function getTemplateVersion(client: Client, versionId: string) {
  const { data, error } = await client
    .from("certificate_template_versions")
    .select("*, certificate_templates(name, type, level, status)")
    .eq("id", versionId)
    .single();
  if (error) throw error;
  return data;
}
