import Link from "next/link";
import { SCHOOLS, coverage } from "@/lib/prototype-data";
import { StatusBadge } from "@/components/prototype/parts";
import { plural } from "@/lib/labels";

export const metadata = { title: "Карта" };

/**
 * Карта покрытия по регионам.
 *
 * Настоящая карта с точками требует платного картографического сервиса и
 * координат у каждой школы — и то и другое пока не решено (вопрос Q-025).
 * Поэтому здесь честная альтернатива: сколько школ в каждом регионе и сколько
 * из них проверено. Этого достаточно, чтобы обсудить, нужна ли карта вообще.
 */
export default function MapPage() {
  const regions = coverage();
  const covered = regions.filter((r) => r.total > 0);
  const empty = regions.filter((r) => r.total === 0);
  const verified = SCHOOLS.filter((s) => s.status === "verified").length;
  const max = Math.max(...covered.map((r) => r.total), 1);

  return (
    <>
      <h1 className="display text-xl text-ink">География проекта</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">
        {plural(SCHOOLS.length, "школа", "школы", "школ")} в{" "}
        {plural(covered.length, "регионе", "регионах", "регионах")}, из них {verified}{" "}
        проверены редакцией. Ниже — покрытие по регионам.
      </p>

      <div className="mt-5 rounded-xl border border-important/30 bg-important-soft px-4 py-3">
        <p className="text-sm text-important">
          Настоящая карта с точками на местности требует картографического сервиса и
          координат у каждой школы. Нужна ли она в первой версии — открытый вопрос{" "}
          <Link href="/questions/Q-025" className="underline underline-offset-2">
            Q-025
          </Link>
          . Пока показываем покрытие списком.
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {covered.map((r) => {
          const claimed = r.total - r.verified;
          return (
            <li key={r.region}>
              <Link
                href={`/prototype/catalog?region=${encodeURIComponent(r.region)}`}
                className="block rounded-xl border border-line bg-surface-raised px-4 py-3 transition-colors hover:border-line-strong"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-ink">{r.region}</span>
                  <span className="nums text-sm text-ink-muted">
                    {plural(r.total, "школа", "школы", "школ")}
                  </span>
                </div>

                {/* Полоса показывает не только объём, но и долю проверенного. */}
                <div
                  className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-surface-sunken"
                  style={{ width: `${Math.max((r.total / max) * 100, 12)}%` }}
                >
                  <span
                    className="bg-done"
                    style={{ width: `${(r.verified / r.total) * 100}%` }}
                    aria-hidden
                  />
                  <span className="flex-1 bg-important/50" aria-hidden />
                </div>

                <p className="mt-1.5 text-xs text-ink-faint">
                  проверено {r.verified}
                  {claimed > 0 ? ` · ждут проверки ${claimed}` : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      {empty.length > 0 ? (
        <section className="mt-8">
          <h2 className="display text-base text-ink">Регионы без школ</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Здесь мы пока никого не нашли. Это не значит, что школ нет — значит, до них
            не дошли руки.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {empty.map((r) => (
              <span
                key={r.region}
                className="rounded-full border border-dashed border-line-strong px-3 py-1.5 text-xs text-ink-faint"
              >
                {r.region}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-xl border border-line bg-surface-sunken px-5 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="verified" />
          <span className="text-sm text-ink-muted">документы проверены редакцией</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <StatusBadge status="claimed" />
          <span className="text-sm text-ink-muted">школа заявила о себе сама</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <StatusBadge status="stale" />
          <span className="text-sm text-ink-muted">данным больше 90 дней</span>
        </div>
      </section>
    </>
  );
}
