import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, Field, Panel, StatusChip, type Overview } from "@/components/portal/shell";
import { deleteSubjectDefinition, saveSubjectDefinition } from "@/lib/portal.functions";
import { errorMessage } from "@/lib/utils";

export const LEVELS = [
  { id: "L2", name: "L2 - Secondary Examination" },
  { id: "L3", name: "L3 - Higher Secondary Examination" }
];
export const CATEGORIES = ["fixed", "changeable", "optional"] as const;

const selectClass = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export function SubjectCatalogue({ data, refresh }: { data: Overview; refresh: () => Promise<unknown> }) {
  const saveFn = useServerFn(saveSubjectDefinition);
  const removeFn = useServerFn(deleteSubjectDefinition);
  const [level, setLevel] = useState<string>("L2");
  const [message, setMessage] = useState("");

  const subjects = data.subjects.filter((item) => item.level === level);

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      setMessage("");
      await action();
      setMessage(success);
      await refresh();
    } catch (e) {
      setMessage(errorMessage(e, "The subject could not be saved."));
    }
  }

  const ISCED_L2_SUBJECTS = [
    { code: "0232", name: "First language / Mother tongue / Literature", category: "fixed" },
    { code: "0231", name: "Languages (Second/Foreign Language)", category: "fixed" },
    { code: "0541", name: "Mathematics", category: "fixed" },
    { code: "0500", name: "Broad programmes in natural sciences", category: "fixed" },
    { code: "0318", name: "Inter-disciplinary social sciences", category: "fixed" },
    { code: "0611", name: "Computer use / Basic ICT", category: "optional" },
  ];

  const ISCED_L3_SUBJECTS = [
    // Compulsory
    { code: "0232", name: "Literature and linguistics / Languages", category: "fixed" },
    { code: "0231", name: "Language acquisition", category: "fixed" },
    // Science
    { code: "0533", name: "Physical sciences (Physics)", category: "changeable" },
    { code: "0531", name: "Physical sciences (Chemistry)", category: "changeable" },
    { code: "0541", name: "Mathematics", category: "changeable" },
    { code: "0511", name: "Biological and related sciences", category: "changeable" },
    { code: "0512", name: "Biochemistry / Biotechnology", category: "changeable" },
    { code: "0613", name: "Software and applications development", category: "changeable" },
    // Commerce
    { code: "0411", name: "Accounting and taxation", category: "changeable" },
    { code: "0413", name: "Management and administration", category: "changeable" },
    { code: "0311", name: "Economics", category: "changeable" },
    { code: "0410", name: "Business and administration", category: "changeable" },
    { code: "0412", name: "Finance, banking and insurance", category: "changeable" },
    // Arts / Humanities
    { code: "0222", name: "History and archaeology", category: "changeable" },
    { code: "0312", name: "Political sciences and civics", category: "changeable" },
    { code: "0314", name: "Sociology and cultural studies", category: "changeable" },
    { code: "0313", name: "Psychology", category: "changeable" },
    { code: "0532", name: "Earth sciences / Environmental sciences", category: "changeable" },
    { code: "0421", name: "Law", category: "changeable" },
    // Electives
    { code: "1014", name: "Sports / Personal services", category: "optional" },
    { code: "0213", name: "Fine arts", category: "optional" },
  ];

  async function seedIscedDefaults() {
    setMessage(`Seeding ISCED defaults for ${level}...`);
    let successCount = 0;
    const subsToSeed = level === "L2" ? ISCED_L2_SUBJECTS : ISCED_L3_SUBJECTS;
    
    for (const sub of subsToSeed) {
      try {
        await saveFn({
          data: {
            level: level as "L2" | "L3",
            code: sub.code,
            name: sub.name,
            category: sub.category as "fixed" | "changeable" | "optional",
            totalMarks: 100,
            passingMarks: 33,
            theoryMarks: 100,
            practicalMarks: 0,
            active: true,
          },
        });
        successCount++;
      } catch (e) {
        console.error("Failed to seed:", sub.name, e);
      }
    }
    setMessage(`Successfully seeded ${successCount} ISCED subjects for ${level}.`);
    await refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
      <Panel title="Define subject" description="Per-level curriculum with marks and pass thresholds." icon={BookOpen}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const target = event.currentTarget;
            void run(
              () =>
                saveFn({
                  data: {
                    level: String(form.get("level")) as (typeof LEVELS)[number]["id"],
                    code: String(form.get("code") ?? ""),
                    name: String(form.get("name") ?? ""),
                    category: String(form.get("category")) as (typeof CATEGORIES)[number],
                    totalMarks: Number(form.get("totalMarks") ?? 100),
                    passingMarks: Number(form.get("passingMarks") ?? 33),
                    theoryMarks: Number(form.get("theoryMarks") ?? 100),
                    practicalMarks: Number(form.get("practicalMarks") ?? 0),
                    active: true,
                  },
                }).then(() => target.reset()),
              "Subject saved to the catalogue.",
            );
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Level">
              <select name="level" defaultValue={level} className={selectClass} onChange={(event) => setLevel(event.target.value)}>
                {LEVELS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subject type">
              <select name="category" defaultValue="fixed" className={selectClass}>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item[0]!.toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subject code">
              <Input name="code" required placeholder="ENG-101" />
            </Field>
            <Field label="Subject name">
              <Input name="name" required placeholder="English Language" />
            </Field>
            <Field label="Total marks">
              <Input name="totalMarks" type="number" min={1} defaultValue={100} required />
            </Field>
            <Field label="Minimum passing marks">
              <Input name="passingMarks" type="number" min={0} defaultValue={33} required />
            </Field>
            <Field label="Theory marks">
              <Input name="theoryMarks" type="number" min={0} defaultValue={100} required />
            </Field>
            <Field label="Practical marks">
              <Input name="practicalMarks" type="number" min={0} defaultValue={0} required />
            </Field>
          </div>
          <Button type="submit">Save subject</Button>
          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
        </form>
      </Panel>

      <Panel title={`${LEVELS.find(l => l.id === level)?.name || level} curriculum`} description="Subjects offered to digital marksheet staff for this level." icon={BookOpen}>
        <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            {LEVELS.map((item) => (
              <Button key={item.id} size="sm" variant={item.id === level ? "default" : "outline"} onClick={() => setLevel(item.id)}>
                {item.id}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="secondary" onClick={seedIscedDefaults}>
            Seed ISCED {level} Defaults
          </Button>
        </div>
        {subjects.length ? (
          <div className="divide-y divide-border/60">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {subject.code} · {subject.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total {subject.total_marks} · Pass {subject.passing_marks} · Theory {subject.theory_marks} · Practical{" "}
                    {subject.practical_marks}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip status={subject.category === "fixed" ? "approved" : subject.category === "changeable" ? "submitted" : "draft"} />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{subject.category}</span>
                  <Button size="sm" variant="ghost" onClick={() => run(() => removeFn({ data: { id: subject.id } }), "Subject removed.")}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text={`No subjects defined for ${level} yet.`} />
        )}
      </Panel>
    </div>
  );
}
