"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { priorityLabel, questionStatusLabel } from "@/lib/labels";

/**
 * Фильтры живут в адресной строке, чтобы отфильтрованный список можно было
 * прислать заказчику ссылкой: «вот эти три блокера ждут вас».
 */
export function QuestionFilters({ areas }: { areas: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  const selectClass =
    "min-h-10 rounded-full border border-line-strong bg-surface px-3.5 text-sm text-ink focus:border-accent focus:outline-none";

  const hasFilters = ["status", "priority", "area"].some((key) => params.get(key));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <select
        aria-label="Статус"
        className={selectClass}
        value={params.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
      >
        <option value="">Все, кроме снятых</option>
        {Object.entries(questionStatusLabel).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        aria-label="Важность"
        className={selectClass}
        value={params.get("priority") ?? ""}
        onChange={(e) => update("priority", e.target.value)}
      >
        <option value="">Любая важность</option>
        {Object.entries(priorityLabel).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {areas.length > 1 ? (
        <select
          aria-label="Раздел"
          className={selectClass}
          value={params.get("area") ?? ""}
          onChange={(e) => update("area", e.target.value)}
        >
          <option value="">Все разделы</option>
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      ) : null}

      {hasFilters ? (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          Сбросить
        </button>
      ) : null}
    </div>
  );
}
