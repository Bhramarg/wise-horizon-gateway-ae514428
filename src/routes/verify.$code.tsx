import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, CircleX, Clock, Download, ShieldCheck, FileDown } from "lucide-react";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redeemPortfolio, verifyCertificate, getCertificateLayoutPublic, fetchDriveImageAsBase64 } from "@/lib/portal.functions";
import { errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/verify/$code")({
  head: () => ({
    meta: [
      { title: "Verify a WISE certificate" },
      { name: "description", content: "Verify the authenticity and current status of a WISE result or certificate." },
      { property: "og:title", content: "WISE Certificate Verification" },
      { property: "og:description", content: "Official public verification for WISE certificates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { code } = Route.useParams();
  const token = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("t") ?? undefined) : undefined;
  const { data, isLoading } = useQuery({
    queryKey: ["certificate", code, token ?? ""],
    queryFn: () => verifyCertificate({ data: token ? { code, token } : { code } }),
  });
  const [key, setKey] = useState("");
  const [portfolioMessage, setPortfolioMessage] = useState("");

  async function download() {
    try {
      setPortfolioMessage("");
      const { url } = await redeemPortfolio({ data: { code, key } });
      window.open(url, "_blank", "noopener");
    } catch (error) {
      setPortfolioMessage(errorMessage(error, "The portfolio key could not be verified."));
    }
  }

  const getLayoutFn = useServerFn(getCertificateLayoutPublic);
  const fetchImageFn = useServerFn(fetchDriveImageAsBase64);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  async function generatePdf() {
    if (!data) return;
    try {
      setIsGeneratingPdf(true);
      setPortfolioMessage("");
      
      // We still need the portfolio key to be verified first before downloading the certificate.
      // We can just verify it by calling redeemPortfolio even if we don't use the URL.
      // Or we can just use the key if that's the logic. For now let's verify key.
      await redeemPortfolio({ data: { code, key } });

      const layout = await getLayoutFn({ data: { level: data.qualification } });
      if (!layout || !layout.background_url) {
        throw new Error("No certificate template found for this qualification.");
      }

      const { base64 } = await fetchImageFn({ data: { url: layout.background_url } });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [842, 595] // A4 landscape roughly
      });

      pdf.addImage(base64, "JPEG", 0, 0, 842, 595);

      const fields = layout.fields as any[];
      fields.forEach(f => {
        let text = "";
        // Map common field names to data
        const n = f.name.toLowerCase();
        if (n.includes("name") || n.includes("learner")) text = data.learner;
        else if (n.includes("qualification")) text = data.qualification;
        else if (n.includes("grade")) text = data.grade || "";
        else if (n.includes("institution")) text = data.institution;
        else if (n.includes("number")) text = data.studentNumber;
        else if (n.includes("period")) text = data.academicPeriod;
        else if (n.includes("code")) text = data.verificationCode;
        else text = f.name; // fallback to the placeholder name

        if (!text) return;

        // Approximate styling mapping
        pdf.setTextColor(f.color);
        pdf.setFontSize(f.fontSize * 0.7); // Approximate scaling
        
        let fontStyle = "normal";
        if (f.bold && f.italic) fontStyle = "bolditalic";
        else if (f.bold) fontStyle = "bold";
        else if (f.italic) fontStyle = "italic";
        pdf.setFont(f.fontFamily === "cursive" ? "times" : "helvetica", fontStyle);

        const x = f.xPct * 842;
        const y = f.yPct * 595;
        const maxWidth = f.widthPct * 842;

        pdf.text(text, x, y, { align: f.align, maxWidth });
      });

      pdf.save(`${data.learner.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      setPortfolioMessage(errorMessage(error, "Could not generate PDF certificate."));
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <main className="mica-surface min-h-[72vh] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="acrylic rounded-sm p-8 md:p-12">
          <div className="flex items-center gap-3 text-azure">
            <ShieldCheck className="size-6" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Official verification</span>
          </div>

          {isLoading ? (
            <p className="mt-8 text-muted-foreground">Checking the WISE register…</p>
          ) : data ? (
            <>
              <div
                className={`mt-8 flex items-center gap-3 ${data.state === "approved" ? "text-azure" : data.state === "pending" ? "text-muted-foreground" : "text-destructive"}`}
              >
                {data.state === "approved" ? (
                  <CheckCircle2 className="size-9" />
                ) : data.state === "pending" ? (
                  <Clock className="size-9" />
                ) : (
                  <CircleX className="size-9" />
                )}
                <h1 className="text-3xl font-light">
                  {data.state === "approved" ? "Certificate verified" : data.state === "pending" ? "Result under evaluation" : "Certificate revoked"}
                </h1>
              </div>

              {data.state === "pending" ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  This record exists in the WISE register but has not yet been approved by the awarding authority. Full marks are withheld
                  until evaluation is complete.
                </p>
              ) : null}

              <dl className="mt-9 grid gap-5 border-t border-border pt-8 sm:grid-cols-2">
                <Item label="Learner" value={data.learner} />
                <Item label="Student number" value={data.studentNumber} />
                <Item label="Qualification" value={data.qualification} />
                <Item label="Academic period" value={data.academicPeriod} />
                <Item label="Institution" value={data.institution} />
                <Item label="Grade" value={data.grade ?? (data.state === "approved" ? "Scan the certificate NTAG" : "Withheld")} />
              </dl>

              {data.fullAccess && data.marks ? (
                <div className="mt-9 border-t border-border pt-8">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Full marksheet</p>
                  <table className="mt-4 w-full text-sm">
                    <tbody>
                      {data.marks.map((mark) => (
                        <tr key={mark.subject} className="border-b border-border/60">
                          <td className="py-2 text-navy">{mark.subject}</td>
                          <td className="py-2 text-right text-muted-foreground">
                            {mark.score} / {mark.maxScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-4 text-sm text-navy">
                    Aggregate {data.total}% · Grade {data.grade}
                  </p>
                </div>
              ) : data.state === "approved" ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  Scan the NTAG embedded in the physical certificate with an NFC-capable device to open the complete marksheet.
                </p>
              ) : null}

              {data.state === "approved" && data.hasPortfolio ? (
                <div className="mt-9 border-t border-border pt-8">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Learner portfolio</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input value={key} onChange={(event) => setKey(event.target.value)} placeholder="Portfolio key, e.g. aa0AA0aA00" />
                    <Button onClick={download} disabled={key.trim().length < 6}>
                      <Download /> Portfolio
                    </Button>
                    <Button onClick={generatePdf} disabled={key.trim().length < 6 || isGeneratingPdf} variant="secondary">
                      <FileDown /> {isGeneratingPdf ? "Generating..." : "Certificate"}
                    </Button>
                  </div>
                  {portfolioMessage ? <p className="mt-2 text-sm text-destructive">{portfolioMessage}</p> : null}
                </div>
              ) : null}

              <p className="mt-8 break-all text-xs text-muted-foreground">Verification code: {data.verificationCode}</p>
            </>
          ) : (
            <div className="mt-8">
              <CircleX className="size-9 text-destructive" />
              <h1 className="mt-4 text-3xl font-light text-navy">No certificate found</h1>
              <p className="mt-3 text-muted-foreground">This code does not match a record in the WISE register.</p>
            </div>
          )}

          <Link to="/" className="mt-10 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-azure">
            Return to WISE
          </Link>
        </div>
      </div>
    </main>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base text-navy">{value}</dd>
    </div>
  );
}
