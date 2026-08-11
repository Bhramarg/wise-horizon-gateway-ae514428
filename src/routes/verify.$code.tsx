import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleX, ShieldCheck } from "lucide-react";

import { verifyCertificate } from "@/lib/portal.functions";

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
  const { data, isLoading } = useQuery({ queryKey: ["certificate", code], queryFn: () => verifyCertificate({ data: { code } }) });
  const valid = data?.status === "issued";
  return (
    <main className="mica-surface min-h-[72vh] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="acrylic rounded-sm p-8 md:p-12">
          <div className="flex items-center gap-3 text-azure"><ShieldCheck className="size-6" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Official verification</span></div>
          {isLoading ? <p className="mt-8 text-muted-foreground">Checking the WISE register…</p> : data ? (
            <>
              <div className={`mt-8 flex items-center gap-3 ${valid ? "text-azure" : "text-destructive"}`}>
                {valid ? <CheckCircle2 className="size-9" /> : <CircleX className="size-9" />}
                <h1 className="text-3xl font-light">{valid ? "Certificate verified" : "Certificate revoked"}</h1>
              </div>
              <dl className="mt-9 grid gap-5 border-t border-border pt-8 sm:grid-cols-2">
                <Item label="Learner" value={data.students?.full_name ?? "—"} />
                <Item label="Student number" value={data.students?.student_number ?? "—"} />
                <Item label="Qualification" value={data.qualification} />
                <Item label="Academic period" value={data.academic_period} />
                <Item label="Institution" value={data.institutions?.name ?? "—"} />
                <Item label="Grade" value={data.grade ?? "—"} />
              </dl>
              <p className="mt-8 break-all text-xs text-muted-foreground">Verification code: {data.verification_code}</p>
            </>
          ) : (
            <div className="mt-8"><CircleX className="size-9 text-destructive" /><h1 className="mt-4 text-3xl font-light text-navy">No certificate found</h1><p className="mt-3 text-muted-foreground">This code does not match an issued WISE certificate.</p></div>
          )}
          <Link to="/" className="mt-10 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-azure">Return to WISE</Link>
        </div>
      </div>
    </main>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt><dd className="mt-1 text-base text-navy">{value}</dd></div>;
}