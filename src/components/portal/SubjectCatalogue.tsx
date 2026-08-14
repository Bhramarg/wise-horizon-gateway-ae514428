import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, Field, Panel, StatusChip, type Overview } from "@/components/portal/shell";
import { deleteSubjectDefinition, saveSubjectDefinition } from "@/lib/portal.functions";
import { errorMessage } from "@/lib/utils";

export const LEVELS = ["L1", "L2", "L3", "L4", "L5"] as const;
export const CATEGORIES = ["fixed", "changeable", "optional"] as const;

const selectClass = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export function SubjectCatalogue({ data, refresh }: { data: Overview; refresh: () => Promise<unknown> }) {
  const saveFn = useServerFn(saveSubjectDefinition);
  const removeFn = useServerFn(deleteSubjectDefinition);
  const [level, setLevel] = useState<string>("L1");
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
                    level: String(form.get("level")) as (typeof LEVELS)[number],
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
                  <option key={item} value={item}>
                    {item}
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

      <Panel title={`${level} curriculum`} description="Subjects offered to digital marksheet staff for this level." icon={BookOpen}>
        <div className="mb-4 flex flex-wrap gap-2">
          {LEVELS.map((item) => (
            <Button key={item} size="sm" variant={item === level ? "default" : "outline"} onClick={() => setLevel(item)}>
              {item}
            </Button>
          ))}
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
