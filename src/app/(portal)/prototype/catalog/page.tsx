import Link from "next/link";
import {
  CITIES,
  FORMAT_LABEL,
  KINDS,
  filterSchools,
  type Filters,
  type SchoolFormat,
} from "@/lib/prototype-data";
import { SchoolCard } from "@/components/prototype/parts";
import { plural } from "@/lib/labels";

export const metadata = { title: "Каталог" };

type Params = Record<string, string | undefined>;

/** Ссылка, сохраняющая текущие фильтры и меняющая один параметр. */
function withParam(params: Params, key: string, value?: string): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) next.set(k, v);
  if (value) next.set(key, value);
  else next.delete(key);
  const qs = next.toString();
  return qs ? `/prototype/catalog?${qs}` : "/prototype/catalog";
}

function toggleCompare(params: Params, slug: string): string {
  const current = (params.compare ?? "").split(",").filter(Boolean);
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug].slice(0, 3);
  return withParam(params, "compare", next.join(","));
}

const SORTS = [
  { value: "rating", label: "По рейтингу" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
] as const;

const PRICE_STEPS = [30000, 60000, 100000, 200000];
const AGES = [5, 7, 10, 13, 16];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;

  const filters: Filters = {
    city: params.city,
    kind: params.kind,
    format: params.format as SchoolFormat | undefined,
    age: params.age ? Number(params.age) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    query: params.query,
    sort: (params.sort as Filters["sort"]) ?? "rating",
  };

  const results = filterSchools(filters);
  const compare = (params.compare ?? "").split(",").filter(Boolean);
  const hasFilters = ["city", "kind", "format", "age", "maxPrice", "query"].some((k) => params[k]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Каталог школ</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {results.length > 0
              ? `${plural(results.length, "школа", "школы", "школ")} по вашим условиям`
              : "Под ваши условия ничего не нашлось"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SORTS.map((sort) => (
            <Link
              key={sort.value}
              href={withParam(params, "sort", sort.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                (params.sort ?? "rating") === sort.value
                  ? "border-accent bg-accent-soft text-accent-text"
                  : "border-line-strong text-ink-muted hover:bg-surface-sunken"
              }`}
            >
              {sort.label}
            </Link>
          ))}
        </div>
      </div>

      {compare.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3">
          <p className="text-sm text-accent-text">
            К сравнению выбрано: {compare.length} из 3
          </p>
          <Link
            href={`/prototype/compare?schools=${compare.join(",")}`}
            className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white hover:bg-accent-text"
          >
            Сравнить
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Фильтры */}
        <aside className="space-y-5">
          <FilterGroup title="Город">
            <FilterLink href={withParam(params, "city")} active={!params.city}>
              Любой
            </FilterLink>
            {CITIES.map((city) => (
              <FilterLink
                key={city}
                href={withParam(params, "city", city)}
                active={params.city === city}
              >
                {city}
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup title="Тип школы">
            <FilterLink href={withParam(params, "kind")} active={!params.kind}>
              Любой
            </FilterLink>
            {KINDS.map((kind) => (
              <FilterLink
                key={kind}
                href={withParam(params, "kind", kind)}
                active={params.kind === kind}
              >
                {kind}
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup title="Формат">
            <FilterLink href={withParam(params, "format")} active={!params.format}>
              Любой
            </FilterLink>
            {(Object.keys(FORMAT_LABEL) as SchoolFormat[]).map((format) => (
              <FilterLink
                key={format}
                href={withParam(params, "format", format)}
                active={params.format === format}
              >
                {FORMAT_LABEL[format]}
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup title="Возраст ребёнка">
            <FilterLink href={withParam(params, "age")} active={!params.age}>
              Любой
            </FilterLink>
            {AGES.map((age) => (
              <FilterLink
                key={age}
                href={withParam(params, "age", String(age))}
                active={params.age === String(age)}
              >
                {age} лет
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup title="Бюджет в месяц">
            <FilterLink href={withParam(params, "maxPrice")} active={!params.maxPrice}>
              Любой
            </FilterLink>
            {PRICE_STEPS.map((price) => (
              <FilterLink
                key={price}
                href={withParam(params, "maxPrice", String(price))}
                active={params.maxPrice === String(price)}
              >
                до {price.toLocaleString("ru-RU")} ₽
              </FilterLink>
            ))}
          </FilterGroup>

          {hasFilters ? (
            <Link
              href={params.compare ? `/prototype/catalog?compare=${params.compare}` : "/prototype/catalog"}
              className="block text-sm text-accent-text underline underline-offset-2"
            >
              Сбросить фильтры
            </Link>
          ) : null}
        </aside>

        {/* Результаты */}
        <div>
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong px-6 py-12 text-center">
              <p className="font-medium text-ink">Ничего не нашлось</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-faint">
                Попробуйте расширить бюджет или убрать фильтр по типу школы. Если школы
                вашего района ещё нет в каталоге, оставьте заявку — мы поищем вручную.
              </p>
              <Link
                href="/prototype/catalog"
                className="mt-4 inline-block rounded-lg border border-line-strong px-3.5 py-2 text-sm text-ink hover:bg-surface-sunken"
              >
                Сбросить фильтры
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((school) => (
                <SchoolCard
                  key={school.slug}
                  school={school}
                  compareHref={toggleCompare(params, school.slug)}
                  inCompare={compare.includes(school.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
        {title}
      </h2>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`block rounded-md px-2 py-1 text-sm transition-colors ${
        active ? "bg-accent-soft font-medium text-accent-text" : "text-ink-muted hover:bg-surface-sunken"
      }`}
    >
      {children}
    </Link>
  );
}
