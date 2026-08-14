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

  let html = template.html || "";
  const css = template.css || "";
  const backgroundPath = template.background_asset;

  // 1. Resolve Background Asset to an accessible URL
  // Since Puppeteer runs server-side, a signed URL is the cleanest way to securely pass the asset.
  let backgroundStyle = "";
  if (backgroundPath) {
    if (backgroundPath.startsWith("http") || backgroundPath.startsWith("data:")) {
      backgroundStyle = `background-image: url('${backgroundPath}');`;
    } else {
      // Create a short-lived signed URL for the backend renderer
      const { data, error } = await supabaseAdmin.storage.from("student-files").createSignedUrl(backgroundPath, 60);
      if (error) throw error;
      backgroundStyle = `background-image: url('${data.signedUrl}');`;
    }
  }

  // 2. Generate QR Code
  // Instead of a URL, we generate a base64 Data URI inline so Puppeteer doesn't need to load external images.
  if (studentData.verification?.verification_code) {
    // Assuming verification code resolves to something like https://portal.example.com/verify/CODE
    const verifyUrl = `https://portal.wisehorizon.org/verify/${studentData.verification.verification_code}`;
    const qrDataUri = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 150 });
    studentData.verification.qr_code_url = qrDataUri;
  }

  // 3. Resolve Placeholders
  const placeholderMap = generatePlaceholderMap(studentData);

  // Replace placeholders in HTML string
  // It looks for {{ key }} or {{key}}
  for (const [key, value] of Object.entries(placeholderMap)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    html = html.replace(regex, value);
  }

  // Ensure no unmapped placeholders remain.
  const unmapped = html.match(/{{\s*[a-zA-Z0-9_]+\s*}}/g);
  if (unmapped && unmapped.length > 0) {
    // Log them, but the user requested: "Never generate a PDF containing {{ unknown_placeholder }}"
    // Throwing an error ensures we don't silently issue broken PDFs.
    const uniqueUnmapped = [...new Set(unmapped)];
    throw new Error(`Unresolved placeholders in template: ${uniqueUnmapped.join(", ")}`);
  }

  // 4. Construct Full HTML Document
  // Wrap the HTML with the required @page rules and A4 specifications.
  const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate Document</title>
  <style>
    /* Mandatory Print CSS per Architectural Decision #8 */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      box-sizing: border-box;
      /* Base font to ensure consistent rendering if no font is specified */
      font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    
    /* Background Layer per Decision #4 */
    #certificate-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 210mm;
      height: 297mm;
      ${backgroundStyle}
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: -1; /* Remain behind all content */
    }

    /* Content Layer */
    #certificate-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 210mm;
      height: 297mm;
      z-index: 1;
    }

    /* User Custom CSS */
    ${css}
  </style>
</head>
<body>
  <div id="certificate-background"></div>
  <div id="certificate-content">
    ${html}
  </div>
</body>
</html>
  `;

  return finalHtml;
}
