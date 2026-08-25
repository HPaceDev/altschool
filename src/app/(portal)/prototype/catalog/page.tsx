import Link from "next/link";
import {
  FACT_STATUS_LABEL,
  FORMAT_LABEL,
  REGIONS,
  RO_DEPTH_LABEL,
  filterSchools,
  type FactStatus,
  type Filters,
  type RoDepth,
  type SchoolFormat,
} from "@/lib/prototype-data";
import { Kicker, SchoolCard } from "@/components/prototype/parts";
import { plural } from "@/lib/labels";

export const metadata = { title: "Каталог" };

type Params = Record<string, string | undefined>;

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
    : [...current, slug].slice(0, 4);
  return withParam(params, "compare", next.join(","));
}

const SORTS = [
  { value: "checked", label: "Сначала проверенные" },
  { value: "ro", label: "По глубине РО" },
  { value: "price-asc", label: "Сначала дешевле" },
] as const;

const PRICE_STEPS = [0, 30000, 40000, 60000];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;

  const filters: Filters = {
    region: params.region,
    format: params.format as SchoolFormat | undefined,
    status: params.status as FactStatus | undefined,
    roDepth: params.roDepth as RoDepth | undefined,
    maxPrice: params.maxPrice !== undefined ? Number(params.maxPrice) : undefined,
    query: params.query,
    sort: (params.sort as Filters["sort"]) ?? "checked",
  };

  const results = filterSchools(filters);
  const compare = (params.compare ?? "").split(",").filter(Boolean);
  const hasFilters = ["region", "format", "status", "roDepth", "maxPrice", "query"].some(
    (k) => params[k] !== undefined,
  );

  return (
    <>
      <div className="mb-8">
        <p className="mb-4 text-xs text-ink-faint">
          <Link href="/prototype" className="hover:text-accent-text">
            Главная
          </Link>{" "}
          / Каталог
        </p>
        <Kicker>Каталог</Kicker>
        <h1 className="display mt-3 max-w-2xl text-3xl text-ink sm:text-4xl">
          Школы развивающего обучения
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          Фильтры работают прямо в прототипе. Статус данных стоит в каждой карточке:
          он показывает не качество школы, а то, чем подтверждены её слова.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-5">
        <p className="text-sm text-ink-muted">
          {results.length > 0
            ? `Найдено: ${plural(results.length, "школа", "школы", "школ")}`
            : "Под ваши условия ничего не нашлось"}
        </p>

        <div className="flex flex-wrap gap-2">
          {SORTS.map((sort) => (
            <Link
              key={sort.value}
              href={withParam(params, "sort", sort.value)}
              className={`inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm transition-colors ${
                (params.sort ?? "checked") === sort.value
                  ? "border-accent bg-accent-soft font-medium text-accent-text"
                  : "border-line text-ink-muted hover:border-accent hover:text-accent-text"
              }`}
            >
              {sort.label}
            </Link>
          ))}
        </div>
      </div>

      {compare.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent-line bg-accent-soft px-5 py-3.5">
          <p className="text-sm text-accent-text">К сравнению выбрано: {compare.length} из 4</p>
          <Link
            href={`/prototype/compare?schools=${compare.join(",")}`}
            className="inline-flex min-h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Сравнить
          </Link>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[236px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <FilterGroup title="Статус данных">
            <FilterLink href={withParam(params, "status")} active={!params.status}>
              Любой
            </FilterLink>
            {(["verified", "claimed", "stale"] as FactStatus[]).map((status) => (
              <FilterLink
                key={status}
                href={withParam(params, "status", status)}
                active={params.status === status}
              >
                {FACT_STATUS_LABEL[status]}
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup title="Глубина РО">
            <FilterLink href={withParam(params, "roDepth")} active={!params.roDepth}>
              Любая
            </FilterLink>
            {(["full", "primary", "partial", "declared"] as RoDepth[]).map((depth) => (
              <FilterLink
                key={depth}
                href={withParam(params, "roDepth", depth)}
                active={params.roDepth === depth}
              >
                {RO_DEPTH_LABEL[depth]}
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup title="Регион">
            <FilterLink href={withParam(params, "region")} active={!params.region}>
              Вся Россия
            </FilterLink>
            {REGIONS.map((region) => (
              <FilterLink
                key={region}
                href={withParam(params, "region", region)}
                active={params.region === region}
              >
                {region}
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

          <FilterGroup title="Стоимость в месяц">
            <FilterLink href={withParam(params, "maxPrice")} active={params.maxPrice === undefined}>
              Любая
            </FilterLink>
            {PRICE_STEPS.map((price) => (
              <FilterLink
                key={price}
                href={withParam(params, "maxPrice", String(price))}
                active={params.maxPrice === String(price)}
              >
                {price === 0 ? "Бесплатно" : `до ${price.toLocaleString("ru-RU")} ₽`}
              </FilterLink>
            ))}
          </FilterGroup>

          {hasFilters ? (
            <Link
              href={
                params.compare
                  ? `/prototype/catalog?compare=${params.compare}`
                  : "/prototype/catalog"
              }
              className="block text-sm text-accent-text underline underline-offset-2"
            >
              Сбросить фильтры
            </Link>
          ) : null}
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-strong bg-surface-raised px-6 py-14 text-center">
              <span
                aria-hidden
                className="mx-auto mb-4 block h-12 w-12 rounded-full border border-line-strong"
              />
              <p className="display text-lg text-ink">Ничего не нашлось</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                Попробуйте снять фильтр по статусу данных: проверенных школ пока меньше,
                чем заявленных. Если школы вашего города нет в каталоге, расскажите нам о
                ней — мы запросим документы.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link
                  href="/prototype/catalog"
                  className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-4 text-sm text-ink hover:border-accent hover:text-accent-text"
                >
                  Сбросить фильтры
                </Link>
                <Link
                  href="/prototype/add-school"
                  className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Рассказать о школе
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
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
      <h2 className="mb-2 text-xs font-semibold tracking-[0.1em] text-ink uppercase">{title}</h2>
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
      className={`block rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-accent-soft font-medium text-accent-text"
          : "text-ink-muted hover:bg-surface hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
