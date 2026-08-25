import Link from "next/link";
import {
  RO_DEPTH_LABEL,
  SCHOOLS,
  coverage,
  filterSchools,
  type RoDepth,
} from "@/lib/prototype-data";
import { Kicker, SchoolCard, SectionHead } from "@/components/prototype/parts";
import { plural } from "@/lib/labels";

export const metadata = { title: "Прототип" };

const HOW_WE_CHECK = [
  {
    title: "Запрашиваем документы",
    text: "Учебный план, лицензия, сертификаты педагогов. Без документа факт остаётся заявленным — и так и подписан.",
  },
  {
    title: "Указываем источник и дату",
    text: "У каждого поля видно, откуда оно взято и когда проверялось в последний раз. Проверить можно нас самих.",
  },
  {
    title: "Данные стареют за 90 дней",
    text: "Дальше карточка получает статус «требует обновления». Молча устаревать здесь нечему.",
  },
];

const PATHS = [
  {
    n: "01",
    title: "Ищу школу ребёнку",
    text: "Сравните практику РО, стоимость, формат и условия поступления — по проверенным фактам, а не по обещаниям с сайта.",
    href: "/prototype/catalog",
    action: "Начать выбор",
  },
  {
    n: "02",
    title: "Хочу открыть школу",
    text: "Посмотрите франшизы, свободные территории и структуру вложений: паушальный взнос, роялти, срок выхода в ноль.",
    href: "/prototype/franchises",
    action: "Смотреть франшизы",
  },
];

