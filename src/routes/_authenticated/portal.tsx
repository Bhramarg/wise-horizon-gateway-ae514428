import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import { Award, Building2, CheckCircle2, ContactRound, LogOut, Radio, ShieldCheck, Smartphone, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { updateResultStatus, claimFirstAdmin, createDmsUser, createInstitution, createResult, createStudent, getPortalOverview, prepareCertificateTag, recordTagWrite } from "@/lib/portal.functions";
import wiseLogo from "@/assets/wise-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({ meta: [
    { title: "WISE Administration Portal" },
    { name: "description", content: "Secure WISE administration portal for institutions, learners, results and certificates." },
    { property: "og:title", content: "WISE Administration Portal" },
    { property: "og:description", content: "Secure institutional result and certificate administration." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Portal,
});

function Portal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const overviewFn = useServerFn(getPortalOverview);
  const claimFn = useServerFn(claimFirstAdmin);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.["must_change_password"]) {
        navigate({ to: "/change-password", replace: true });
      }
    });
  }, [navigate]);
  const { data, isLoading, error } = useQuery({ queryKey: ["portal-overview"], queryFn: () => overviewFn() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["portal-overview"] });
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/my-wise", replace: true });
  }
  if (isLoading) return <Loading />;
  if (error || !data) return <PortalMessage title="Portal unavailable" body="The secure workspace could not be loaded." />;
  if (!data.role) return (
    <PortalMessage title="Access not assigned" body="This account has no WISE role. If this is the first account, claim initial administrator access; otherwise ask an existing administrator to assign you.">
      <Button onClick={async () => { await claimFn(); await refresh(); }}>Claim initial administrator</Button>
      <Button variant="outline" onClick={signOut}>Sign out</Button>
    </PortalMessage>
  );
  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <header className="border-b bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3"><img src={wiseLogo.url} alt="WISE seal" width={40} height={40} className="size-10 object-contain" /><div><p className="font-display text-sm font-semibold text-navy">WISE Operations</p><p className="text-xs text-muted-foreground">{data.role === "admin" ? "Administrator" : "DMS workspace"}</p></div></div>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:inline">{data.email}</span><Button variant="outline" size="sm" onClick={signOut}><LogOut /> Sign out</Button></div>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] px-5 py-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Building2} label="Institutions" value={data.institutions.length} />
          <Metric icon={Users} label="Students" value={data.students.length} />
          <Metric icon={Award} label="Results" value={data.results.length} />
          <Metric icon={Radio} label="NFC tags" value={data.tags.length} />
        </div>
        {data.role === "admin" ? <AdminWorkspace data={data} refresh={refresh} /> : <DmsWorkspace data={data} refresh={refresh} />}
      </div>
    </main>
  );
}

type Overview = Awaited<ReturnType<typeof getPortalOverview>>;

