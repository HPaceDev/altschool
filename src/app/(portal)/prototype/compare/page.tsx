import Link from "next/link";
import {
  FORMAT_LABEL,
  ageRange,
  findSchool,
  formatPrice,
  type School,
} from "@/lib/prototype-data";
import { Photo, Rating } from "@/components/prototype/parts";

export const metadata = { title: "Сравнение" };

const ROWS: { label: string; value: (s: School) => string }[] = [
  { label: "Тип", value: (s) => s.kind },
  { label: "Формат", value: (s) => FORMAT_LABEL[s.format] },
  { label: "Город", value: (s) => `${s.city}${s.district !== "Вся Россия" ? `, ${s.district}` : ""}` },
  { label: "Возраст", value: (s) => ageRange(s) },
  { label: "Стоимость в месяц", value: (s) => formatPrice(s.pricePerMonth) },
  { label: "Вступительный взнос", value: (s) => (s.admissionFee ? formatPrice(s.admissionFee) : "нет") },
  { label: "Человек в классе", value: (s) => `до ${s.classSize}` },
  { label: "Языки", value: (s) => s.languages.join(", ") },
  { label: "Лицензия", value: (s) => (s.hasLicence ? "есть" : "нет") },
  { label: "Детский сад", value: (s) => (s.hasKindergarten ? "есть" : "нет") },
  { label: "Расписание", value: (s) => s.schedule },
  {
    label: "Набор",
    value: (s) =>
      s.admissionOpen ? (s.seatsLeft ? `открыт, мест: ${s.seatsLeft}` : "открыт") : "закрыт",
  },
  { label: "Что входит", value: (s) => s.features.join(", ") },
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
    .slice(0, 3);

  if (schools.length === 0) {
    return (
      <>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Сравнение</h1>
        <div className="mt-4 rounded-xl border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-medium text-ink">Вы пока ничего не выбрали</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-faint">
            В каталоге у каждой школы есть кнопка «Сравнить». Можно выбрать до трёх школ
            и посмотреть их характеристики рядом.
          </p>
          <Link
            href="/prototype/catalog"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-text"
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
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Сравнение школ
          <span className="ml-2 text-sm font-normal text-ink-faint">{schools.length} из 3</span>
        </h1>
        <Link
          href="/prototype/catalog"
          className="text-sm text-accent-text underline underline-offset-2"
        >
          Добавить ещё
        </Link>
      </div>

      <div className="table-scroll mt-4 rounded-xl border border-line bg-surface-raised">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-44 border-b border-line px-4 py-3 text-left align-bottom text-xs font-semibold tracking-wide text-ink-faint uppercase">
                Параметр
              </th>
              {schools.map((school) => (
                <th key={school.slug} className="border-b border-line p-4 text-left align-bottom">
                  <Photo school={school} className="mb-2 h-20 w-full rounded-lg" />
                  <Link
                    href={`/prototype/school/${school.slug}`}
                    className="block font-semibold text-ink hover:text-accent-text"
                  >
                    {school.name}
                  </Link>
                  <div className="mt-1">
                    <Rating value={school.rating} count={school.reviewsCount} />
                  </div>
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
              const values = schools.map(row.value);
              // Различия подсвечиваются: ради них сравнение и открывают.
              const allSame = values.every((v) => v === values[0]);

              return (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <th className="px-4 py-2.5 text-left font-normal text-ink-faint">{row.label}</th>
                  {values.map((value, index) => (
                    <td
                      key={schools[index].slug}
                      className={`px-4 py-2.5 align-top ${
                        allSame ? "text-ink-muted" : "font-medium text-ink"
                      }`}
                    >
                      {value}
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
                    href={`/prototype/request?school=${school.slug}`}
                    className="inline-block rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-text"
                  >
                    Записаться
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        Жирным выделены параметры, по которым школы отличаются.
      </p>
    </>
  );
}
