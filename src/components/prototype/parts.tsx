import Link from "next/link";
import {
  FACT_STATUS_LABEL,
  FACT_STATUS_SHORT,
  FORMAT_LABEL,
  RO_DEPTH_HINT,
  RO_DEPTH_LABEL,
  TONE_COLOR,
  formatPrice,
  type Fact,
  type FactStatus,
  type School,
} from "@/lib/prototype-data";

/**
 * Фотографий школ нет, поэтому вместо них — приглушённая плашка с
 * инициалами. Честно показывает, что снимки ещё предстоит собрать, и не
 * спорит с текстом рядом.
 */
export function Photo({
  school,
  className = "",
  initials = true,
}: {
  school: School;
  className?: string;
  initials?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundColor: TONE_COLOR[school.tone],
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 9px)",
      }}
    >
      {initials ? (
        <span className="display text-2xl text-white/90">
          {school.name
            .replace(/[«»"]/g, "")
            .split(" ")
            .filter((w) => w.length > 2)
            .slice(0, 2)
            .map((word) => word[0].toUpperCase())
            .join("")}
        </span>
      ) : null}
    </div>
  );
}

const statusStyle: Record<FactStatus, string> = {
  verified: "border-done/30 bg-done-soft text-done",
  claimed: "border-important/30 bg-important-soft text-important",
  stale: "border-blocker/30 bg-blocker-soft text-blocker",
  missing: "border-line bg-surface-sunken text-ink-faint",
};

/**
 * Статус данных — главный элемент всего продукта. Именно он отличает
 * проверяемую карту от обычного справочника, поэтому он крупный и всегда на
 * виду, а не спрятан в подпись.
 */
export function StatusBadge({ status, short = false }: { status: FactStatus; short?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${statusStyle[status]}`}
    >
      <span aria-hidden className="text-[10px]">
        {status === "verified" ? "✓" : status === "missing" ? "—" : "!"}
      </span>
      {short ? FACT_STATUS_SHORT[status] : FACT_STATUS_LABEL[status]}
    </span>
  );
}

/** Строка «поле — значение — откуда и когда». Вместо прочерка пишем словами. */
export function FactRow({ label, fact }: { label: string; fact: Fact }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-4 py-3">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="flex min-w-0 flex-col items-end gap-1 text-right">
        <span
          className={`text-sm ${fact.status === "missing" ? "text-ink-faint italic" : "text-ink"}`}
        >
          {fact.value}
        </span>
        <span className="flex flex-wrap items-center justify-end gap-1.5">
          <StatusBadge status={fact.status} short />
          {fact.checkedOn ? (
            <span className="text-xs text-ink-faint">от {fact.checkedOn}</span>
          ) : null}
        </span>
        {fact.source ? (
          <span className="text-xs text-ink-faint">источник: {fact.source}</span>
        ) : null}
      </dd>
    </div>
  );
}

export function Chip({ children, tone }: { children: React.ReactNode; tone?: "ro" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${
        tone === "ro"
          ? "border-accent/30 bg-accent-soft font-medium text-accent-text"
          : "border-line bg-surface-sunken text-ink-muted"
      }`}
    >
      {children}
    </span>
  );
}

export function SchoolCard({
  school,
  compareHref,
  inCompare,
}: {
  school: School;
  compareHref?: string;
  inCompare?: boolean;
}) {
  const roConfirmed = school.roDepth === "full" || school.roDepth === "primary";

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface-raised transition-colors hover:border-line-strong sm:flex-row">
      <Link
        href={`/prototype/school/${school.slug}`}
        className="shrink-0 sm:w-40"
        aria-label={school.name}
      >
        <Photo school={school} className="h-32 w-full sm:h-full" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={school.status} />
          <span className="text-xs text-ink-faint">
            {school.city}
            {school.district ? `, ${school.district}` : ""}
          </span>
          {school.inNetwork ? (
            <span className="text-xs font-medium text-accent-text">точка сети</span>
          ) : null}
        </div>

        <Link href={`/prototype/school/${school.slug}`} className="mt-1.5">
          <h3 className="display text-base text-ink group-hover:text-accent-text">
            {school.name}
          </h3>
        </Link>

        <p className="mt-0.5 text-sm text-ink-muted">
          {FORMAT_LABEL[school.format]} · {school.grades}
        </p>
        <p className="mt-1.5 text-sm text-ink-muted">{school.short}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip tone={roConfirmed ? "ro" : undefined}>
            <span title={RO_DEPTH_HINT[school.roDepth]}>
              РО: {RO_DEPTH_LABEL[school.roDepth].toLowerCase()}
            </span>
          </Chip>
          {school.classSize.status !== "missing" ? (
            <Chip>класс {school.classSize.value}</Chip>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="nums text-lg font-semibold text-ink">
              {formatPrice(school.pricePerMonth)}
              {school.pricePerMonth ? (
                <span className="text-sm font-normal text-ink-faint"> / мес</span>
              ) : null}
            </p>
            <p className="text-xs text-ink-faint">
              {school.status === "claimed"
                ? "со слов школы, редакция не проверяла"
                : `проверено ${school.checkedOn}`}
            </p>
          </div>

          <div className="flex gap-2">
            {compareHref ? (
              <Link
                href={compareHref}
                scroll={false}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  inCompare
                    ? "border-accent bg-accent-soft text-accent-text"
                    : "border-line-strong text-ink-muted hover:bg-surface-sunken"
                }`}
              >
                {inCompare ? "В сравнении" : "Сравнить"}
              </Link>
            ) : null}
            <Link
              href={`/prototype/school/${school.slug}`}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
