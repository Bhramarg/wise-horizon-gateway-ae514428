import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, Clock, Download, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { getPortalOverview } from "@/lib/portal.functions";
import { Panel } from "@/components/portal/shell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/sessions")({
  head: () => ({
    meta: [{ title: "Examination Sessions | WISE Portal" }],
  }),
  component: SessionsPage,
});

const SESSIONS = [
  {
    name: "Spring Session",
    period: "March - May 2026",
    registrationDeadline: "February 15, 2026",
    examDates: "April 1-30, 2026",
    resultsRelease: "May 15, 2026",
    status: "Open",
    subjects: ["Mathematics", "Sciences", "Languages", "Humanities"]
  },
  {
    name: "Summer Session", 
    period: "June - August 2026",
    registrationDeadline: "May 15, 2026",
    examDates: "July 1-31, 2026",
    resultsRelease: "August 15, 2026",
    status: "Upcoming",
    subjects: ["All Subjects Available"]
  },
  {
    name: "Autumn Session",
    period: "September - November 2026", 
    registrationDeadline: "August 15, 2026",
    examDates: "October 1-31, 2026",
    resultsRelease: "November 15, 2026",
    status: "Upcoming",
    subjects: ["Mathematics", "Sciences", "Business Studies"]
  }
];

const TIMEZONES = [
  { region: "Americas", timezone: "UTC-5 to UTC-8", window: "9:00 AM - 11:00 PM" },
  { region: "Europe/Africa", timezone: "UTC+0 to UTC+3", window: "8:00 AM - 10:00 PM" },
  { region: "Asia/Pacific", timezone: "UTC+5 to UTC+12", window: "7:00 AM - 9:00 PM" },
  { region: "Middle East", timezone: "UTC+3 to UTC+4", window: "8:00 AM - 10:00 PM" }
];

function SessionsPage() {
  const overviewFn = useServerFn(getPortalOverview);
  const { data, isLoading } = useQuery({ queryKey: ["portal-overview"], queryFn: () => overviewFn() });

  if (isLoading || !data) return null;

  return (
    <PortalLayout data={data}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Examination Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your centre's upcoming examination schedules and windows.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 size-4" /> Download Timetable</Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {SESSIONS.map((session, index) => (
              <Panel key={index} title={session.name} description={session.period} icon={Calendar}>
                <div className="absolute right-4 top-4">
                  <Badge variant={session.status === "Open" ? "default" : "secondary"}>
                    {session.status}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Registration Deadline</p>
                    <p className="text-sm font-medium">{session.registrationDeadline}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Exam Dates</p>
                    <p className="text-sm font-medium">{session.examDates}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Results Release</p>
                    <p className="text-sm font-medium">{session.resultsRelease}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {session.subjects.slice(0, 2).map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                      {session.subjects.length > 2 && (
                        <Badge variant="outline" className="text-[10px]">+{session.subjects.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" size="sm">Manage Candidates</Button>
                  {session.status === "Open" && <Button size="sm">Register Students</Button>}
                </div>
              </Panel>
            ))}
          </div>

          <div className="space-y-6">
            <Panel title="Global Time Zones & Windows" description="Approved time windows for examinations" icon={Globe}>
              <div className="divide-y divide-border/60">
                {TIMEZONES.map((zone, index) => (
                  <div key={index} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">{zone.region}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{zone.timezone}</span>
                      <span className="font-medium text-foreground">{zone.window}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Important Notes" icon={Clock}>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Examination Duration</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Mathematics: 3 hours</li>
                    <li>Sciences: 2.5 hours each</li>
                    <li>Languages: 2 hours each</li>
                    <li>Humanities: 2.5 hours each</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Centre Requirements</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Stable internet connection (minimum 10 Mbps) per workstation</li>
                    <li>NTAG scanner available for student identity verification</li>
                    <li>Invigilator to candidate ratio must not exceed 1:30</li>
                  </ul>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
