import Link from "next/link";
import { findSchool, formatPrice } from "@/lib/prototype-data";
import { Photo } from "@/components/prototype/parts";

export const metadata = { title: "Заявка" };

type Params = { school?: string; step?: string; waitlist?: string };

const STEPS = ["О ребёнке", "Контакты", "Готово"];

/**
 * Заявка в три шага. Данные никуда не сохраняются: прототип нужен, чтобы
 * договориться о составе полей и порядке шагов, а не чтобы принимать заявки.
 */
export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const school = params.school ? findSchool(params.school) : undefined;
  const step = Math.min(Math.max(Number(params.step ?? 1), 1), 3);
  const isWaitlist = params.waitlist === "1";

  const stepHref = (next: number) => {
    const qs = new URLSearchParams();
    if (params.school) qs.set("school", params.school);
    if (isWaitlist) qs.set("waitlist", "1");
    qs.set("step", String(next));
    return `/prototype/request?${qs}`;
  };

  return (
    <div className="mx-auto max-w-2xl">
      {school ? (
        <Link
          href={`/prototype/school/${school.slug}`}
          className="text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          ← {school.name}
        </Link>
      ) : null}

      <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">
        {isWaitlist ? "Заявка в лист ожидания" : "Заявка на встречу"}
      </h1>

      {school ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-3">
          <Photo school={school} className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <p className="font-medium text-ink">{school.name}</p>
            <p className="text-sm text-ink-muted">
              {school.kind} · {formatPrice(school.pricePerMonth)} / мес
            </p>
          </div>
        </div>
      ) : null}

      {/* Шаги */}
      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const done = number < step;
          const active = number === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                  done
                    ? "bg-done-soft text-done"
                    : active
                      ? "bg-accent text-white"
                      : "bg-surface-sunken text-ink-faint"
                }`}
              >
                {done ? "✓" : number}
              </span>
              <span
                className={`hidden text-sm sm:block ${active ? "font-medium text-ink" : "text-ink-faint"}`}
              >
                {label}
              </span>
              {number < STEPS.length ? (
                <span aria-hidden className="h-px flex-1 bg-line" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-xl border border-line bg-surface-raised p-5">
        {step === 1 ? (
          <div className="space-y-4">
            <Field label="Имя ребёнка">
              <input type="text" placeholder="Например, Артём" className={input} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Возраст">
                <select className={input} defaultValue="">
                  <option value="" disabled>
                    Выберите
                  </option>
                  {Array.from({ length: 14 }, (_, i) => i + 5).map((age) => (
                    <option key={age}>{age} лет</option>
                  ))}
                </select>
              </Field>
              <Field label="В какой класс поступаете">
                <select className={input} defaultValue="">
                  <option value="" disabled>
                    Выберите
                  </option>
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((grade) => (
                    <option key={grade}>{grade} класс</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Когда планируете начать">
              <select className={input}>
                <option>С сентября</option>
                <option>С января</option>
                <option>Как можно скорее</option>
                <option>Пока присматриваемся</option>
              </select>
            </Field>
            <Field label="Что важно рассказать о ребёнке" hint="Необязательно">
              <textarea
                rows={3}
                placeholder="Особенности, интересы, опыт в других школах"
                className={input}
              />
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <Field label="Ваше имя">
              <input type="text" placeholder="Как к вам обращаться" className={input} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Телефон">
                <input type="tel" placeholder="+7 900 000-00-00" className={input} />
              </Field>
              <Field label="Почта">
                <input type="email" placeholder="name@mail.ru" className={input} />
              </Field>
            </div>
            <Field label="Удобный способ связи">
              <select className={input}>
                <option>Телефон</option>
                <option>WhatsApp</option>
                <option>Telegram</option>
                <option>Почта</option>
              </select>
            </Field>
            <label className="flex items-start gap-2.5 text-sm text-ink-muted">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                Согласен на обработку персональных данных и передачу заявки выбранной школе
              </span>
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="py-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-done-soft text-xl text-done">
              ✓
            </div>
            <h2 className="mt-3 text-lg font-semibold text-ink">Заявка отправлена</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              {school ? school.name : "Школа"} получит её и свяжется с вами в течение одного
              рабочего дня. Статус можно посмотреть в разделе «Мои заявки».
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href="/prototype/cabinet"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-text"
              >
                Мои заявки
              </Link>
              <Link
                href="/prototype/catalog"
                className="rounded-lg border border-line-strong px-4 py-2 text-sm text-ink hover:bg-surface-sunken"
              >
                Смотреть другие школы
              </Link>
            </div>
          </div>
        ) : null}

        {step < 3 ? (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
            {step > 1 ? (
              <Link
                href={stepHref(step - 1)}
                className="rounded-lg border border-line-strong px-4 py-2 text-sm text-ink hover:bg-surface-sunken"
              >
                Назад
              </Link>
            ) : (
              <span />
            )}
            <Link
              href={stepHref(step + 1)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-text"
            >
              {step === 2 ? "Отправить заявку" : "Далее"}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="text-xs text-ink-faint">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