function AdminWorkspace({ data, refresh }: { data: Overview; refresh: () => Promise<unknown> }) {
  const createInstitutionFn = useServerFn(createInstitution);
  const createDmsFn = useServerFn(createDmsUser);
  const approveFn = useServerFn(updateResultStatus);
  const [message, setMessage] = useState("");
  const submitted = data.results.filter((result) => result.status === "submitted");
  async function run(action: () => Promise<unknown>, success: string) { try { setMessage(""); await action(); setMessage(success); await refresh(); } catch (e) { setMessage(e instanceof Error ? e.message : "The request failed."); } }
  return <div className="mt-7 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
    <section className="space-y-6">
      <Panel title="Add institution" icon={Building2}><Form onSubmit={(form) => run(() => createInstitutionFn({ data: { name: value(form, "name"), code: value(form, "code") } }), "Institution created.")}><Input name="name" placeholder="Institution name" required /><Input name="code" placeholder="Code, e.g. CH-GVA-01" required /><Button type="submit">Create institution</Button></Form></Panel>
      <Panel title="Create DMS account" icon={UserPlus}><Form onSubmit={(form) => run(() => createDmsFn({ data: { email: value(form, "email"), password: value(form, "password"), institutionId: value(form, "institutionId") } }), "DMS account created.")}><Input name="email" type="email" placeholder="Account email" required /><Input name="password" type="password" minLength={8} placeholder="Temporary password" required /><select name="institutionId" required className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Assign institution</option>{data.institutions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><Button type="submit">Create and assign</Button></Form></Panel>
      {message ? <p className="rounded-sm border bg-background p-3 text-sm text-muted-foreground">{message}</p> : null}
    </section>
    <section className="space-y-6">
      <Panel title={`Approval queue (${submitted.length})`} icon={ShieldCheck}>{submitted.length ? <div className="divide-y">{submitted.map((result) => <div key={result.id} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"><div><p className="font-medium text-navy">{result.students?.full_name}</p><p className="text-sm text-muted-foreground">{result.qualification} · {result.academic_period} · {result.grade ?? "Ungraded"}</p></div><Button size="sm" onClick={() => run(() => approveFn({ data: { status: "approved", resultId: result.id } }), "Result approved and issued.")}><CheckCircle2 /> Approve & issue</Button></div>)}</div> : <Empty text="No submitted results are waiting for approval." />}</Panel>
      <Panel title="Institutions" icon={Building2}><div className="divide-y">{data.institutions.map((item) => <div key={item.id} className="flex items-center justify-between py-3"><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.code}</p></div><span className="text-xs text-azure">{item.active ? "Active" : "Inactive"}</span></div>)}</div></Panel>
    </section>
  </div>;
}

function DmsWorkspace({ data, refresh }: { data: Overview; refresh: () => Promise<unknown> }) {
  const studentFn = useServerFn(createStudent);
  const resultFn = useServerFn(createResult);
  const prepareFn = useServerFn(prepareCertificateTag);
  const writtenFn = useServerFn(recordTagWrite);
  const institutionId = data.memberships.find((item) => item.active)?.institution_id ?? data.institutions[0]?.id ?? "";
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState<{ id: string; writePayload: string } | null>(null);
  const issued = data.results.filter((item) => item.status === "issued");
  async function run(action: () => Promise<unknown>, success: string) { try { setMessage(""); await action(); setMessage(success); await refresh(); } catch (e) { setMessage(e instanceof Error ? e.message : "The request failed."); } }
  return <div className="mt-7 grid gap-6 xl:grid-cols-2">
    <section className="space-y-6">
      <Panel title="Add student" icon={ContactRound}><Form onSubmit={(form) => run(() => studentFn({ data: { institutionId, fullName: value(form, "fullName"), studentNumber: value(form, "studentNumber"), programme: value(form, "programme"), dateOfBirth: value(form, "dateOfBirth") || undefined } }), "Student added.")}><div className="grid gap-3 sm:grid-cols-2"><Input name="fullName" placeholder="Full legal name" required /><Input name="studentNumber" placeholder="Student number" required /><Input name="programme" placeholder="Programme" required /><Input name="dateOfBirth" type="date" /></div><Button type="submit" disabled={!institutionId}>Add student</Button></Form></Panel>
      <Panel title="Build marksheet" icon={Award}><Form onSubmit={(form) => { const marks = value(form, "marks").split("\n").map((line) => { const [subject, score] = line.split(":"); return { subject: subject?.trim() ?? "", score: Number(score) }; }).filter((item) => item.subject && Number.isFinite(item.score)); return run(() => resultFn({ data: { institutionId, studentId: value(form, "studentId"), qualification: value(form, "qualification"), academicPeriod: value(form, "academicPeriod"), marks, submit: value(form, "action") === "submit" } }), value(form, "action") === "submit" ? "Marksheet submitted for approval." : "Draft marksheet saved."); }}><select name="studentId" required className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select student</option>{data.students.map((item) => <option key={item.id} value={item.id}>{item.full_name} · {item.student_number}</option>)}</select><div className="grid gap-3 sm:grid-cols-2"><Input name="qualification" placeholder="Qualification" required /><Input name="academicPeriod" placeholder="Academic period" required /></div><textarea name="marks" required rows={5} placeholder={"Mathematics: 82\nEnglish: 76\nScience: 88"} className="w-full rounded-md border bg-background p-3 text-sm" /><div className="flex gap-3"><Button type="submit" name="action" value="draft" variant="outline">Save draft</Button><Button type="submit" name="action" value="submit">Submit for approval</Button></div></Form></Panel>
    </section>
    <section className="space-y-6">
      <Panel title="Issued certificates" icon={ShieldCheck}>{issued.length ? <div className="divide-y">{issued.map((result) => <div key={result.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="font-medium">{result.students?.full_name}</p><p className="text-sm text-muted-foreground">{result.qualification} · {result.verification_code}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={async () => { const url = `${window.location.origin}/verify/${result.verification_code}`; const image = await QRCode.toDataURL(url, { width: 800, margin: 2 }); const link = document.createElement("a"); link.href = image; link.download = `WISE-${result.verification_code}.png`; link.click(); }}>QR</Button><Button size="sm" onClick={async () => { const prepared = await prepareFn({ data: { resultId: result.id, origin: window.location.origin } }); setTag(prepared); }}>Prepare NFC</Button></div></div>)}</div> : <Empty text="Approved certificates appear here for QR and NFC encoding." />}</Panel>
      {tag ? <NfcWriter tag={tag} onRecorded={async (serial, locked) => { await writtenFn({ data: { tagId: tag.id, serialNumber: serial, locked } }); setTag(null); setMessage("NFC tag written and recorded."); await refresh(); }} /> : null}
      {message ? <p className="rounded-sm border bg-background p-3 text-sm text-muted-foreground">{message}</p> : null}
      <Panel title="Recent results" icon={Award}><div className="divide-y">{data.results.map((result) => <div key={result.id} className="flex items-center justify-between py-3"><div><p className="font-medium">{result.students?.full_name}</p><p className="text-xs text-muted-foreground">{result.qualification}</p></div><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">{result.status}</span></div>)}</div></Panel>
    </section>
  </div>;
}

function NfcWriter({ tag, onRecorded }: { tag: { id: string; writePayload: string }; onRecorded: (serial?: string, locked?: boolean) => Promise<void> }) {
  const supported = typeof window !== "undefined" && "NDEFReader" in window;
  const [pending, setPending] = useState(false);
  const write = async () => { setPending(true); try { const Reader = (window as unknown as { NDEFReader: new () => { write: (message: { records: Array<{ recordType: string; data: string }> }) => Promise<void> } }).NDEFReader; const reader = new Reader(); await reader.write({ records: [{ recordType: "url", data: tag.writePayload }] }); await onRecorded(undefined, false); } finally { setPending(false); } };
  return <Panel title="Write NTAG certificate" icon={Smartphone}><p className="break-all text-sm text-muted-foreground">{tag.writePayload}</p><p className="mt-3 text-xs text-muted-foreground">Web NFC requires a compatible Android browser over HTTPS. Hold the physical NTAG near the phone only after pressing write.</p><Button className="mt-4" disabled={!supported || pending} onClick={write}>{pending ? "Hold tag near device…" : supported ? "Write physical NTAG" : "Web NFC unavailable"}</Button></Panel>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Award; children: ReactNode }) { return <section className="rounded-md border bg-background p-5 shadow-sm"><div className="mb-5 flex items-center gap-2"><Icon className="size-4 text-azure" /><h2 className="font-display text-sm font-semibold text-navy">{title}</h2></div>{children}</section>; }
function Form({ onSubmit, children }: { onSubmit: (form: FormData) => void | Promise<void>; children: ReactNode }) { return <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void onSubmit(new FormData(event.currentTarget)); }}>{children}</form>; }
function value(form: FormData, key: string) { return String(form.get(key) ?? ""); }
function Metric({ icon: Icon, label, value: count }: { icon: typeof Award; label: string; value: number }) { return <div className="rounded-md border bg-background p-5"><Icon className="size-5 text-azure" /><p className="mt-4 text-3xl font-light text-navy">{count}</p><p className="text-sm text-muted-foreground">{label}</p></div>; }
function Empty({ text }: { text: string }) { return <p className="py-8 text-center text-sm text-muted-foreground">{text}</p>; }
function Loading() { return <main className="grid min-h-screen place-items-center bg-muted/40"><p className="text-sm text-muted-foreground">Opening secure workspace…</p></main>; }
function PortalMessage({ title, body, children }: { title: string; body: string; children?: ReactNode }) { return <main className="mica-surface grid min-h-screen place-items-center px-6"><div className="acrylic max-w-lg rounded-sm p-9"><ShieldCheck className="size-8 text-azure" /><h1 className="mt-5 text-3xl font-light text-navy">{title}</h1><p className="mt-3 text-muted-foreground">{body}</p>{children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : null}</div></main>; }