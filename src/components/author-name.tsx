"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "portal_author_name";

/**
 * Имя автора ответа. Учётных записей в прототипе нет, поэтому человек
 * представляется один раз, а браузер это запоминает — дальше поле
 * подставляется само.
 *
 * Поле необязательное: если его оставить пустым, в истории останется
 * название роли. Это хуже, чем имя, но лучше, чем анонимная запись.
 */
export function AuthorNameField({ placeholder = "Например, Иван Петров" }: { placeholder?: string }) {
  const field = useRef<HTMLInputElement>(null);

  // Значение подставляется напрямую в поле: состояние React здесь не нужно,
  // а на сервере localStorage всё равно недоступен.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && field.current) field.current.value = saved;
    } catch {
      // Приватный режим или запрет хранилища — оставим поле пустым.
    }
  }, []);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        Ваше имя <span className="font-normal text-ink-faint">— останется в истории</span>
      </span>
      <input
        type="text"
        name="authorName"
        ref={field}
        defaultValue=""
        placeholder={placeholder}
        onChange={(event) => {
          try {
            window.localStorage.setItem(STORAGE_KEY, event.target.value);
          } catch {
            // Не сохранилось — не страшно, введут ещё раз.
          }
        }}
        className="w-full max-w-xs rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
      />
    </label>
  );
}
