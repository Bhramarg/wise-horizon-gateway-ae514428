import { useCallback, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import QRCode from "qrcode";
import {
  Award,
  CheckCircle2,
  CloudUpload,
  FileSpreadsheet,
  FileText,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Loader2,
  QrCode,
  Radio,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  attachPortfolioFile,
  createResult,
  createStudent,
  generatePortfolioKey,
  prepareCertificateTag,
  recordTagWrite,
  submitResult,
  testCertificateTag,
  deleteDraftResult,
} from "@/lib/portal.functions";
import { Empty, Field, Metric, Panel, StatusChip, StepRail, Surface, type Overview } from "@/components/portal/shell";
import { errorMessage } from "@/lib/utils";

const STEPS = [
  { key: "student", label: "Learner record", icon: UserPlus },
  { key: "marksheet", label: "Marksheet", icon: Award },
  { key: "documents", label: "Portfolio documents", icon: FileText },
  { key: "portfolio-key", label: "Document secret token", icon: KeyRound },
  { key: "nfc", label: "NTAG generation & write", icon: Radio },
  { key: "submit", label: "Push for evaluation", icon: CloudUpload },
] as const;

const TEMPLATE = `full_name,student_number,programme,date_of_birth,caste,face_id_number,address,guardian_name,guardian_relation,guardian_occupation,guardian_contact
Anaya Sharma,WISE-2026-001,Secondary Diploma,2008-04-12,General,FID-8891,"12 Rue du Lac, Geneva",Rakesh Sharma,Father,Engineer,+41 79 000 0000
Liam Meier,WISE-2026-002,Secondary Diploma,2007-11-03,,FID-8892,"5 Bahnhofstrasse, Zurich",Nina Meier,Mother,Physician,+41 78 111 1111
`;

async function uploadTo(bucket: "student-files" | "portfolios", folder: string, file: File) {
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

type Guardian = { relation: string; name: string; occupation?: string; contact?: string };
type MarkRow = { subject: string; score: string; maxScore: string; code?: string; category?: string; passing?: number };
type SubjectRow = Overview["subjects"][number];

const LEVELS = [
  { id: "L2", name: "L2 - Secondary Examination" },
  { id: "L3", name: "L3 - Higher Secondary Examination" }
];

const STREAMS = [
  { id: "all", name: "All Subjects (Default)", codes: [] },
  { id: "science", name: "Science", codes: ["0533", "0531", "0541", "0511", "0512", "0613"] },
  { id: "commerce", name: "Commerce", codes: ["0411", "0413", "0311", "0410", "0412"] },
  { id: "arts", name: "Arts / Humanities", codes: ["0222", "0312", "0314", "0313", "0532", "0421"] }
];
const selectClass = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-70";


const toRow = (subject: SubjectRow): MarkRow => ({
  subject: subject.name,
  code: subject.code,
  category: subject.category,
  passing: subject.passing_marks,
  score: "",
  maxScore: String(subject.total_marks),
});


export function DmsWorkspace({ data, refresh }: { data: Overview; refresh: () => Promise<unknown> }) {
  const institutionId = data.memberships.find((item) => item.active)?.institution_id ?? data.institutions[0]?.id ?? "";
  const [tab, setTab] = useState("overview");
  const [draftId, setDraftId] = useState<string | null>(null);
  const pending = data.results.filter((item) => item.status === "submitted").length;
  const deleteDraftFn = useServerFn(deleteDraftResult);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredResults = data.results.filter(result => {
    const studentName = result.students?.full_name || "";
    const studentNumber = result.students?.student_number || "";
    const meta = result.students?.metadata as any;
    const rollNumber = meta?.roll_number || "";
    
    const matchesSearch = 
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = filterStatus === "all" || result.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Tabs value={tab} onValueChange={setTab} className="mt-6 gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <TabsList className="h-auto flex-wrap gap-1 rounded-xl bg-card/70 p-1 backdrop-blur-xl">
          <TabsTrigger value="overview" className="gap-2 rounded-lg px-4 py-2 text-xs">
            <LayoutDashboard className="size-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2 rounded-lg px-4 py-2 text-xs">
            <UserPlus className="size-4" /> New submission
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2 rounded-lg px-4 py-2 text-xs">
            <ListChecks className="size-4" /> Submissions
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2 rounded-lg px-4 py-2 text-xs">
            <FileSpreadsheet className="size-4" /> Bulk upload
          </TabsTrigger>
        </TabsList>
        <Button size="sm" onClick={() => { setDraftId(null); setTab("new"); }}>
          <UserPlus /> Add new student
        </Button>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Users} label="Learner records" value={data.students.length} />
          <Metric icon={Award} label="Marksheets" value={data.results.length} />
          <Metric icon={ShieldCheck} label="Under evaluation" value={pending} hint="admin" />
          <Metric icon={Radio} label="NTAG assets" value={data.tags.length} />
        </div>
        <Panel title="Recent activity" description="Latest marksheets prepared by this centre." icon={Award}>
          {data.results.length ? (
            <div className="divide-y divide-border/60">
              {data.results.slice(0, 8).map((result) => (
                <div key={result.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{result.students?.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {result.qualification} · {result.academic_period} · {result.grade ?? "Ungraded"}
                    </p>
                  </div>
                  <StatusChip status={result.status} />
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No marksheets yet. Start a new submission." />
          )}
        </Panel>
      </TabsContent>

      <TabsContent value="new">
        <SubmissionWizard 
          key={draftId || "new"} 
          data={data} 
          institutionId={institutionId} 
          refresh={refresh} 
          onBulk={() => setTab("bulk")} 
          onDraft={() => { setDraftId(null); setTab("submissions"); }}
          draftId={draftId}
        />
      </TabsContent>

      <TabsContent value="submissions">
        <Panel title="Submission status" description="Every marksheet and its evaluation state." icon={ListChecks}>
          <div className="flex gap-3 mb-4 flex-col sm:flex-row">
            <Input 
              placeholder="Search by name, hall ticket or roll number..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="issued">Issued / Approved</option>
              <option value="review_required">Review Required</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          {filteredResults.length ? (
            <div className="divide-y divide-border/60">
              {filteredResults.map((result) => {
                const meta = result.students?.metadata as any;
                const rollNumber = meta?.roll_number;
                const country = meta?.country || "No country";
                
                return (
                <div key={result.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{result.students?.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {rollNumber ? `Roll: ${rollNumber} · ` : ""}
                      Hall ticket: {result.students?.student_number} · {country} · Total: {result.total ?? 0}%
                      {result.review_note ? ` · ${result.review_note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={result.status} />
                    {result.status === "draft" ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => { setDraftId(result.id); setTab("new"); }}>
                          Edit / Continue
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                          disabled={deletingId === result.id}
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to delete this draft?")) return;
                            setDeletingId(result.id);
                            try {
                              await deleteDraftFn({ data: { resultId: result.id } });
                              await refresh();
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                        >
                          {deletingId === result.id ? <Loader2 className="animate-spin size-4" /> : "Delete"}
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => downloadQr(result.verification_code)}>
                        <QrCode /> QR
                      </Button>
                    )}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <Empty text="No matching submissions found." />
          )}
        </Panel>
      </TabsContent>

      <TabsContent value="bulk">
        <BulkUpload institutionId={institutionId} refresh={refresh} />
      </TabsContent>
    </Tabs>
  );
}

async function downloadQr(code: string) {
  const url = `${window.location.origin}/verify/${code}`;
  const image = await QRCode.toDataURL(url, { width: 900, margin: 2 });
  const link = document.createElement("a");
  link.href = image;
  link.download = `WISE-${code}.png`;
  link.click();
}

function SubmissionWizard({
  data,
  institutionId,
  refresh,
  onBulk,
  onDraft,
  draftId,
}: {
  data: Overview;
  institutionId: string;
  refresh: () => Promise<unknown>;
  onBulk: () => void;
  onDraft?: () => void;
  draftId?: string | null;
}) {
  const studentFn = useServerFn(createStudent);
  const resultFn = useServerFn(createResult);
  const portfolioFn = useServerFn(attachPortfolioFile);
  const keyFn = useServerFn(generatePortfolioKey);
  const prepareFn = useServerFn(prepareCertificateTag);
  const writtenFn = useServerFn(recordTagWrite);
  const testFn = useServerFn(testCertificateTag);
  const submitFn = useServerFn(submitResult);

  const draftContext = useMemo(() => draftId ? data.results.find(r => r.id === draftId) : null, [draftId, data.results]);
  const draftStudent = draftContext?.students as unknown as { 
    id?: string;
    student_number: string;
    full_name: string;
    programme: string;
    date_of_birth?: string | null;
    expires_at?: string | null;
    photo_path?: string | null;
    metadata?: any;
    caste?: string | null;
    birthmark?: string | null;
    face_id_number?: string | null;
    address?: string | null;
    guardians?: any;
  } | undefined;

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState(draftContext?.student_id || "");
  const [studentName, setStudentName] = useState(draftStudent?.full_name || "");
  const [result, setResult] = useState<{ id: string; verification_code: string; total: number | null; grade: string | null } | null>(
    draftContext ? { id: draftContext.id, verification_code: draftContext.verification_code, total: draftContext.total, grade: draftContext.grade } : null
  );
  const [portfolioPath, setPortfolioPath] = useState(draftContext?.portfolio_path || "");
  const [portfolioKey, setPortfolioKey] = useState("");
  const [tag, setTag] = useState<{ id: string; writePayload: string; tagPassword: string } | null>(null);
  const [tagWritten, setTagWritten] = useState(false);
  const [tagTest, setTagTest] = useState<"idle" | "pass" | "fail">("idle");
  const [pushed, setPushed] = useState(draftContext?.status === "submitted" || draftContext?.status === "issued");

  const [guardians, setGuardians] = useState<Guardian[]>(() => {
    if (draftStudent?.guardians && Array.isArray(draftStudent.guardians)) {
      return draftStudent.guardians as Guardian[];
    }
    return [{ relation: "Father", name: "" }, { relation: "Mother", name: "" }];
  });
  const [level, setLevel] = useState<string>(draftContext?.qualification || "L2");
  const [stream, setStream] = useState<string>("science");

  const getInitialMarks = useCallback((lvl: string, str: string) => {
    return data.subjects.filter((item) => {
      if (item.level !== lvl || !item.active) return false;
      if (item.category === "optional") return false;
      
      if (lvl === "L3" && str !== "all") {
        if (item.category === "fixed") return true;
        const activeStream = STREAMS.find(s => s.id === str);
        return activeStream?.codes.includes(item.code);
      }
      return true;
    }).map(toRow);
  }, [data.subjects]);

  const [marks, setMarks] = useState<MarkRow[]>(() => {
    if (draftContext?.marks && Array.isArray(draftContext.marks)) {
      return draftContext.marks as MarkRow[];
    }
    return getInitialMarks("L2", "science");
  });

  const optionalSubjects = data.subjects.filter(
    (item) => item.level === level && item.active && item.category === "optional" && !marks.some((row) => row.code === item.code),
  );

  const totals = useMemo(() => {
    const obtained = marks.reduce((sum, row) => sum + (Number(row.score) || 0), 0);
    const maximum = marks.reduce((sum, row) => sum + (Number(row.maxScore) || 0), 0);
    const percentage = maximum ? Math.round((obtained / maximum) * 10000) / 100 : 0;
    const grade =
      percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : percentage >= 40 ? "E" : "F";
    return { obtained, maximum, percentage, grade };
  }, [marks]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep(0);
    setStudentId("");
    setStudentName("");
    setResult(null);
    setPortfolioPath("");
    setPortfolioKey("");
    setTag(null);
    setTagWritten(false);
    setTagTest("idle");
    setPushed(false);
    setGuardians([
      { relation: "Father", name: "" },
      { relation: "Mother", name: "" },
    ]);
    setStream(level === "L3" ? "science" : "all");
    setMarks(getInitialMarks(level, level === "L3" ? "science" : "all"));
  }

  const nfcSupported = typeof window !== "undefined" && "NDEFReader" in window;

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <Surface className="h-fit p-4">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Canonical workflow</p>
        <StepRail steps={STEPS.map((item) => ({ ...item }))} current={step} onSelect={setStep} />
        <div className="mt-4 rounded-lg bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
          Every stage is sequential and cannot be reordered: learner record, marksheet, portfolio documents, document secret token,
          NTAG generation and write, then evaluation.
        </div>
      </Surface>

      <div className="space-y-4">
        {error ? <Surface className="border-destructive/40 p-4 text-sm text-destructive">{error}</Surface> : null}

        {step === 0 ? (
          <Panel title="Step 1 · Learner record" description="Held for 72 hours until a marksheet is generated." icon={UserPlus}>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const photo = form.get("photo") as File | null;
                const doc = form.get("prevDoc") as File | null;
                void run(async () => {
                  const photoPath = photo && photo.size ? await uploadTo("student-files", institutionId, photo) : undefined;
                  const docPath = doc && doc.size ? await uploadTo("student-files", institutionId, doc) : undefined;
                  const created = await studentFn({
                    data: {
                      id: studentId || undefined,
                      institutionId,
                      fullName: String(form.get("fullName") ?? ""),
                      studentNumber: String(form.get("studentNumber") ?? ""),
                      programme: String(form.get("programme") ?? ""),
                      dateOfBirth: String(form.get("dateOfBirth") ?? "") || undefined,
                      caste: String(form.get("caste") ?? "") || undefined,
                      birthmark: String(form.get("birthmark") ?? "") || undefined,
                      faceIdNumber: String(form.get("faceIdNumber") ?? "") || undefined,
                      address: String(form.get("address") ?? "") || undefined,
                      country: String(form.get("country") ?? "") || undefined,
                      gender: String(form.get("gender") ?? "") || undefined,
                      guardians: guardians.filter((item) => item.name.trim()),
                      photoPath,
                      prevSchoolDocPath: docPath,
                    },
                  });
                  setStudentId(created.id);
                  setStudentName(created.full_name);
                  setStep(1);
                  await refresh();
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full legal name">
                  <Input name="fullName" required placeholder="Anaya Sharma" defaultValue={draftStudent?.full_name} />
                </Field>
                <Field label="Examination hall ticket number" hint="Format: A0B0C0-123">
                  <Input name="studentNumber" required placeholder="A0A0A0-000" pattern="[A-Za-z]0[A-Za-z]0[A-Za-z]0-\d{3}" defaultValue={draftStudent?.student_number} title="Must be in format A0A0A0-000" />
                </Field>
                <Field label="Programme">
                  <Input name="programme" required placeholder="Secondary Diploma" defaultValue={draftStudent?.programme} />
                </Field>
                <Field label="Date of birth">
                  <Input name="dateOfBirth" type="date" defaultValue={draftStudent?.date_of_birth ?? ""} />
                </Field>
                <Field label="Country">
                  <Input name="country" placeholder="Switzerland" defaultValue={draftStudent?.metadata?.country ?? ""} />
                </Field>
                <Field label="Caste / category">
                  <Input name="caste" defaultValue={draftStudent?.caste ?? ""} />
                </Field>
                <Field label="Face ID number">
                  <Input name="faceIdNumber" defaultValue={draftStudent?.face_id_number ?? ""} />
                </Field>
                <Field label="Gender">
                  <select name="gender" defaultValue={draftStudent?.metadata?.gender ?? ""} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select...</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
                <Field label="Identifying birthmark">
                  <Input name="birthmark" defaultValue={draftStudent?.birthmark ?? ""} />
                </Field>
                <Field label="Residential address">
                  <Input name="address" defaultValue={draftStudent?.address ?? ""} />
                </Field>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guardian / parent / spouse</p>
                {guardians.map((guardian, index) => (
                  <div key={index} className="grid gap-3 sm:grid-cols-4">
                    <Input
                      placeholder="Relation"
                      value={guardian.relation}
                      onChange={(event) => setGuardians((rows) => rows.map((row, i) => (i === index ? { ...row, relation: event.target.value } : row)))}
                    />
                    <Input
                      placeholder="Name"
                      value={guardian.name}
                      onChange={(event) => setGuardians((rows) => rows.map((row, i) => (i === index ? { ...row, name: event.target.value } : row)))}
                    />
                    <Input
                      placeholder="Occupation"
                      value={guardian.occupation ?? ""}
                      onChange={(event) => setGuardians((rows) => rows.map((row, i) => (i === index ? { ...row, occupation: event.target.value } : row)))}
                    />
                    <Input
                      placeholder="Contact"
                      value={guardian.contact ?? ""}
                      onChange={(event) => setGuardians((rows) => rows.map((row, i) => (i === index ? { ...row, contact: event.target.value } : row)))}
                    />
                  </div>
                ))}
                {guardians.length < 4 ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setGuardians((rows) => [...rows, { relation: "", name: "" }])}>
                    Add guardian
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Passport size photograph" hint="JPG or PNG">
                  <Input name="photo" type="file" accept="image/*" />
                </Field>
                <Field label="Last attended school document" hint="PDF or image">
                  <Input name="prevDoc" type="file" accept="image/*,application/pdf" />
                </Field>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={busy || !institutionId}>
                  {busy ? <Loader2 className="animate-spin" /> : null} Save learner & continue
                </Button>
                <Button type="button" variant="ghost" onClick={onBulk}>
                  Bulk upload instead
                </Button>
                <Button type="button" variant="ghost" className="text-muted-foreground ml-auto" onClick={() => { reset(); onDraft?.(); }}>
                  Save as draft
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}

        {step === 1 ? (
          <Panel title="Step 2 · Marksheet" description={`Automatic percentage and grading for ${studentName || "the learner"}.`} icon={Award}>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(async () => {
                  const created = await resultFn({
                    data: {
                      id: result?.id || undefined,
                      institutionId,
                      studentId,
                      qualification: level,
                      academicPeriod: String(form.get("academicPeriod") ?? ""),
                      marks: marks
                        .filter((row) => row.subject.trim())
                        .map((row) => ({
                          subject: row.code ? `${row.code} · ${row.subject.trim()}` : row.subject.trim(),
                          score: Number(row.score),
                          maxScore: Number(row.maxScore),
                        })),
                      submit: false,
                    },
                  });
                  setResult(created);
                  setStep(2);
                  await refresh();
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="School / centre" hint="Fixed to your allotted centre">
                  <select disabled value={institutionId} className={selectClass}>
                    {data.institutions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.code})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Qualification level">
                  <select
                    value={level}
                    className={selectClass}
                    onChange={(event) => {
                      const next = event.target.value;
                      setLevel(next);
                      const defaultStream = next === "L3" ? "science" : "all";
                      setStream(defaultStream);
                      setMarks(getInitialMarks(next, defaultStream));
                    }}
                  >
                    {LEVELS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
                {level === "L3" && (
                  <Field label="Stream">
                    <select
                      value={stream}
                      className={selectClass}
                      onChange={(event) => {
                        const next = event.target.value;
                        setStream(next);
                        setMarks(getInitialMarks(level, next));
                      }}
                    >
                      {STREAMS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label="Academic period">
                  <Input name="academicPeriod" required placeholder="2025 / 2026" />
                </Field>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subjects · {level}</p>
                {marks.length ? null : (
                  <p className="text-xs text-muted-foreground">
                    No subjects are published for {level} yet. Ask a WISE administrator to define the {level} curriculum.
                  </p>
                )}
                {marks.map((row, index) => (
                  <div key={index} className="grid items-center gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.subject}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {row.code ?? "—"} · {row.category ?? "custom"}
                        {row.passing !== undefined ? ` · pass ${row.passing}` : ""}
                      </p>
                    </div>
                    <Input
                      type="number"
                      placeholder="Score"
                      max={Number(row.maxScore)}
                      value={row.score}
                      onChange={(event) => setMarks((rows) => rows.map((item, i) => (i === index ? { ...item, score: event.target.value } : item)))}
                    />
                    <Input type="number" readOnly value={row.maxScore} aria-label="Total marks" />
                    {row.category === "fixed" ? (
                      <span className="text-[11px] text-muted-foreground">fixed</span>
                    ) : (
                      <Button type="button" size="sm" variant="ghost" onClick={() => setMarks((rows) => rows.filter((_, i) => i !== index))}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {optionalSubjects.length ? (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Optional subjects</span>
                    {optionalSubjects.map((subject) => (
                      <Button
                        key={subject.id}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setMarks((rows) => [...rows, toRow(subject)])}
                      >
                        + {subject.code}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Surface className="p-4">
                  <p className="text-xs text-muted-foreground">Obtained</p>
                  <p className="font-display text-2xl font-semibold">{totals.obtained}/{totals.maximum}</p>
                </Surface>
                <Surface className="p-4">
                  <p className="text-xs text-muted-foreground">Percentage</p>
                  <p className="font-display text-2xl font-semibold">{totals.percentage}%</p>
                </Surface>
                <Surface className="p-4">
                  <p className="text-xs text-muted-foreground">Grade</p>
                  <p className="font-display text-2xl font-semibold text-azure">{totals.grade}</p>
                </Surface>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" /> : null} Generate marksheet & continue
                </Button>
                <Button type="button" variant="ghost" className="text-muted-foreground ml-auto" onClick={() => { reset(); onDraft?.(); }}>
                  Save as draft
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}

        {step === 2 ? (
          <Panel title="Step 3 · Portfolio documents" description="Upload the learner portfolio archive for gated public download." icon={FileText}>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const file = form.get("portfolio") as File | null;
                void run(async () => {
                  if (!result) throw new Error("Generate the marksheet first.");
                  if (!file || !file.size) throw new Error("Select the portfolio file to upload.");
                  const path = await uploadTo("portfolios", result.id, file);
                  await portfolioFn({ data: { resultId: result.id, path } });
                  setPortfolioPath(path);
                  setStep(3);
                });
              }}
            >
              <Field label="Student portfolio" hint="PDF, ZIP or image bundle">
                <Input name="portfolio" type="file" accept="application/pdf,application/zip,image/*" required />
              </Field>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" /> : null} Upload portfolio & continue
                </Button>
                <Button type="button" variant="ghost" className="text-muted-foreground ml-auto" onClick={() => { reset(); onDraft?.(); }}>
                  Save as draft
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}

        {step === 3 ? (
          <Panel title="Step 4 · Document secret token" description="A one-time portfolio download key for the learner." icon={KeyRound}>
            {portfolioKey ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-azure/40 bg-azure/8 p-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Portfolio key</p>
                  <p className="mt-2 font-mono text-2xl font-semibold tracking-[0.2em] text-azure">{portfolioKey}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([`WISE portfolio key\nVerification code: ${result?.verification_code}\nKey: ${portfolioKey}\n`], {
                        type: "text/plain",
                      });
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.download = `WISE-portfolio-key-${result?.verification_code}.txt`;
                      link.click();
                    }}
                  >
                    Download key
                  </Button>
                  <Button variant="outline" onClick={() => result && void downloadQr(result.verification_code)}>
                    <QrCode /> Download QR
                  </Button>
                  <Button onClick={() => setStep(4)}>Continue to NTAG</Button>
                  <Button type="button" variant="ghost" className="text-muted-foreground ml-auto" onClick={() => { reset(); onDraft?.(); }}>
                    Save as draft
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Portfolio stored{portfolioPath ? "" : ""}. Generate the secret download key the public will use with the QR verification page.
                </p>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      if (!result) throw new Error("Missing marksheet.");
                      const issuedKey = await keyFn({ data: { resultId: result.id } });
                      setPortfolioKey(issuedKey.key);
                    })
                  }
                >
                  {busy ? <Loader2 className="animate-spin" /> : null} Generate portfolio key
                </Button>
              </div>
            )}
          </Panel>
        ) : null}

        {step === 4 ? (
          <Panel title="Step 5 · NTAG generation & write" description="128-bit encrypted secret, written and password protected on the physical tag." icon={Radio}>
            {!tag ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate the encrypted certificate token for this award. The secret is never displayed to operators.
                </p>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      if (!result) throw new Error("Missing marksheet.");
                      const prepared = await prepareFn({ data: { resultId: result.id, origin: window.location.origin } });
                      setTag(prepared);
                      await refresh();
                    })
                  }
                >
                  {busy ? <Loader2 className="animate-spin" /> : null} Generate NTAG secret token
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/8 p-4 text-sm">
                  <p className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" /> Secret token has been successfully generated
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Bring the tag near the writing device and hit the “Write to NTAG” button. The tag is password protected on write.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={busy || !nfcSupported || tagWritten}
                    onClick={() =>
                      void run(async () => {
                        const Ctor = (window as unknown as { NDEFReader: new () => NfcReader }).NDEFReader;
                        const reader = new Ctor();
                        await reader.write({ records: [{ recordType: "url", data: tag.writePayload }] });
                        let locked = false;
                        try {
                          await reader.makeReadOnly?.();
                          locked = true;
                        } catch {
                          locked = false;
                        }
                        await writtenFn({ data: { tagId: tag.id, locked } });
                        setTagWritten(true);
                        await refresh();
                      })
                    }
                  >
                    {busy ? <Loader2 className="animate-spin" /> : <Radio />} {tagWritten ? "Written" : "Write to NTAG"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy || !nfcSupported || !tagWritten}
                    onClick={() =>
                      void run(async () => {
                        const Ctor = (window as unknown as { NDEFReader: new () => NfcReader }).NDEFReader;
                        const reader = new Ctor();
                        const scanned = await new Promise<string>((resolve, reject) => {
                          reader.onreading = (event) => {
                            const record = event.message.records[0];
                            const decoder = new TextDecoder();
                            resolve(record ? decoder.decode(record.data as unknown as ArrayBuffer) : "");
                          };
                          reader.onreadingerror = () => reject(new Error("The tag could not be read."));
                          reader.scan?.().catch(reject);
                          setTimeout(() => reject(new Error("No tag detected. Try again.")), 20000);
                        });
                        const outcome = await testFn({ data: { tagId: tag.id, payload: scanned } });
                        setTagTest(outcome.match ? "pass" : "fail");
                      })
                    }
                  >
                    Test written tag
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      setTag(null);
                      setTagWritten(false);
                      setTagTest("idle");
                    }}
                  >
                    Revoke & reset tag
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-dashed ml-auto"
                    disabled={busy || tagWritten}
                    onClick={() =>
                      void run(async () => {
                        await writtenFn({ data: { tagId: tag.id, locked: true } });
                        setTagWritten(true);
                        await refresh();
                      })
                    }
                  >
                    Bypass NFC
                  </Button>
                </div>
                {tagTest !== "idle" ? (
                  <p className={tagTest === "pass" ? "text-sm text-emerald-600 dark:text-emerald-400" : "text-sm text-destructive"}>
                    {tagTest === "pass" ? "Tag verified — payload matches the issued token." : "Mismatch — rewrite the tag."}
                  </p>
                ) : null}
                {!nfcSupported ? (
                  <p className="text-xs text-muted-foreground">Web NFC needs a compatible Android browser over HTTPS.</p>
                ) : null}
                <div className="flex items-center gap-3">
                  <Button variant="outline" disabled={!tagWritten} onClick={() => setStep(5)}>
                    Continue to final submission
                  </Button>
                  <Button type="button" variant="ghost" className="text-muted-foreground ml-auto" onClick={() => { reset(); onDraft?.(); }}>
                    Save as draft
                  </Button>
                </div>
              </div>
            )}
          </Panel>
        ) : null}

        {step === 5 ? (
          <Panel title="Step 6 · Final submission" description="Hand the complete dossier to the WISE evaluation desk." icon={CloudUpload}>
            {pushed ? (
              <div className="space-y-5">
                <div className="rounded-lg border border-azure/40 bg-azure/8 p-5">
                  <p className="font-display text-base font-semibold text-azure">Submitted for evaluation.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your submission will be submitted to blockchain server once approved.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={reset}>
                    <UserPlus /> Add new student
                  </Button>
                  <Button variant="outline" onClick={onBulk}>
                    <FileSpreadsheet /> Bulk upload
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <SummaryRow label="Learner" value={studentName} />
                  <SummaryRow label="Verification code" value={result?.verification_code ?? "—"} />
                  <SummaryRow label="Grade" value={result?.grade ?? "—"} />
                  <SummaryRow label="Portfolio key" value={portfolioKey ? "Issued" : "Missing"} />
                  <SummaryRow label="NTAG" value={tagWritten ? "Written & protected" : "Not written"} />
                </dl>
                <Button
                  size="lg"
                  disabled={busy || !result}
                  onClick={() =>
                    void run(async () => {
                      if (!result) throw new Error("Missing marksheet.");
                      await submitFn({ data: { resultId: result.id } });
                      setPushed(true);
                      await refresh();
                    })
                  }
                >
                  {busy ? <Loader2 className="animate-spin" /> : <CloudUpload />} Push to Blockchain Server on Google Cloud
                </Button>
              </div>
            )}
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

type NfcReader = {
  write: (message: { records: Array<{ recordType: string; data: string }> }) => Promise<void>;
  makeReadOnly?: () => Promise<void>;
  scan?: () => Promise<void>;
  onreading?: (event: { message: { records: Array<{ data: unknown }> } }) => void;
  onreadingerror?: () => void;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-4 py-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function BulkUpload({ institutionId, refresh }: { institutionId: string; refresh: () => Promise<unknown> }) {
  const studentFn = useServerFn(createStudent);
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Panel title="Bulk learner upload" description="Import many learners from a spreadsheet export." icon={FileSpreadsheet}>
      <div className="space-y-5">
        <Button
          variant="outline"
          onClick={() => {
            const blob = new Blob([TEMPLATE], { type: "application/vnd.ms-excel" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "WISE-bulk-learners-demo.xls";
            link.click();
          }}
        >
          <FileSpreadsheet /> Download demo spreadsheet
        </Button>
        <Field label="Upload completed spreadsheet" hint="Save your sheet as CSV/XLS (comma separated) before uploading.">
          <Input
            type="file"
            accept=".csv,.xls,text/csv"
            disabled={busy || !institutionId}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setLog("");
              try {
                const text = await file.text();
                const [header, ...rows] = text.trim().split(/\r?\n/);
                const columns = (header ?? "").split(",").map((item) => item.trim());
                let ok = 0;
                const failures: string[] = [];
                for (const row of rows) {
                  const cells = row.match(/("[^"]*"|[^,]+)?/g)?.filter((_, i) => i % 2 === 0) ?? [];
                  const record: Record<string, string> = {};
                  columns.forEach((column, index) => {
                    record[column] = (cells[index] ?? "").replace(/^"|"$/g, "").trim();
                  });
                  if (!record["full_name"]) continue;
                  try {
                    await studentFn({
                      data: {
                        institutionId,
                        fullName: record["full_name"] ?? "",
                        studentNumber: record["student_number"] || `BULK-${Date.now()}`,
                        programme: record["programme"] || "Unassigned programme",
                        dateOfBirth: record["date_of_birth"] || undefined,
                        caste: record["caste"] || undefined,
                        faceIdNumber: record["face_id_number"] || undefined,
                        address: record["address"] || undefined,
                        guardians: record["guardian_name"]
                          ? [
                              {
                                relation: record["guardian_relation"] || "Guardian",
                                name: record["guardian_name"] ?? "",
                                occupation: record["guardian_occupation"] || undefined,
                                contact: record["guardian_contact"] || undefined,
                              },
                            ]
                          : [],
                      },
                    });
                    ok += 1;
                  } catch (e) {
                    failures.push(`${record["full_name"]}: ${errorMessage(e, "failed")}`);
                  }
                }
                setLog([`${ok} learner record(s) imported.`, ...failures].join("\n"));
                await refresh();
              } finally {
                setBusy(false);
                event.target.value = "";
              }
            }}
          />
        </Field>
        {busy ? <p className="text-sm text-muted-foreground">Importing…</p> : null}
        {log ? <Textarea readOnly value={log} rows={5} className="font-mono text-xs" /> : null}
      </div>
    </Panel>
  );
}
