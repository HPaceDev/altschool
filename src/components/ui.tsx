import type { ReactNode } from "react";
import type { Tone } from "@/lib/labels";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-muted border-line",
  accent: "bg-accent-soft text-accent-text border-accent-line",
  blocker: "bg-blocker-soft text-blocker border-blocker/25",
  important: "bg-important-soft text-important border-warm-line",
  later: "bg-later-soft text-later border-line",
  done: "bg-done-soft text-done border-accent-line",
};

export function Badge({
  children,
  tone = "neutral",
  title,
}: {
  children: ReactNode;
  tone?: Tone;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface-raised ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  lead,
  actions,
}: {
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="display text-3xl text-ink">{title}</h1>
        {lead ? (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{lead}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface-raised px-6 py-14 text-center">
      <span
        aria-hidden
        className="mx-auto mb-4 block h-12 w-12 rounded-full border border-line-strong"
      />
      <p className="display text-lg text-ink">{title}</p>
      {hint ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-xs font-medium tracking-tight text-ink-faint">{children}</span>
  );
}

export function Stat({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  const valueTone =
    tone === "neutral"
      ? "text-ink"
      : tone === "blocker"
        ? "text-blocker"
        : tone === "important"
          ? "text-important"
          : tone === "done"
            ? "text-done"
            : "text-accent-text";

  return (
    <Card className="px-4 py-3.5">
      <p className="text-xs font-semibold tracking-[0.1em] text-ink-faint uppercase">{label}</p>
      <p className={`display mt-2 text-3xl tabular-nums ${valueTone}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-faint">{hint}</p> : null}
    </Card>
  );
}

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const buttonStyles = {
  primary: `${buttonBase} bg-accent text-white hover:bg-accent-hover`,
  secondary: `${buttonBase} border border-line-strong bg-surface text-ink hover:border-accent hover:text-accent-text`,
  quiet: `${buttonBase} text-ink-muted hover:bg-surface hover:text-ink`,
};

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span> : null}
    </label>
  );
}

export const inputStyles =
  "w-full min-h-11 rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function Section({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="display text-xl text-ink">{title}</h2>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
