import Link from "next/link";
import { FRANCHISES, TONE_COLOR } from "@/lib/prototype-data";

export const metadata = { title: "Франшизы" };

const priceFormat = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

/**
 * Витрина франшиз — публичная часть закрытого контура.
 *
 * Здесь обращаются к другой аудитории: не к родителю, а к предпринимателю с
 * бюджетом. Поэтому на первом плане деньги и свободные территории, а не
 * методика.
 */
export default function FranchisesPage() {
  return (
    <>
      <h1 className="display text-xl text-ink">Открыть свою школу</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Форматы франшизы сети: вложения, роялти и свободные территории. Цифры
        демонстрационные — настоящая модель расчёта окупаемости пока не согласована.
      </p>

      <ul className="mt-6 space-y-4">
        {FRANCHISES.map((f) => (
          <li
            key={f.slug}
            className="overflow-hidden rounded-xl border border-line bg-surface-raised"
          >
            <div
              aria-hidden
              className="h-1.5"
              style={{ backgroundColor: TONE_COLOR[f.tone] }}
            />
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="display text-lg text-ink">{f.name}</h2>
                  <p className="mt-0.5 text-sm text-ink-muted">{f.format}</p>
                </div>
                <div className="text-right">
                  <p className="nums text-lg font-semibold text-ink">
                    от {priceFormat.format(f.investmentFrom)}
                  </p>
                  <p className="text-xs text-ink-faint">вложения на старте</p>
                </div>
              </div>

              <dl className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
                <Cell label="Паушальный взнос" value={priceFormat.format(f.lumpSum)} />
                <Cell label="Роялти" value={f.royalty} />
                <Cell label="Окупаемость" value={f.paybackMonths} />
                <Cell label="Точек открыто" value={String(f.pointsOpen)} />
              </dl>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {f.support.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line bg-surface-sunken px-2.5 py-1 text-xs text-ink-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-ink-muted">
                  свободных территорий:{" "}
                  <span className="nums font-medium text-ink">{f.freeTerritories}</span>
                </p>
              </div>

              <button
                type="button"
                className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Запросить презентацию
              </button>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-xl border border-important/30 bg-important-soft px-5 py-4">
        <p className="text-sm leading-relaxed text-important">
          Чего здесь пока нет: калькулятора окупаемости с реальной моделью, карты
          свободных территорий и личного кабинета франчайзи. Всё это — закрытый контур,
          и по коммерческому предложению именно с него рекомендуется начинать. Решение
          за вами:{" "}
          <Link href="/questions/Q-017" className="underline underline-offset-2">
            Q-017
          </Link>
          .
        </p>
      </section>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-raised px-3 py-2.5">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
