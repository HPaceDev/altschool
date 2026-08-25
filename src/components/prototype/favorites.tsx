"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "ro_favorites";

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    // Приватный режим или испорченное значение — считаем, что избранного нет.
    return [];
  }
}

function write(slugs: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // Не сохранилось — кнопка всё равно отработает в пределах страницы.
  }
}

/**
 * Избранное живёт в браузере.
 *
 * Учётных записей в прототипе нет, а привязывать список к серверу ради макета
 * незачем: нам нужно договориться о поведении кнопки, а не хранить данные.
 * Вопрос о том, где избранное живёт в настоящем сервисе, — Q-008.
 */
const listeners = new Set<() => void>();
let snapshot: string[] = [];
let loaded = false;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Список читается из localStorage лениво, при первом обращении, и дальше
 * живёт в модуле. Так все кнопки на странице видят одно и то же состояние,
 * а на сервере, где localStorage нет, отдаётся пустой список.
 */
function getSnapshot(): string[] {
  if (!loaded) {
    snapshot = read();
    loaded = true;
  }
  return snapshot;
}

const EMPTY: string[] = [];
const getServerSnapshot = () => EMPTY;

export function useFavorites(): [string[], (slug: string) => void, boolean] {
  const slugs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((slug: string) => {
    const current = getSnapshot();
    snapshot = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    write(snapshot);
    for (const listener of listeners) listener();
  }, []);

  return [slugs, toggle, true];
}

export function FavoriteButton({ slug }: { slug: string }) {
  const [slugs, toggle, ready] = useFavorites();
  const saved = slugs.includes(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      className={`flex min-h-11 w-full items-center justify-center rounded-full border px-4 text-sm transition-colors ${
        saved
          ? "border-accent bg-accent-soft font-medium text-accent-text"
          : "border-line-strong text-ink-muted hover:border-accent hover:text-accent-text"
      }`}
    >
      {ready && saved ? "В избранном" : "В избранное"}
    </button>
  );
}
