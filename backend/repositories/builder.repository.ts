import { query } from "../database/db.js";

export async function listCertificateTemplates() {
  const { rows } = await query(`
    SELECT t.*, 
      (SELECT json_agg(v.*) FROM certificate_template_versions v WHERE v.template_id = t.id) as versions
    FROM certificate_templates t
    ORDER BY created_at DESC
  `);
  return rows;
}

export async function getTemplateVersion(versionId: string) {
  const { rows } = await query(`
    SELECT * FROM certificate_template_versions WHERE id = $1
  `, [versionId]);
  return rows[0];
}

export async function saveTemplateVersion(userId: string, input: any) {
  await query(`
    UPDATE certificate_template_versions 
    SET html = $1, css = $2, background_asset = $3, 
        page2_html = $4, page2_css = $5, page2_background_asset = $6, 
        metadata = $7, updated_by = $8, updated_at = NOW()
    WHERE id = $9
  `, [
    input.html, input.css, input.background_asset, 
    input.page2_html, input.page2_css, input.page2_background_asset, 
    input.metadata, userId, input.version_id
  ]);
}
