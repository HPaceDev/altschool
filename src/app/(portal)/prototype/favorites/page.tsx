"use client";

import Link from "next/link";
import { SCHOOLS } from "@/lib/prototype-data";
import { SchoolCard } from "@/components/prototype/parts";
import { useFavorites } from "@/components/prototype/favorites";

export default function FavoritesPage() {
  const [slugs, , ready] = useFavorites();
  const saved = SCHOOLS.filter((s) => slugs.includes(s.slug));

  return (
    <>
      <h1 className="display text-3xl text-ink">Избранное</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        Список хранится в этом браузере. Куда он переедет в настоящем сервисе — вопрос
        о регистрации родителя, он пока открыт.
      </p>

      {!ready ? (
        <p className="mt-6 text-sm text-ink-faint">Загружаем…</p>
      ) : saved.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-surface-raised px-6 py-14 text-center">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-12 w-12 rounded-full border border-line-strong"
          />
          <p className="display text-lg text-ink">Пока пусто</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            В карточке школы есть кнопка «В избранное». Складывайте туда варианты,
            которые хотите обсудить в семье.
          </p>
          <Link
            href="/prototype/catalog"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {saved.map((school) => (
              <SchoolCard key={school.slug} school={school} />
            ))}
          </div>
          <Link
            href={`/prototype/compare?schools=${saved.slice(0, 4).map((s) => s.slug).join(",")}`}
            className="mt-6 inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 text-sm text-ink transition-colors hover:border-accent hover:text-accent-text"
          >
            Сравнить избранное
          </Link>
        </>
      )}
    </>
  );
}
