import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  BookOpen,
  Building2,

  CheckCircle2,
  LayoutDashboard,
  Radio,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createDmsUser, createInstitution, deleteResult, updateResultStatus } from "@/lib/portal.functions";
import { Empty, Field, Metric, Panel, StatusChip, Surface, type Overview } from "@/components/portal/shell";
import { SubjectCatalogue } from "@/components/portal/SubjectCatalogue";

import { errorMessage } from "@/lib/utils";

const DECISIONS = [
  { status: "issued", label: "Approve & issue" },
  { status: "review_required", label: "Review required" },
  { status: "on_hold", label: "Hold" },
  { status: "revoked", label: "Revoke" },
] as const;

export function AdminWorkspace({ data, refresh }: { data: Overview; refresh: () => Promise<unknown> }) {
  const institutionFn = useServerFn(createInstitution);
  const dmsFn = useServerFn(createDmsUser);
  const statusFn = useServerFn(updateResultStatus);
  const deleteFn = useServerFn(deleteResult);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState<Record<string, string>>({});

  const queue = data.results.filter((item) => ["submitted", "on_hold", "review_required"].includes(item.status));
  const issued = data.results.filter((item) => item.status === "issued");

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      setMessage("");
      await action();
      setMessage(success);
      await refresh();
    } catch (e) {
      setMessage(errorMessage(e, "The request failed."));
    }
  }

  return (
    <Tabs defaultValue="overview" className="mt-6 gap-6">
      <TabsList className="h-auto flex-wrap gap-1 rounded-xl bg-card/70 p-1 backdrop-blur-xl">
        <TabsTrigger value="overview" className="gap-2 rounded-lg px-4 py-2 text-xs">
          <LayoutDashboard className="size-4" /> Overview
        </TabsTrigger>
        <TabsTrigger value="queue" className="gap-2 rounded-lg px-4 py-2 text-xs">
          <ShieldCheck className="size-4" /> Evaluation queue ({queue.length})
        </TabsTrigger>
        <TabsTrigger value="registry" className="gap-2 rounded-lg px-4 py-2 text-xs">
          <Award className="size-4" /> Issued registry
        </TabsTrigger>
        <TabsTrigger value="institutions" className="gap-2 rounded-lg px-4 py-2 text-xs">
          <Building2 className="size-4" /> Institutions
        </TabsTrigger>
        <TabsTrigger value="subjects" className="gap-2 rounded-lg px-4 py-2 text-xs">
          <BookOpen className="size-4" /> Subjects
        </TabsTrigger>
        <TabsTrigger value="accounts" className="gap-2 rounded-lg px-4 py-2 text-xs">
          <UserPlus className="size-4" /> Accounts
        </TabsTrigger>
      </TabsList>


      {message ? <Surface className="p-4 text-sm text-muted-foreground">{message}</Surface> : null}

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Building2} label="Institutions" value={data.institutions.length} />
          <Metric icon={Users} label="Learners" value={data.students.length} />
          <Metric icon={ShieldCheck} label="Awaiting decision" value={queue.length} hint="queue" />
          <Metric icon={Radio} label="NTAG assets" value={data.tags.length} />
        </div>
        <Panel title="Latest submissions" icon={Award}>
          {data.results.length ? (
            <div className="divide-y divide-border/60">
              {data.results.slice(0, 8).map((result) => (
                <div key={result.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{result.students?.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {result.qualification} · {result.academic_period}
                    </p>
                  </div>
                  <StatusChip status={result.status} />
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No submissions yet." />
          )}
        </Panel>
      </TabsContent>

      <TabsContent value="queue">
        <Panel title="Evaluation queue" description="Approve, hold, request review, revoke or delete a dossier." icon={ShieldCheck}>
          {queue.length ? (
            <div className="divide-y divide-border/60">
              {queue.map((result) => (
                <div key={result.id} className="space-y-3 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{result.students?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.qualification} · {result.academic_period} · {result.total ?? 0}% · {result.grade ?? "Ungraded"}
                      </p>
                    </div>
                    <StatusChip status={result.status} />
                  </div>
                  <Input
                    placeholder="Decision note (optional)"
                    value={note[result.id] ?? ""}
                    onChange={(event) => setNote((rows) => ({ ...rows, [result.id]: event.target.value }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    {DECISIONS.map((decision) => (
                      <Button
                        key={decision.status}
                        size="sm"
                        variant={decision.status === "issued" ? "default" : "outline"}
                        onClick={() =>
                          run(
                            () =>
                              statusFn({
                                data: { resultId: result.id, status: decision.status, note: note[result.id] || undefined },
                              }),
                            `Dossier marked ${decision.label.toLowerCase()}.`,
                          )
                        }
                      >
                        {decision.status === "issued" ? <CheckCircle2 /> : null} {decision.label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => run(() => deleteFn({ data: { resultId: result.id } }), "Dossier deleted.")}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Nothing is waiting for an evaluation decision." />
          )}
        </Panel>
      </TabsContent>

      <TabsContent value="registry">
        <Panel title="Issued registry" description="Approved awards with active public verification." icon={Award}>
          {issued.length ? (
            <div className="divide-y divide-border/60">
              {issued.map((result) => (
                <div key={result.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="text-sm font-medium">{result.students?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{result.verification_code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={result.status} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        run(
                          () => statusFn({ data: { resultId: result.id, status: "revoked", note: "Revoked by WISE" } }),
                          "Award revoked.",
                        )
                      }
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No awards issued yet." />
          )}
        </Panel>
      </TabsContent>

      <TabsContent value="institutions" className="grid gap-6 xl:grid-cols-2">
        <Panel title="Add institution" icon={Building2}>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void run(
                () => institutionFn({ data: { name: String(form.get("name") ?? ""), code: String(form.get("code") ?? "") } }),
                "Institution created.",
              );
              event.currentTarget.reset();
            }}
          >
            <Field label="Institution name">
              <Input name="name" required />
            </Field>
            <Field label="Centre code">
              <Input name="code" required placeholder="CH-GVA-01" />
            </Field>
            <Button type="submit">Create institution</Button>
          </form>
        </Panel>
        <Panel title="Registered institutions" icon={Building2}>
          {data.institutions.length ? (
            <div className="divide-y divide-border/60">
              {data.institutions.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.code}</p>
                  </div>
                  <StatusChip status={item.active ? "approved" : "on_hold"} />
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No institutions registered." />
          )}
        </Panel>
      </TabsContent>

      <TabsContent value="subjects">
        <SubjectCatalogue data={data} refresh={refresh} />
      </TabsContent>

      <TabsContent value="accounts">

        <Panel title="Create DMS account" description="Temporary password with a mandatory change at first sign-in." icon={UserPlus}>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void run(
                () =>
                  dmsFn({
                    data: {
                      email: String(form.get("email") ?? ""),
                      password: String(form.get("password") ?? ""),
                      institutionId: String(form.get("institutionId") ?? ""),
                    },
                  }),
                "DMS account created.",
              );
            }}
          >
            <Field label="Account email">
              <Input name="email" type="email" required />
            </Field>
            <Field label="Temporary password">
              <Input name="password" type="password" minLength={8} required />
            </Field>
            <Field label="Assign institution">
              <select name="institutionId" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select institution</option>
                {data.institutions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <Button type="submit">Create and assign</Button>
            </div>
          </form>
        </Panel>
      </TabsContent>
    </Tabs>
  );
}