export default function PrototypeHome() {
  const regions = coverage().filter((r) => r.total > 0);
  const verified = SCHOOLS.filter((s) => s.status === "verified").length;
  const fresh = filterSchools({ sort: "checked" }).slice(0, 3);
  const byDepth = (depth: RoDepth) => SCHOOLS.filter((s) => s.roDepth === depth).length;

  const stats = [
    { value: String(SCHOOLS.length), label: "школ в прототипе" },
    { value: String(regions.length), label: "регионов на карте" },
    { value: String(verified), label: "карточек проверено редакцией" },
    { value: "4", label: "уровня доказательности РО" },
  ];

  return (
    <>
      {/* Первый экран. Обещание сформулировано так, чтобы его можно было
          проверить: не «лучшие школы», а «видно, что стоит за словом РО». */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 sm:px-12 sm:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-64 -right-40 h-[34rem] w-[34rem] rounded-full border border-accent/15"
          style={{ boxShadow: "0 0 0 72px rgba(36,95,61,.03), 0 0 0 144px rgba(36,95,61,.02)" }}
        />

        <div className="relative max-w-3xl">
          <Kicker>Общероссийский образовательный атлас</Kicker>

          <h1 className="display mt-5 text-[2.1rem] text-ink sm:text-5xl">
            Школы, где учат мыслить, — и{" "}
            <span className="text-accent-text">видно, чем это подтверждено</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Тег «развивающее обучение» ставят себе многие. Мы показываем, что за ним
            стоит: учебный план, подготовка педагогов, документы — с указанием источника
            и даты проверки. Там, где данных нет, так и написано.
          </p>

          <form
            action="/prototype/catalog"
            className="mt-9 grid gap-2.5 rounded-2xl border border-line bg-surface-raised p-2.5 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_auto_auto]"
          >
            <input
              type="search"
              name="query"
              placeholder="Название школы, город или район"
              aria-label="Поиск"
              className="min-h-12 w-full rounded-xl border border-transparent bg-transparent px-4 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent-line focus:outline-none"
            />
            <select
              name="region"
              aria-label="Регион"
              className="min-h-12 rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink focus:border-accent focus:outline-none"
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
              className="min-h-12 rounded-xl bg-accent px-7 text-[15px] font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Найти
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/prototype/catalog?status=verified"
              className="inline-flex min-h-9 items-center rounded-full border border-accent-line bg-accent-soft px-3.5 text-sm font-medium text-accent-text"
            >
              Только проверенные · {verified}
            </Link>
            {(["full", "primary"] as RoDepth[]).map((depth) => (
              <Link
                key={depth}
                href={`/prototype/catalog?roDepth=${depth}`}
                className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3.5 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent-text"
              >
                {RO_DEPTH_LABEL[depth]} · {byDepth(depth)}
              </Link>
            ))}
            <Link
              href="/prototype/catalog?maxPrice=0"
              className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3.5 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent-text"
            >
              Бесплатные
            </Link>
          </div>
        </div>

        <dl className="relative mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="nums display text-3xl text-accent-text">{stat.value}</dt>
              <dd className="mt-1.5 text-sm text-ink-faint">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Два входа в продукт: родитель и партнёр. Это же деление на два
          контура заложено в смету, поэтому оно стоит сразу под первым экраном. */}
      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        {PATHS.map((path) => (
          <Link
            key={path.n}
            href={path.href}
            className="liftable relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-7"
          >
            <span
              aria-hidden
              className="display absolute top-5 right-6 text-4xl text-accent/15"
            >
              {path.n}
            </span>
            <h2 className="display text-xl text-ink">{path.title}</h2>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ink-muted">{path.text}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-text">
              {path.action}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </section>

      {/* География — то, ради чего продукт называется картой. */}
      <section className="mt-20">
        <SectionHead
          kicker="Карта"
          title="География РО становится видимой"
          lead={`${plural(SCHOOLS.length, "школа", "школы", "школ")} в ${plural(
            regions.length,
            "регионе",
            "регионах",
            "регионах",
          )}, из них ${verified} проверены редакцией. Пустые регионы здесь так же важны, как заполненные: они показывают, куда сети расти.`}
          action={{ href: "/prototype/map", label: "Открыть карту" }}
        />

        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((r) => (
            <li key={r.region}>
              <Link
                href={`/prototype/catalog?region=${encodeURIComponent(r.region)}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3.5 transition-colors hover:border-accent-line hover:bg-surface"
              >
                <span className="min-w-0 truncate text-sm font-medium text-ink">{r.region}</span>
                <span className="nums shrink-0 text-sm text-ink-faint">
                  {r.total}
                  {r.verified > 0 ? (
                    <span className="ml-1.5 text-accent-text">· {r.verified} ✓</span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20">
        <SectionHead
          kicker="Недавно проверенные"
          title="Карточки, у которых свежая дата проверки"
          action={{ href: "/prototype/catalog", label: "Весь каталог" }}
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {fresh.map((school) => (
            <SchoolCard key={school.slug} school={school} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHead
          kicker="Как это работает"
          title="Что стоит за словом «проверено»"
          lead="Проверяемость — единственное, чем карта отличается от справочника. Поэтому правила проверки открыты и одинаковы для всех школ."
        />
        <ol className="grid gap-4 md:grid-cols-3">
          {HOW_WE_CHECK.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-surface-raised p-6">
              <span className="nums display grid h-9 w-9 place-items-center rounded-full border border-accent-line bg-accent-soft text-base text-accent-text">
                {index + 1}
              </span>
              <h3 className="display mt-4 text-lg text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 overflow-hidden rounded-3xl bg-deep px-6 py-12 text-white sm:px-12">
        <div className="max-w-2xl">
          <p className="kicker text-accent-line">Школам</p>
          <h2 className="display mt-4 text-2xl sm:text-3xl">
            Добавьте себя на карту и покажите практику честно
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-deep-text">
            Базовая карточка бесплатна. Она появится в каталоге со статусом «заявлено
            школой»; после проверки документов редакция поменяет статус на «проверено».
            Так родитель видит разницу между обещанием и подтверждением.
          </p>
          <Link
            href="/prototype/add-school"
            className="mt-7 inline-flex min-h-12 items-center rounded-full bg-white px-6 text-[15px] font-medium text-deep transition-colors hover:bg-accent-soft"
          >
            Добавить школу
          </Link>
        </div>
      </section>
    </>
  );
}
