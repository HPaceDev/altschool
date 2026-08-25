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
      <h1 className="display text-xl text-ink">Избранное</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Список хранится в этом браузере. Куда он переедет в настоящем сервисе — вопрос
        о регистрации родителя, он пока открыт.
      </p>

      {!ready ? (
        <p className="mt-6 text-sm text-ink-faint">Загружаем…</p>
      ) : saved.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-medium text-ink">Пока пусто</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-faint">
            В карточке школы есть кнопка «В избранное». Складывайте туда варианты,
            которые хотите обсудить в семье.
          </p>
          <Link
            href="/prototype/catalog"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {saved.map((school) => (
              <SchoolCard key={school.slug} school={school} />
            ))}
          </div>
          <Link
            href={`/prototype/compare?schools=${saved.slice(0, 4).map((s) => s.slug).join(",")}`}
            className="mt-4 inline-block rounded-lg border border-line-strong px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-sunken"
          >
            Сравнить избранное
          </Link>
        </>
      )}
    </>
  );
}
