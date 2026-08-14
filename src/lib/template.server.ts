import { getTemplateVersion } from "./portal.templates.server";
import { generatePlaceholderMap, NormalizedCertificateData } from "./certificateEngine";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import QRCode from "qrcode";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Builds the final, self-contained HTML string suitable for Puppeteer to render.
 */
export async function buildFinalHtml(
  client: SupabaseClient,
  templateVersionId: string,
  studentData: NormalizedCertificateData
): Promise<string> {
  const template = await getTemplateVersion(client, templateVersionId);
  if (!template) throw new Error(`Template version ${templateVersionId} not found.`);

  // 1. Generate QR Code once
  if (studentData.verification?.verification_code) {
    const verifyUrl = `https://wise.weqsc.org/verify/${studentData.verification.verification_code}`;
    const qrDataUri = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 150 });
    studentData.verification.qr_code_url = qrDataUri;
  }

  const placeholderMap = generatePlaceholderMap(studentData);

  async function resolveBackground(bgPath?: string | null) {
    if (!bgPath) return "";
    if (bgPath.startsWith("http") || bgPath.startsWith("data:")) {
      return `background-image: url('${bgPath}');`;
    }
    const { data, error } = await supabaseAdmin.storage.from("student-files").createSignedUrl(bgPath, 60);
    if (error) throw error;
    return `background-image: url('${data.signedUrl}');`;
  }

  function resolvePlaceholders(sourceHtml: string) {
    let html = sourceHtml;
    for (const [key, value] of Object.entries(placeholderMap)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      html = html.replace(regex, value);
    }
    const unmapped = html.match(/{{\s*[a-zA-Z0-9_]+\s*}}/g);
    if (unmapped && unmapped.length > 0) {
      const uniqueUnmapped = [...new Set(unmapped)];
      throw new Error(`Unresolved placeholders in template: ${uniqueUnmapped.join(", ")}`);
    }
    return html;
  }

  // --- Process Page 1 ---
  const html1 = resolvePlaceholders(template.html || "");
  const css1 = template.css || "";
  const bgStyle1 = await resolveBackground(template.background_asset);

  // --- Process Page 2 ---
  // The user requested that if Page 2 is empty, it still uses the 2-page system by default, 
  // but if the user leaves it completely blank, it might just render an empty page.
  const html2 = resolvePlaceholders(template.page2_html || "");
  const css2 = template.page2_css || "";
  const bgStyle2 = await resolveBackground(template.page2_background_asset);

  // Determine if Page 2 should be rendered. We'll render it if there is any content, css, or background.
  // Actually, the user said "keep 2 pages by default", meaning we always output 2 pages.
  const hasPage2 = !!(template.page2_html || template.page2_css || template.page2_background_asset);

  const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate Document</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      box-sizing: border-box;
      font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    
    .page-container {
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      page-break-after: always;
    }
    .page-container:last-child {
      page-break-after: auto;
    }

    /* Page 1 Styles */
    #bg-1 {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      ${bgStyle1}
      background-size: cover; background-position: center; background-repeat: no-repeat;
      z-index: -1;
    }
    #content-1 { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
    ${css1}

    /* Page 2 Styles */
    #bg-2 {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      ${bgStyle2}
      background-size: cover; background-position: center; background-repeat: no-repeat;
      z-index: -1;
    }
    #content-2 { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
    ${css2}
  </style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="page-container">
    <div id="bg-1"></div>
    <div id="content-1">${html1}</div>
  </div>

  <!-- PAGE 2 -->
  <div class="page-container">
    <div id="bg-2"></div>
    <div id="content-2">${html2}</div>
  </div>
</body>
</html>
  `;

  return finalHtml;
}
