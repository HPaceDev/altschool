import Link from "next/link";
import { CITIES, KINDS, SCHOOLS, filterSchools } from "@/lib/prototype-data";
import { SchoolCard } from "@/components/prototype/parts";

export const metadata = { title: "Прототип" };

const STEPS = [
  {
    title: "Расскажите о ребёнке",
    text: "Возраст, город и что для вас важно: формат, языки, бюджет.",
  },
  {
    title: "Сравните подходящие школы",
    text: "Мы покажем те, где есть места, и дадим сравнить их рядом.",
  },
  {
    title: "Запишитесь на встречу",
    text: "Одна заявка — школа связывается с вами и приглашает на день открытых дверей.",
  },
];

export default function PrototypeHome() {
  const popular = filterSchools({ sort: "rating" }).slice(0, 4);

  return (
    <>
      {/* Поиск */}
      <section className="rounded-2xl border border-line bg-surface-raised px-5 py-8 sm:px-8 sm:py-10">
        <h1 className="display max-w-xl text-3xl leading-tight text-ink sm:text-4xl">
          Найдите школу, в которую ребёнок захочет ходить
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          {SCHOOLS.length} проверенных частных, семейных и онлайн-школ. Сравнивайте по
          программе, цене и отзывам, записывайтесь на встречу в один клик.
        </p>

        <form action="/prototype/catalog" className="mt-6 grid gap-2.5 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            name="query"
            placeholder="Название школы, район или программа"
            aria-label="Поиск"
            className="w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
          <select
            name="city"
            aria-label="Город"
            className="rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          >
            <option value="">Любой город</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Найти
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {KINDS.map((kind) => (
            <Link
              key={kind}
              href={`/prototype/catalog?kind=${encodeURIComponent(kind)}`}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted hover:border-accent hover:text-accent-text"
            >
              {kind}
            </Link>
          ))}
        </div>
      </section>

      {/* Как это работает */}
      <section className="mt-10">
        <h2 className="display text-lg text-ink">Как это работает</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-line bg-surface-raised p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text">
                {index + 1}
              </span>
              <h3 className="mt-3 font-medium text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Популярные школы */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="display text-lg text-ink">Чаще всего выбирают</h2>
          <Link
            href="/prototype/catalog"
            className="text-sm text-accent-text underline underline-offset-2"
          >
            Весь каталог
          </Link>
        </div>
        <div className="space-y-3">
          {popular.map((school) => (
            <SchoolCard key={school.slug} school={school} />
          ))}
        </div>
      </section>
    </>
  );
}
