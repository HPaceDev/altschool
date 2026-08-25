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
 * Фотографий школ нет, поэтому вместо них — плашка с монограммой.
 *
 * Ставить стоковый снимок чужого двора в прототип нечестно: заказчик решит,
 * что фотографии уже собраны. Плашка держит композицию карточки и сразу
 * говорит, что снимок ещё предстоит получить от школы.
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
  const base = TONE_COLOR[school.tone];

  return (
    <div
      aria-hidden
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundColor: base,
        backgroundImage: `radial-gradient(120% 90% at 78% 12%, rgba(255,255,255,0.22), transparent 58%),
           repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 10px)`,
      }}
    >
      {/* Кольца — тот же мотив, что у знака сервиса: карта и орбита. */}
      <span
        aria-hidden
        className="absolute -right-8 -bottom-14 h-40 w-40 rounded-full border border-white/15"
        style={{ boxShadow: "0 0 0 22px rgba(255,255,255,0.05)" }}
      />
      {initials ? (
        <span className="display relative text-3xl text-white/90">
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

const statusStyle: Record<FactStatus, { chip: string; dot: string }> = {
  verified: { chip: "border-accent-line bg-accent-soft text-accent-text", dot: "bg-accent" },
  claimed: { chip: "border-warm-line bg-warm-soft text-warm", dot: "bg-warm" },
  stale: { chip: "border-warm-line bg-warm-soft text-warm", dot: "bg-blocker" },
  missing: { chip: "border-line bg-surface-sunken text-ink-faint", dot: "bg-ink-faint" },
};

/**
 * Статус данных — главный элемент всего продукта. Именно он отличает
 * проверяемую карту от обычного справочника, поэтому он всегда на виду, а не
 * спрятан в подпись. Цвет вторичен: смысл несёт слово, точка лишь помогает
 * различать статусы боковым зрением.
 */
export function StatusBadge({
  status,
  short = false,
  onDark = false,
}: {
  status: FactStatus;
  short?: boolean;
  onDark?: boolean;
}) {
  const style = statusStyle[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        onDark ? "border-transparent bg-surface/95 text-accent-text shadow-sm" : style.chip
      }`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {short ? FACT_STATUS_SHORT[status] : FACT_STATUS_LABEL[status]}
    </span>
  );
}

/** Строка «поле — значение — откуда и когда». Вместо прочерка пишем словами. */
export function FactRow({ label, fact }: { label: string; fact: Fact }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-5 py-3.5">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="flex min-w-0 flex-col items-end gap-1.5 text-right">
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

export function Chip({ children, tone }: { children: React.ReactNode; tone?: "ro" | "warm" }) {
  const style =
    tone === "ro"
      ? "border-accent-line bg-accent-soft font-medium text-accent-text"
      : tone === "warm"
        ? "border-warm-line bg-warm-soft font-medium text-warm"
        : "border-line bg-surface text-ink-muted";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${style}`}>
      {children}
    </span>
  );
}

/** Микрозаголовок над разделом. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="kicker">{children}</p>;
}

/** Шапка раздела: заголовок слева, ссылка «весь список» справа. */
export function SectionHead({
  kicker,
  title,
  lead,
  action,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="max-w-2xl">
        {kicker ? <Kicker>{kicker}</Kicker> : null}
        <h2 className="display mt-2.5 text-2xl text-ink sm:text-[28px]">{title}</h2>
        {lead ? <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">{lead}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent-text"
        >
          {action.label}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Карточка школы в каталоге.
 *
 * Порядок чтения задан намеренно: сначала статус данных, потом название,
 * и только в конце цена. У справочников наоборот — там цена главная, потому
 * что продают размещение. Мы продаём проверяемость.
 */
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
    <article className="liftable group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised">
      <Link
        href={`/prototype/school/${school.slug}`}
        className="relative block"
        aria-label={school.name}
      >
        <Photo school={school} className="aspect-[16/10] w-full" />
        <span className="absolute top-3.5 left-3.5">
          <StatusBadge status={school.status} onDark />
        </span>
        {school.inNetwork ? (
          <span className="absolute top-3.5 right-3.5 rounded-full bg-deep/85 px-2.5 py-1 text-xs font-medium text-white">
            точка сети
          </span>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <p className="text-xs text-ink-faint">
          {school.city}
          {school.district ? `, ${school.district}` : ""}
        </p>

        <Link href={`/prototype/school/${school.slug}`} className="mt-1.5">
          <h3 className="display text-lg text-ink transition-colors group-hover:text-accent-text">
            {school.name}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-ink-faint">
          {FORMAT_LABEL[school.format]} · {school.grades}
        </p>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{school.short}</p>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <Chip tone={roConfirmed ? "ro" : undefined}>
            <span title={RO_DEPTH_HINT[school.roDepth]}>
              РО: {RO_DEPTH_LABEL[school.roDepth].toLowerCase()}
            </span>
          </Chip>
          {school.classSize.status !== "missing" ? (
            <Chip>класс {school.classSize.value}</Chip>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4 sm:mt-auto sm:pt-5">
          <div>
            <p className="nums display text-xl text-ink">
              {formatPrice(school.pricePerMonth)}
              {school.pricePerMonth ? (
                <span className="font-sans text-sm font-normal text-ink-faint"> / мес</span>
              ) : null}
            </p>
            <p className="mt-0.5 text-xs text-ink-faint">
              {school.status === "claimed"
                ? "со слов школы, редакция не проверяла"
                : `проверено ${school.checkedOn}`}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            {compareHref ? (
              <Link
                href={compareHref}
                scroll={false}
                className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm transition-colors ${
                  inCompare
                    ? "border-accent bg-accent-soft text-accent-text"
                    : "border-line-strong text-ink-muted hover:border-accent hover:text-accent-text"
                }`}
              >
                {inCompare ? "В сравнении" : "Сравнить"}
              </Link>
            ) : null}
            <Link
              href={`/prototype/school/${school.slug}`}
              className="inline-flex min-h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
