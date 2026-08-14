import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { getPortalOverview } from "@/lib/portal.functions";
import { Panel, Surface, Metric } from "@/components/portal/shell";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [{ title: "Self-Evaluation Reports | WISE Portal" }],
  }),
  component: ReportsPage,
});

const AUDIT_DOMAINS = [
  "Governance & Leadership",
  "Curriculum Delivery",
  "Faculty Qualifications & Development",
  "Assessment & Evaluation",
  "Student Support Services",
  "Infrastructure & Facilities",
  "Health, Safety & Wellbeing",
  "Administrative Systems",
  "Student Outcomes",
  "Quality Culture & Improvement"
];

function ReportsPage() {
  const overviewFn = useServerFn(getPortalOverview);
  const { data, isLoading } = useQuery({ queryKey: ["portal-overview"], queryFn: () => overviewFn() });

  if (isLoading || !data) return null;

  return (
    <PortalLayout data={data}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Self-Evaluation Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit and track your institution's annual quality compliance reports.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric icon={FileText} label="Reports Submitted" value={0} />
          <Metric icon={ShieldCheck} label="Latest Score" value="N/A" />
          <Metric icon={Upload} label="Next Due" value="Oct 2026" />
        </div>

        <Panel title="New Self-Evaluation" description="Assess your centre against the WEQSC 10-domain framework" icon={FileText}>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              {AUDIT_DOMAINS.map((domain, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg bg-card/50">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{index + 1}. {domain}</p>
                    <p className="text-xs text-muted-foreground">Rate your compliance and provide evidence.</p>
                  </div>
                  <div className="flex gap-2">
                    <select className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select rating</option>
                      <option value="4">4 - Exemplary</option>
                      <option value="3">3 - Proficient</option>
                      <option value="2">2 - Developing</option>
                      <option value="1">1 - Inadequate</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">Save Draft</Button>
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </Panel>
      </div>
    </PortalLayout>
  );
}
