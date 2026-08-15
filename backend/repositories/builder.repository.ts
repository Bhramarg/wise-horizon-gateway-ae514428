import { CertificateTemplate, CertificateTemplateVersion } from "../database/models.js";
import { connectDB } from "../database/db.js";

export async function listCertificateTemplates() {
  await connectDB();
  const templates = await CertificateTemplate.find().sort({ created_at: -1 });
  const result = [];
  for (const t of templates) {
    const versions = await CertificateTemplateVersion.find({ template_id: t._id });
    result.push({
      ...t.toObject(),
      id: t._id,
      versions: versions.map(v => ({ ...v.toObject(), id: v._id }))
    });
  }
  return result;
}

export async function getTemplateVersion(versionId: string) {
  await connectDB();
  const v = await CertificateTemplateVersion.findById(versionId);
  return v ? { ...v.toObject(), id: v._id } : null;
}

export async function saveTemplateVersion(userId: string, input: any) {
  await connectDB();
  await CertificateTemplateVersion.findByIdAndUpdate(input.version_id, {
    html: input.html,
    css: input.css,
    background_asset: input.background_asset,
    page2_html: input.page2_html,
    page2_css: input.page2_css,
    page2_background_asset: input.page2_background_asset,
    metadata: input.metadata,
    updated_by: userId,
    updated_at: new Date()
  });
}
