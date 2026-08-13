import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { getPortalOverview } from "@/lib/portal.functions";

export type Overview = Awaited<ReturnType<typeof getPortalOverview>>;
export type Icon = ComponentType<{ className?: string }>;

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/70 backdrop-blur-xl shadow-[0_18px_50px_-38px_color-mix(in_oklab,var(--navy-deep)_60%,transparent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Panel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: Icon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Surface className={cn("p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/60 text-azure">
              <Icon className="size-4" />
            </span>
          ) : null}
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </Surface>
  );
}

export function Metric({ icon: Icon, label, value, hint }: { icon: Icon; label: string; value: number | string; hint?: string }) {
  return (
    <Surface className="p-5">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-lg bg-accent/60 text-azure">
          <Icon className="size-4" />
        </span>
        {hint ? <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{hint}</span> : null}
      </div>
      <p className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Surface>
  );
}

export function StatusChip({ status }: { status: string }) {
  const tone =
    status === "issued" || status === "approved"
      ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
      : status === "submitted"
        ? "bg-azure/15 text-azure"
        : status === "revoked"
          ? "bg-destructive/12 text-destructive"
          : status === "on_hold" || status === "review_required"
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            : "bg-muted text-muted-foreground";
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", tone)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border/70 py-10 text-center text-sm text-muted-foreground">{text}</p>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-muted-foreground/80">{hint}</span> : null}
    </label>
  );
}

export function StepRail({
  steps,
  current,
  onSelect,
}: {
  steps: Array<{ key: string; label: string; icon: Icon }>;
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="space-y-1.5">
      {steps.map((step, index) => {
        const state = index === current ? "current" : index < current ? "done" : "todo";
        return (
          <li key={step.key}>
            <button
              type="button"
              onClick={() => (index <= current ? onSelect(index) : undefined)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition",
                state === "current" && "bg-accent/70 text-accent-foreground shadow-sm",
                state === "done" && "text-muted-foreground hover:bg-accent/40",
                state === "todo" && "cursor-not-allowed text-muted-foreground/60",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-md text-[11px] font-semibold",
                  state === "current" ? "bg-azure text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <step.icon className="size-4 shrink-0 opacity-70" />
              <span className="truncate font-medium">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
