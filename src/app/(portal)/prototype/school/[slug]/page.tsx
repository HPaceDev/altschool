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
      <p className="mb-4 text-xs text-ink-faint">
        <Link href="/prototype/catalog" className="hover:text-accent-text">
          Каталог
        </Link>{" "}
        / {school.city} / {school.name}
      </p>

      {/* Обложка: статус данных и название на одном экране. Снимка нет,
          поэтому под плашкой прямо сказано, что он ещё не получен. */}
      <div className="relative overflow-hidden rounded-3xl">
        <Photo school={school} className="min-h-[15rem] w-full sm:min-h-[19rem]" initials={false} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(12,24,16,.78), rgba(12,24,16,.15) 62%)",
          }}
        />
        <div className="absolute top-5 left-5 flex flex-wrap gap-2 sm:top-7 sm:left-8">
          <StatusBadge status={school.status} onDark />
          {school.inNetwork ? (
            <span className="inline-flex items-center rounded-full bg-deep/85 px-2.5 py-1 text-xs font-medium text-white">
              точка сети
            </span>
          ) : null}
        </div>
        <div className="absolute right-5 bottom-6 left-5 sm:right-8 sm:bottom-8 sm:left-8">
          <h1 className="display text-2xl text-white sm:text-4xl">{school.name}</h1>
          <p className="mt-2 text-sm text-white/80">
            {school.city}
            {school.district ? `, ${school.district}` : ""} · {FORMAT_LABEL[school.format]} ·{" "}
            {school.grades}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        Фотографии появятся, когда школа заполнит профиль — сейчас это заглушка.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {/* Ключевые факты — то, ради чего родитель зашёл. */}
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
              <dt className="text-xs text-ink-faint">Глубина РО</dt>
              <dd
                className="mt-1 text-[15px] font-medium text-ink"
                title={RO_DEPTH_HINT[school.roDepth]}
              >
                {RO_DEPTH_LABEL[school.roDepth]}
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
              <dt className="text-xs text-ink-faint">Последняя проверка</dt>
              <dd className="mt-1 text-[15px] font-medium text-ink">{school.checkedOn}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
              <dt className="text-xs text-ink-faint">Набор</dt>
              <dd className="mt-1 text-[15px] font-medium text-ink">{school.admission.value}</dd>
            </div>
          </dl>

          {stale ? (
            <p className="mt-4 rounded-2xl border border-blocker/30 bg-blocker-soft px-5 py-4 text-sm text-blocker">
              Данным больше 90 дней. Мы запросили обновление у школы — до ответа
              полагаться на цены и наличие мест не стоит.
            </p>
          ) : null}

          <section className="mt-10">
            <h2 className="display text-xl text-ink">О школе</h2>
            <p className="prose-portal mt-3 text-[15px] leading-relaxed text-ink-muted">
              {school.about}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="display text-xl text-ink">Как реализуется развивающее обучение</h2>
            <ul className="mt-3 space-y-2">
              {school.practice.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-muted">
                  <span aria-hidden className="text-ink-faint">
                    ·
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-2xl border border-line bg-surface-sunken px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.1em] text-ink uppercase">
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

          <section className="mt-10">
            <h2 className="display text-xl text-ink">Доказательства и юридический статус</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              У каждого поля видно, откуда оно взято и когда проверялось. Пустых прочерков
              нет: если данных нет, так и написано.
            </p>
            <dl className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface-raised">
              <FactRow label="Лицензия" fact={school.licence} />
              <FactRow label="Аккредитация" fact={school.accreditation} />
              <FactRow label="Учебный план" fact={school.curriculum} />
              <FactRow label="Наполняемость класса" fact={school.classSize} />
              <FactRow label="Педагоги" fact={school.teachers} />
              <FactRow label="Набор" fact={school.admission} />
            </dl>
          </section>

          <section className="mt-10">
            <h2 className="display text-xl text-ink">Как поступить</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {school.admissionSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-line bg-surface-raised px-5 py-4"
                >
                  <span className="nums text-xs font-semibold tracking-[0.1em] text-accent-text uppercase">
                    Шаг {index + 1}
                  </span>
                  <p className="display mt-2 text-base text-ink">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Боковая панель: цена и заявка */}
        <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl bg-deep p-6 text-white">
            <p className="text-xs font-semibold tracking-[0.1em] text-deep-text uppercase">
              Стоимость обучения
            </p>
            <p className="nums display mt-2.5 text-3xl">
              {formatPrice(school.pricePerMonth)}
              {school.pricePerMonth ? (
                <span className="font-sans text-base font-normal text-deep-text"> / мес</span>
              ) : null}
            </p>
            <p className="mt-2 text-xs text-deep-text">
              {school.status === "verified"
                ? `цена подтверждена ${school.checkedOn}`
                : "цена со слов школы, редакция не проверяла"}
            </p>

            <form className="mt-6 space-y-2.5">
              <input
                type="text"
                placeholder="Ваше имя"
                aria-label="Ваше имя"
                className="min-h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3.5 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Телефон"
                aria-label="Телефон"
                className="min-h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3.5 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
              />
              <Link
                href={`/prototype/school/${school.slug}/sent`}
                className="flex min-h-12 items-center justify-center rounded-xl bg-white px-4 text-center text-[15px] font-medium text-deep transition-colors hover:bg-accent-soft"
              >
                Записаться на экскурсию
              </Link>
            </form>

            <p className="mt-4 text-xs leading-relaxed text-deep-text">
              Заявка бесплатна и уходит напрямую в школу. Обычно отвечают в течение
              рабочего дня.
            </p>
          </div>

          <div className="space-y-2.5 rounded-2xl border border-line bg-surface-raised p-5">
            <FavoriteButton slug={school.slug} />
            <Link
              href={`/prototype/compare?schools=${school.slug}`}
              className="flex min-h-11 items-center justify-center rounded-full border border-line-strong px-4 text-center text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent-text"
            >
              Добавить к сравнению
            </Link>
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-20">
          <h2 className="display mb-6 text-2xl text-ink">Похожие школы</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <SchoolCard key={item.slug} school={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
