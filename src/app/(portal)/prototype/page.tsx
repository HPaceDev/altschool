import Link from "next/link";
import {
  RO_DEPTH_LABEL,
  SCHOOLS,
  coverage,
  filterSchools,
  type RoDepth,
} from "@/lib/prototype-data";
import { SchoolCard } from "@/components/prototype/parts";
import { plural } from "@/lib/labels";

export const metadata = { title: "Прототип" };

const HOW_WE_CHECK = [
  {
    title: "Запрашиваем документы",
    text: "Учебный план, лицензия, сертификаты педагогов. Без документа факт остаётся заявленным.",
  },
  {
    title: "Указываем источник и дату",
    text: "У каждого поля видно, откуда оно взято и когда проверялось в последний раз.",
  },
  {
    title: "Данные стареют за 90 дней",
    text: "Дальше карточка получает статус «требует обновления» — молча устаревать нечему.",
  },
];

export default function PrototypeHome() {
  const regions = coverage().filter((r) => r.total > 0);
  const verified = SCHOOLS.filter((s) => s.status === "verified").length;
  const fresh = filterSchools({ sort: "checked" }).slice(0, 3);
  const byDepth = (depth: RoDepth) => SCHOOLS.filter((s) => s.roDepth === depth).length;

  return (
    <>
      <section className="rounded-2xl border border-line bg-surface-raised px-5 py-8 sm:px-8 sm:py-10">
        <h1 className="display max-w-2xl text-3xl leading-tight text-ink sm:text-4xl">
          Школы развивающего обучения, где практику можно проверить
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
          Тег «РО» на сайте ставят себе многие. Мы показываем, что за ним стоит: учебный
          план, подготовка педагогов, документы — с указанием источника и даты проверки.
        </p>

        <form action="/prototype/catalog" className="mt-6 grid gap-2.5 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            name="query"
            placeholder="Название школы, город или район"
            aria-label="Поиск"
            className="w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
          <select
            name="region"
            aria-label="Регион"
            className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          >
            <option value="">Вся Россия</option>
            {regions.map((r) => (
              <option key={r.region} value={r.region}>
                {r.region}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Найти
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/prototype/catalog?status=verified"
            className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent-text"
          >
            Только проверенные · {verified}
          </Link>
          {(["full", "primary"] as RoDepth[]).map((depth) => (
            <Link
              key={depth}
              href={`/prototype/catalog?roDepth=${depth}`}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent-text"
            >
              {RO_DEPTH_LABEL[depth]} · {byDepth(depth)}
            </Link>
          ))}
          <Link
            href="/prototype/catalog?maxPrice=0"
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent-text"
          >
            Бесплатные
          </Link>
        </div>
      </section>

      {/* География — то, ради чего продукт называется картой. */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="display text-lg text-ink">География</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {plural(SCHOOLS.length, "школа", "школы", "школ")} в{" "}
              {plural(regions.length, "регионе", "регионах", "регионах")}, из них {verified}{" "}
              проверены редакцией
            </p>
          </div>
          <Link
            href="/prototype/map"
            className="text-sm text-accent-text underline underline-offset-2"
          >
            Открыть карту
          </Link>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((r) => (
            <li key={r.region}>
              <Link
                href={`/prototype/catalog?region=${encodeURIComponent(r.region)}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 transition-colors hover:border-line-strong"
              >
                <span className="min-w-0 truncate text-sm text-ink">{r.region}</span>
                <span className="nums shrink-0 text-sm text-ink-faint">
                  {r.total}
                  {r.verified > 0 ? (
                    <span className="ml-1 text-done">· {r.verified} ✓</span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="display text-lg text-ink">Как мы проверяем данные</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {HOW_WE_CHECK.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-line bg-surface-raised p-4">
              <span className="nums grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text">
                {index + 1}
              </span>
              <h3 className="mt-3 font-medium text-ink">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="display text-lg text-ink">Недавно проверенные</h2>
          <Link
            href="/prototype/catalog"
            className="text-sm text-accent-text underline underline-offset-2"
          >
            Весь каталог
          </Link>
        </div>
        <div className="space-y-3">
          {fresh.map((school) => (
            <SchoolCard key={school.slug} school={school} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-line bg-surface-sunken px-5 py-6">
        <h2 className="display text-base text-ink">Вы руководите школой?</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Добавьте карточку сами: она появится в каталоге со статусом «заявлено школой».
          После проверки документов редакция поменяет статус на «проверено».
        </p>
        <Link
          href="/prototype/add-school"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Добавить школу
        </Link>
      </section>
    </>
  );
}
