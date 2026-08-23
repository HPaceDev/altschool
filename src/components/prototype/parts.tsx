import Link from "next/link";
import { ageRange, formatPrice, type School } from "@/lib/prototype-data";
import { FORMAT_LABEL } from "@/lib/prototype-data";

/**
 * Фотографий школ у нас пока нет, поэтому вместо них — цветная заглушка
 * с инициалами. Так прототип не выглядит пустым и при этом честно
 * показывает, что настоящие снимки ещё предстоит собрать.
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
  const [from, to] = school.palette;
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initials ? (
        <span className="text-2xl font-semibold text-white/85">
          {school.name
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </span>
      ) : null}
    </div>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span aria-hidden className="text-[#f59f00]">
        ★
      </span>
      <span className="font-medium text-ink">{value.toFixed(1)}</span>
      {count !== undefined ? (
        <span className="text-ink-faint">
          ({count})<span className="sr-only"> отзывов</span>
        </span>
      ) : null}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface-sunken px-2.5 py-1 text-xs text-ink-muted">
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
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface-raised transition-colors hover:border-line-strong sm:flex-row">
      <Link
        href={`/prototype/school/${school.slug}`}
        className="shrink-0 sm:w-44"
        aria-label={school.name}
      >
        <Photo school={school} className="h-36 w-full sm:h-full" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/prototype/school/${school.slug}`}>
              <h3 className="font-semibold text-ink group-hover:text-accent-text">
                {school.name}
              </h3>
            </Link>
            <p className="mt-0.5 text-sm text-ink-muted">
              {school.kind} · {school.city}
              {school.district !== "Вся Россия" ? `, ${school.district}` : ""}
            </p>
          </div>
          <Rating value={school.rating} count={school.reviewsCount} />
        </div>

        <p className="mt-2 text-sm text-ink-muted">{school.short}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip>{ageRange(school)}</Chip>
          <Chip>{FORMAT_LABEL[school.format]}</Chip>
          <Chip>класс до {school.classSize}</Chip>
          {school.hasLicence ? <Chip>лицензия</Chip> : null}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-ink">
              {formatPrice(school.pricePerMonth)}
              <span className="text-sm font-normal text-ink-faint"> / мес</span>
            </p>
            {school.admissionOpen ? (
              school.seatsLeft ? (
                <p className="text-xs text-done">осталось мест: {school.seatsLeft}</p>
              ) : (
                <p className="text-xs text-done">набор открыт</p>
              )
            ) : (
              <p className="text-xs text-ink-faint">набор закрыт, лист ожидания</p>
            )}
          </div>

          <div className="flex gap-2">
            {compareHref ? (
              <Link
                href={compareHref}
                scroll={false}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
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
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-text"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
