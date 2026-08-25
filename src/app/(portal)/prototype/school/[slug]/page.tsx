import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FORMAT_LABEL,
  RO_DEPTH_HINT,
  RO_DEPTH_LABEL,
  findSchool,
  formatPrice,
  similarTo,
} from "@/lib/prototype-data";
import { FactRow, Photo, SchoolCard, StatusBadge } from "@/components/prototype/parts";
import { FavoriteButton } from "@/components/prototype/favorites";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: findSchool(slug)?.name ?? "Школа" };
}

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = findSchool(slug);
  if (!school) notFound();

  const similar = similarTo(school);
  const stale = school.status === "stale";

  return (
    <>
      <Link
        href="/prototype/catalog"
        className="text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
      >
        ← В каталог
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_290px]">
        <div className="min-w-0">
          <Photo school={school} className="h-44 w-full rounded-xl sm:h-56" />
          <p className="mt-1.5 text-xs text-ink-faint">
            Фотографии появятся, когда школа заполнит профиль — сейчас это заглушка.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge status={school.status} />
            {school.inNetwork ? (
              <span className="rounded-md border border-accent/30 bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-text">
                точка сети
              </span>
            ) : null}
          </div>

          <h1 className="display mt-2.5 text-2xl text-ink">{school.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {school.city}
            {school.district ? `, ${school.district}` : ""} · {FORMAT_LABEL[school.format]} ·{" "}
            {school.grades}
          </p>

          {/* Шапка с ключевыми фактами — то, ради чего родитель зашёл. */}
          <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            <div className="bg-surface-raised px-4 py-3">
              <dt className="text-xs text-ink-faint">Глубина РО</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink" title={RO_DEPTH_HINT[school.roDepth]}>
                {RO_DEPTH_LABEL[school.roDepth]}
              </dd>
            </div>
            <div className="bg-surface-raised px-4 py-3">
              <dt className="text-xs text-ink-faint">Последняя проверка</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{school.checkedOn}</dd>
            </div>
            <div className="bg-surface-raised px-4 py-3">
              <dt className="text-xs text-ink-faint">Набор</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{school.admission.value}</dd>
            </div>
          </dl>

          {stale ? (
            <p className="mt-3 rounded-lg border border-blocker/30 bg-blocker-soft px-4 py-3 text-sm text-blocker">
              Данным больше 90 дней. Мы запросили обновление у школы — до ответа
              полагаться на цены и наличие мест не стоит.
            </p>
          ) : null}

          <section className="mt-7">
            <h2 className="display text-base text-ink">О школе</h2>
            <p className="prose-portal mt-2 text-sm leading-relaxed text-ink-muted">
              {school.about}
            </p>
          </section>

          <section className="mt-7">
            <h2 className="display text-base text-ink">Как реализуется развивающее обучение</h2>
            <ul className="mt-2 space-y-1.5">
              {school.practice.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-muted">
                  <span aria-hidden className="text-ink-faint">
                    ·
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-surface-sunken px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
                Откуда это известно
              </p>
              <p className="mt-1 text-sm text-ink">{school.practiceSource.value}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={school.practiceSource.status} short />
                {school.practiceSource.checkedOn ? (
                  <span className="text-xs text-ink-faint">
                    проверено {school.practiceSource.checkedOn}
                  </span>
                ) : null}
              </p>
            </div>
          </section>

          <section className="mt-7">
            <h2 className="display text-base text-ink">Документы и статус</h2>
            <p className="mt-1 text-sm text-ink-muted">
              У каждого поля видно, откуда оно взято и когда проверялось. Пустых прочерков
              нет: если данных нет, так и написано.
            </p>
            <dl className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface-raised">
              <FactRow label="Лицензия" fact={school.licence} />
              <FactRow label="Аккредитация" fact={school.accreditation} />
              <FactRow label="Учебный план" fact={school.curriculum} />
              <FactRow label="Наполняемость класса" fact={school.classSize} />
              <FactRow label="Педагоги" fact={school.teachers} />
              <FactRow label="Набор" fact={school.admission} />
            </dl>
          </section>

          <section className="mt-7">
            <h2 className="display text-base text-ink">Как поступить</h2>
            <ol className="mt-3 space-y-2.5">
              {school.admissionSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3"
                >
                  <span className="nums grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{step.title}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Боковая панель: цена и заявка */}
        <aside className="lg:sticky lg:top-16 lg:self-start">
          <div className="rounded-xl border border-line bg-surface-raised p-5">
            <p className="nums text-xl font-semibold text-ink">
              {formatPrice(school.pricePerMonth)}
              {school.pricePerMonth ? (
                <span className="text-sm font-normal text-ink-faint"> / мес</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {school.status === "verified"
                ? `цена подтверждена ${school.checkedOn}`
                : "цена со слов школы, редакция не проверяла"}
            </p>

            <form className="mt-4 space-y-2.5">
              <input
                type="text"
                placeholder="Ваше имя"
                aria-label="Ваше имя"
                className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Телефон"
                aria-label="Телефон"
                className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
              <Link
                href={`/prototype/school/${school.slug}/sent`}
                className="block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Записаться на экскурсию
              </Link>
            </form>

            <div className="mt-3 space-y-2">
              <FavoriteButton slug={school.slug} />
              <Link
                href={`/prototype/compare?schools=${school.slug}`}
                className="block rounded-lg border border-line-strong px-4 py-2 text-center text-sm text-ink-muted transition-colors hover:bg-surface-sunken"
              >
                Добавить к сравнению
              </Link>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Заявка бесплатна и уходит напрямую в школу. Обычно отвечают в течение
              рабочего дня.
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-10">
          <h2 className="display mb-4 text-lg text-ink">Похожие школы</h2>
          <div className="space-y-3">
            {similar.map((item) => (
              <SchoolCard key={item.slug} school={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
