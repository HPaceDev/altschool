import Link from "next/link";
import {
  FORMAT_LABEL,
  RO_DEPTH_LABEL,
  findSchool,
  formatPrice,
  type Fact,
  type School,
} from "@/lib/prototype-data";
import { Photo, StatusBadge } from "@/components/prototype/parts";

export const metadata = { title: "Сравнение" };

/** Строка сравнения. Возвращает факт, чтобы показать статус рядом со значением. */
const ROWS: { label: string; value: (s: School) => Fact }[] = [
  {
    label: "Статус данных",
    value: (s) => ({ value: `проверено ${s.checkedOn}`, status: s.status }),
  },
  {
    label: "Глубина РО",
    value: (s) => ({ value: RO_DEPTH_LABEL[s.roDepth], status: s.status }),
  },
  {
    label: "Формат",
    value: (s) => ({ value: FORMAT_LABEL[s.format], status: "verified" }),
  },
  {
    label: "Город",
    value: (s) => ({
      value: `${s.city}${s.district ? `, ${s.district}` : ""}`,
      status: "verified",
    }),
  },
  { label: "Классы", value: (s) => ({ value: s.grades, status: "verified" }) },
  {
    label: "Стоимость в месяц",
    value: (s) => ({
      value: formatPrice(s.pricePerMonth),
      status: s.pricePerMonth === null ? "missing" : s.status,
    }),
  },
  { label: "Лицензия", value: (s) => s.licence },
  { label: "Аккредитация", value: (s) => s.accreditation },
  { label: "Учебный план", value: (s) => s.curriculum },
  { label: "Наполняемость класса", value: (s) => s.classSize },
  { label: "Педагоги", value: (s) => s.teachers },
  { label: "Набор", value: (s) => s.admission },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ schools?: string }>;
}) {
  const { schools: raw } = await searchParams;
  const schools = (raw ?? "")
    .split(",")
    .filter(Boolean)
    .map(findSchool)
    .filter((s): s is School => Boolean(s))
    .slice(0, 4);

  if (schools.length === 0) {
    return (
      <>
        <h1 className="display text-3xl text-ink">Сравнение</h1>
        <div className="mt-4 rounded-2xl border border-dashed border-line-strong bg-surface-raised px-6 py-14 text-center">
          <p className="font-medium text-ink">Вы пока ничего не выбрали</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-faint">
            В каталоге у каждой школы есть кнопка «Сравнить». Можно выбрать до четырёх
            школ и посмотреть их рядом — вместе со статусом каждого поля.
          </p>
          <Link
            href="/prototype/catalog"
            className="mt-4 inline-block inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Перейти в каталог
          </Link>
        </div>
      </>
    );
  }

  const removeHref = (slug: string) => {
    const rest = schools.filter((s) => s.slug !== slug).map((s) => s.slug);
    return rest.length ? `/prototype/compare?schools=${rest.join(",")}` : "/prototype/compare";
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="display text-3xl text-ink">
          Сравнение школ
          <span className="ml-2 text-sm font-normal text-ink-faint">
            {schools.length} из 4
          </span>
        </h1>
        <Link
          href="/prototype/catalog"
          className="text-sm text-accent-text underline underline-offset-2"
        >
          Добавить ещё
        </Link>
      </div>

      <div className="table-scroll mt-6 overflow-hidden rounded-2xl border border-line bg-surface-raised">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-48 border-b border-line px-4 py-3 text-left align-bottom text-xs font-semibold tracking-wide text-ink-faint uppercase">
                Параметр
              </th>
              {schools.map((school) => (
                <th key={school.slug} className="border-b border-line p-4 text-left align-bottom">
                  <Photo school={school} className="mb-2.5 h-20 w-full rounded-xl" />
                  <Link
                    href={`/prototype/school/${school.slug}`}
                    className="display block text-sm text-ink hover:text-accent-text"
                  >
                    {school.name}
                  </Link>
                  <Link
                    href={removeHref(school.slug)}
                    className="mt-1.5 inline-block text-xs text-ink-faint underline underline-offset-2 hover:text-blocker"
                  >
                    Убрать
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const facts = schools.map(row.value);
              // Различия подсвечиваются: ради них сравнение и открывают.
              const allSame = facts.every((f) => f.value === facts[0].value);

              return (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <th className="px-4 py-3 text-left align-top font-normal text-ink-faint">
                    {row.label}
                  </th>
                  {facts.map((fact, index) => (
                    <td key={schools[index].slug} className="px-4 py-3 align-top">
                      <span
                        className={`block ${
                          fact.status === "missing"
                            ? "text-ink-faint italic"
                            : allSame
                              ? "text-ink-muted"
                              : "font-medium text-ink"
                        }`}
                      >
                        {fact.value}
                      </span>
                      {fact.status !== "verified" ? (
                        <span className="mt-1 inline-block">
                          <StatusBadge status={fact.status} short />
                        </span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <th className="px-4 py-3" />
              {schools.map((school) => (
                <td key={school.slug} className="px-4 py-3">
                  <Link
                    href={`/prototype/school/${school.slug}`}
                    className="inline-block inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    Открыть
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-ink-faint">
        Жирным выделено то, чем школы отличаются. Там, где данных нет, так и написано —
        прочерк скрыл бы разницу между «бесплатно» и «неизвестно».
      </p>
    </>
  );
}
