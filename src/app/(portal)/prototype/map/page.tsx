import Link from "next/link";
import { REGION_POINT, SCHOOLS, coverage } from "@/lib/prototype-data";
import { Kicker, StatusBadge } from "@/components/prototype/parts";
import { plural } from "@/lib/labels";

export const metadata = { title: "Карта" };

/**
 * Карта покрытия.
 *
 * Настоящая карта с точками на местности требует платного картографического
 * сервиса и координат у каждой школы — и то и другое пока не решено
 * (вопрос Q-025). Поэтому здесь схема: она показывает то же, ради чего карта
 * нужна, — где густо, где пусто и что из этого проверено. Схематичность
 * подписана прямо на экране, чтобы её не приняли за готовую карту.
 */
export default function MapPage() {
  const regions = coverage();
  const covered = regions.filter((r) => r.total > 0);
  const empty = regions.filter((r) => r.total === 0);
  const verified = SCHOOLS.filter((s) => s.status === "verified").length;
  const max = Math.max(...covered.map((r) => r.total), 1);

  return (
    <>
      <div className="mb-8 max-w-2xl">
        <Kicker>Карта</Kicker>
        <h1 className="display mt-3 text-3xl text-ink sm:text-4xl">
          География РО становится видимой
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          {plural(SCHOOLS.length, "школа", "школы", "школ")} в{" "}
          {plural(covered.length, "регионе", "регионах", "регионах")}, из них {verified}{" "}
          проверены редакцией. Цвет точки показывает не рейтинг, а состояние данных.
        </p>
      </div>

      <div className="grid overflow-hidden rounded-3xl border border-line lg:grid-cols-[1fr_340px]">
        {/* Схема покрытия. Размер точки — число школ, цвет — доля проверенных. */}
        <div
          className="relative min-h-[22rem] lg:min-h-[34rem]"
          style={{
            background:
              "radial-gradient(circle at 62% 34%, rgba(255,255,255,.75), transparent 42%), linear-gradient(135deg, #dde9e0, #bcd5c3)",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(36,95,61,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(36,95,61,.09) 1px, transparent 1px)",
              backgroundSize: "46px 46px",
            }}
          />

          {covered.map((r) => {
            const point = REGION_POINT[r.region];
            if (!point) return null;
            const size = 14 + r.total * 5;
            const allVerified = r.verified === r.total;

            return (
              <Link
                key={r.region}
                href={`/prototype/catalog?region=${encodeURIComponent(r.region)}`}
                title={`${r.region}: ${r.total}, проверено ${r.verified}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span
                  aria-hidden
                  className="mx-auto block rounded-full border-[3px] border-white transition-transform group-hover:scale-125 group-focus-visible:scale-125"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: allVerified ? "var(--accent)" : "var(--warm)",
                    boxShadow: "0 0 0 5px rgba(36,95,61,.14), 0 8px 16px rgba(16,35,23,.2)",
                  }}
                />
                <span className="mt-2 block text-center text-xs font-medium whitespace-nowrap text-ink">
                  {r.region}
                  <span className="nums ml-1 text-ink-faint">{r.total}</span>
                </span>
              </Link>
            );
          })}

          {empty.map((r) => {
            const point = REGION_POINT[r.region];
            if (!point) return null;
            return (
              <span
                key={r.region}
                title={`${r.region}: школ пока нет`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span
                  aria-hidden
                  className="mx-auto block h-3.5 w-3.5 rounded-full border border-dashed border-accent/60"
                />
                <span className="mt-2 block text-center text-xs whitespace-nowrap text-ink-faint">
                  {r.region}
                </span>
              </span>
            );
          })}

          <div className="absolute right-4 bottom-4 rounded-xl border border-line bg-surface/92 px-4 py-3 text-xs text-ink-muted backdrop-blur-sm">
            <p className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              все карточки региона проверены
            </p>
            <p className="mt-1.5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-warm" />
              есть непроверенные данные
            </p>
            <p className="mt-1.5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-accent/60" />
              школ пока не нашли
            </p>
          </div>
        </div>

        <aside className="border-t border-line bg-surface-raised p-6 lg:border-t-0 lg:border-l">
          <h2 className="display text-lg text-ink">Покрытие по регионам</h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Нажмите регион, чтобы открыть каталог по нему.
          </p>

          <ul className="mt-5 space-y-3">
            {covered.map((r) => {
              const claimed = r.total - r.verified;
              return (
                <li key={r.region}>
                  <Link href={`/prototype/catalog?region=${encodeURIComponent(r.region)}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-ink">{r.region}</span>
                      <span className="nums shrink-0 text-sm text-ink-faint">{r.total}</span>
                    </div>
                    {/* Полоса показывает и объём, и долю проверенного. */}
                    <div
                      className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-surface-sunken"
                      style={{ width: `${Math.max((r.total / max) * 100, 14)}%` }}
                    >
                      <span
                        className="bg-accent"
                        style={{ width: `${(r.verified / r.total) * 100}%` }}
                        aria-hidden
                      />
                      <span className="flex-1 bg-warm/50" aria-hidden />
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">
                      проверено {r.verified}
                      {claimed > 0 ? ` · ждут проверки ${claimed}` : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {empty.length > 0 ? (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="text-xs font-semibold tracking-[0.1em] text-ink uppercase">
                Регионы без школ
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Здесь мы пока никого не нашли. Это не значит, что школ нет — значит, до
                них не дошли руки.
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
            </div>
          ) : null}
        </aside>
      </div>

      <div className="mt-4 rounded-2xl border border-warm-line bg-warm-soft px-5 py-4">
        <p className="text-sm leading-relaxed text-warm">
          Это схема, а не карта: точки расставлены условно. Настоящая карта требует
          картографического сервиса и координат у каждой школы — нужна ли она в первой
          версии, решает открытый вопрос{" "}
          <Link href="/questions/Q-025" className="font-medium underline underline-offset-2">
            Q-025
          </Link>
          .
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-surface-raised px-6 py-6">
        <h2 className="text-xs font-semibold tracking-[0.1em] text-ink uppercase">
          Что означают статусы
        </h2>
        <dl className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <dt>
              <StatusBadge status="verified" />
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
              редакция видела документы и записала, какие именно
            </dd>
          </div>
          <div>
            <dt>
              <StatusBadge status="claimed" />
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
              школа заявила о себе сама, документы ещё не проверены
            </dd>
          </div>
          <div>
            <dt>
              <StatusBadge status="stale" />
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
              данным больше 90 дней, мы запросили обновление
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
