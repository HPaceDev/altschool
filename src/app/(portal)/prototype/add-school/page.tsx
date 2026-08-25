import Link from "next/link";
import { StatusBadge } from "@/components/prototype/parts";

export const metadata = { title: "Добавить школу" };

const STEPS = ["Школа", "Практика РО", "Документы", "Готово"];

const input =
  "min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

/**
 * Саморегистрация школы: мастер из четырёх шагов.
 *
 * Карточка попадает в каталог сразу, но со статусом «заявлено школой» — так
 * база наполняется быстро, а доверие к проверенным данным не размывается.
 */
export default async function AddSchoolPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step: raw } = await searchParams;
  const step = Math.min(Math.max(Number(raw ?? 1), 1), 4);
  const stepHref = (next: number) => `/prototype/add-school?step=${next}`;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-3xl text-ink">Добавить школу в каталог</h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        Размещение бесплатное. Карточка появится сразу со статусом «заявлено школой»,
        а после проверки документов редакция поменяет статус.
      </p>

      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const done = number < step;
          const active = number === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`nums grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-semibold ${
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

      <div className="mt-8 rounded-2xl border border-line bg-surface-raised p-6 sm:p-8">
        {step === 1 ? (
          <div className="space-y-4">
            <Field label="Название школы">
              <input type="text" placeholder="Школа «Пример»" className={input} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Город">
                <input type="text" placeholder="Москва" className={input} />
              </Field>
              <Field label="Формат">
                <select className={input} defaultValue="">
                  <option value="" disabled>
                    Выберите
                  </option>
                  <option>Частная школа</option>
                  <option>Семейные классы</option>
                  <option>Центр развития</option>
                  <option>Государственная</option>
                </select>
              </Field>
            </div>
            <Field label="Классы">
              <input type="text" placeholder="1–4" className={input} />
            </Field>
            <Field label="Стоимость обучения в месяц" hint="Скрытая цена снижает доверие родителей">
              <input type="text" placeholder="35 000 ₽" className={input} />
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <Field label="На каких ступенях работаете по РО">
              <select className={input} defaultValue="">
                <option value="" disabled>
                  Выберите
                </option>
                <option>Вся школа</option>
                <option>Начальная школа полностью</option>
                <option>Отдельные классы</option>
                <option>Не работаем по РО</option>
              </select>
            </Field>
            <Field
              label="Как именно это устроено"
              hint="Что происходит на уроке, как готовятся педагоги"
            >
              <textarea rows={4} className={input} />
            </Field>
            <Field label="Сколько педагогов прошли подготовку по методике">
              <input type="text" placeholder="9 из 14" className={input} />
            </Field>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-line bg-surface-sunken px-4 py-3.5 text-sm leading-relaxed text-ink-muted">
              Документы нужны, чтобы карточка получила статус «проверено редакцией».
              Без них школа останется в каталоге со статусом «заявлено».
            </p>
            {["Лицензия", "Учебный план", "Сертификаты педагогов"].map((doc) => (
              <Field key={doc} label={doc} hint="PDF или фотография">
                <input type="file" className={`${input} file:mr-3 file:border-0 file:bg-transparent file:text-sm file:text-accent-text`} />
              </Field>
            ))}
            <Field label="Контакт для проверки" hint="Кому редакция может позвонить с уточнениями">
              <input type="text" placeholder="Имя и телефон" className={input} />
            </Field>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="py-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-done-soft text-xl text-done">
              ✓
            </div>
            <h2 className="display mt-3 text-lg text-ink">Карточка создана</h2>
            <div className="mt-3 flex justify-center">
              <StatusBadge status="claimed" />
            </div>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
              Школа уже видна в каталоге. Редакция проверит документы и поменяет статус —
              обычно это занимает несколько рабочих дней. Срок проверки пока не
              согласован: вопрос{" "}
              <Link href="/questions/Q-030" className="underline underline-offset-2">
                Q-030
              </Link>
              .
            </p>
            <Link
              href="/prototype/catalog?status=claimed"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Посмотреть каталог
            </Link>
          </div>
        ) : null}

        {step < 4 ? (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
            {step > 1 ? (
              <Link
                href={stepHref(step - 1)}
                className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 text-sm text-ink transition-colors hover:border-accent hover:text-accent-text"
              >
                Назад
              </Link>
            ) : (
              <span />
            )}
            <Link
              href={stepHref(step + 1)}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {step === 3 ? "Отправить" : "Далее"}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

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
      <span className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="text-xs text-ink-faint">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
