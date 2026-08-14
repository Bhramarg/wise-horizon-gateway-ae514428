import puppeteer, { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    // Handle browser disconnection
    browserInstance.on("disconnected", () => {
      browserInstance = null;
    });
  }
  return browserInstance;
}

export interface PdfOptions {
  width?: string;
  height?: string;
  format?: "A4"; // Enforce A4 for official certificates
}

export async function generateCertificatePdf(html: string, options?: PdfOptions): Promise<Buffer> {
  const browser = await getBrowser();
  let page: Page | null = null;

  try {
    page = await browser.newPage();

    // Emulate print media type to ensure CSS @media print is applied
    await page.emulateMediaType("print");

    // Set content and wait until network is idle to ensure all assets (fonts, images) are loaded
    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    });

    // Check for overflow: A4 height at 96DPI is ~1123px.
    // 2 pages = 2246px. We add a small buffer (4px) to evaluate strictly 2 pages.
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollHeight > 2250;
    });

    if (isOverflowing) {
      throw new Error("Certificate content exceeds the A4 page boundary. Generation failed.");
    }

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options?.format || "A4",
      landscape: false,
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
  }
}

// Graceful shutdown helper
export async function closePdfEngine() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
