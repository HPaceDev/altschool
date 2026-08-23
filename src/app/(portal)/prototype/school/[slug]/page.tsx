import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FORMAT_LABEL,
  ageRange,
  findSchool,
  formatPrice,
  reviewsFor,
  similarTo,
} from "@/lib/prototype-data";
import { Chip, Photo, Rating, SchoolCard } from "@/components/prototype/parts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: findSchool(slug)?.name ?? "Школа" };
}

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = findSchool(slug);
  if (!school) notFound();

  const reviews = reviewsFor(slug);
  const similar = similarTo(school);

  return (
    <>
      <Link
        href="/prototype/catalog"
        className="text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
      >
        ← В каталог
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {/* Галерея */}
          <div className="grid grid-cols-4 gap-2">
            <Photo school={school} className="col-span-4 h-52 rounded-xl sm:h-64" />
            {[0, 1, 2, 3].map((i) => (
              <Photo
                key={i}
                school={school}
                initials={false}
                className="h-16 rounded-lg opacity-70"
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-faint">
            Фотографии появятся, когда школы заполнят профили — сейчас это заглушки.
          </p>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{school.name}</h1>
              <p className="mt-1 text-sm text-ink-muted">
                {school.kind} · {school.city}
                {school.district !== "Вся Россия" ? `, ${school.district}` : ""}
                {school.metro ? ` · м. ${school.metro}` : ""}
              </p>
            </div>
            <Rating value={school.rating} count={school.reviewsCount} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip>{ageRange(school)}</Chip>
            <Chip>{FORMAT_LABEL[school.format]}</Chip>
            <Chip>класс до {school.classSize}</Chip>
            {school.hasLicence ? <Chip>лицензия и аккредитация</Chip> : <Chip>без лицензии</Chip>}
            {school.hasKindergarten ? <Chip>есть детский сад</Chip> : null}
          </div>

          <section className="mt-6">
            <h2 className="text-base font-semibold text-ink">О школе</h2>
            <p className="prose-portal mt-2 text-sm text-ink-muted">{school.about}</p>
          </section>

          <section className="mt-6">
            <h2 className="text-base font-semibold text-ink">Сильные стороны</h2>
            <ul className="mt-2 space-y-1.5">
              {school.strengths.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-muted">
                  <span aria-hidden className="text-done">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-base font-semibold text-ink">Условия</h2>
            <dl className="mt-2 divide-y divide-line rounded-xl border border-line">
              <Row label="Стоимость обучения">{formatPrice(school.pricePerMonth)} в месяц</Row>
              {school.admissionFee ? (
                <Row label="Вступительный взнос">{formatPrice(school.admissionFee)} единоразово</Row>
              ) : null}
              <Row label="Расписание">{school.schedule}</Row>
              <Row label="Языки">{school.languages.join(", ")}</Row>
              <Row label="Что входит">{school.features.join(", ")}</Row>
              <Row label="Набор">
                {school.admissionOpen
                  ? school.seatsLeft
                    ? `открыт, свободно мест: ${school.seatsLeft}`
                    : "открыт"
                  : "закрыт, есть лист ожидания"}
              </Row>
            </dl>
          </section>

          <section className="mt-6">
            <h2 className="text-base font-semibold text-ink">
              Отзывы родителей
              {reviews.length ? (
                <span className="ml-2 text-sm font-normal text-ink-faint">
                  {reviews.length} из {school.reviewsCount}
                </span>
              ) : null}
            </h2>

            {reviews.length === 0 ? (
              <p className="mt-2 rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-faint">
                Отзывов пока нет. Будьте первым, кто расскажет об опыте.
              </p>
            ) : (
              <ul className="mt-2 space-y-2.5">
                {reviews.map((review) => (
                  <li key={review.author} className="rounded-xl border border-line bg-surface-raised p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-ink">
                        {review.author}
                        <span className="ml-2 font-normal text-ink-faint">{review.role}</span>
                      </p>
                      <Rating value={review.rating} />
                    </div>
                    <p className="mt-1.5 text-sm text-ink-muted">{review.text}</p>
                    <p className="mt-1.5 text-xs text-ink-faint">{review.date}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Боковая панель с заявкой */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-line bg-surface-raised p-5">
            <p className="text-xl font-semibold text-ink">
              {formatPrice(school.pricePerMonth)}
              <span className="text-sm font-normal text-ink-faint"> / мес</span>
            </p>
            {school.admissionFee ? (
              <p className="mt-0.5 text-xs text-ink-faint">
                плюс вступительный взнос {formatPrice(school.admissionFee)}
              </p>
            ) : null}

            {school.admissionOpen ? (
              <Link
                href={`/prototype/request?school=${school.slug}`}
                className="mt-4 block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-accent-text"
              >
                Записаться на встречу
              </Link>
            ) : (
              <Link
                href={`/prototype/request?school=${school.slug}&waitlist=1`}
                className="mt-4 block rounded-lg border border-line-strong px-4 py-2.5 text-center text-sm font-medium text-ink hover:bg-surface-sunken"
              >
                В лист ожидания
              </Link>
            )}

            <Link
              href={`/prototype/compare?schools=${school.slug}`}
              className="mt-2 block rounded-lg border border-line-strong px-4 py-2.5 text-center text-sm text-ink-muted hover:bg-surface-sunken"
            >
              Добавить к сравнению
            </Link>

            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Заявка бесплатна. Школа свяжется с вами напрямую — обычно в течение одного
              рабочего дня.
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">Похожие школы</h2>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}
