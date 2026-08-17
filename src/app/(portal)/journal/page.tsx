import { desc } from "drizzle-orm";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { formatDateTime, plural } from "@/lib/labels";
import { Card, Code, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Журнал" };

/** Журнал всегда показывает актуальное состояние, кеш здесь только мешает. */
export const dynamic = "force-dynamic";

const actionLabels: Record<string, string> = {
  "auth.login": "вход",
  "auth.logout": "выход",
  "auth.link_requested": "запрос ссылки",
  "question.created": "вопрос заведён",
  "question.answered": "ответ",
  "question.answer_revised": "ответ уточнён",
  "question.commented": "комментарий",
  "question.accepted": "ответ зафиксирован",
  "question.approved": "утверждение",
  "question.assumption_applied": "применено допущение",
  "question.withdrawn": "вопрос снят",
};

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [rows, { q }] = await Promise.all([
    db.select().from(auditLog).orderBy(desc(auditLog.at)).limit(500),
    searchParams,
  ]);

  const needle = q?.trim().toLowerCase();
  const visible = needle
    ? rows.filter((row) =>
        [row.summary, row.actorName, row.actorEmail, row.entityCode]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(needle)),
      )
    : rows;

  return (
    <>
      <PageHeader
        title="Журнал событий"
        lead="Полная хронология проекта: кто, что и когда сделал. Записи journal нельзя изменить или удалить — это запрещено на уровне базы данных, а не только в интерфейсе. Страницу можно сохранить в PDF через печать браузера."
      />

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Поиск по событиям, людям и номерам вопросов"
          className="w-full max-w-md rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
      </form>

      <p className="mb-3 text-sm text-ink-muted">
        {plural(visible.length, "запись", "записи", "записей")}
        {rows.length === 500 ? " (показаны последние 500)" : ""}
      </p>

      {visible.length === 0 ? (
        <EmptyState title="Ничего не найдено" />
      ) : (
        <Card className="divide-y divide-line">
          {visible.map((row) => (
            <article key={row.id} className="px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-xs tabular-nums text-ink-faint">
                  {formatDateTime(row.at)}
                </span>
                <Code>{actionLabels[row.action] ?? row.action}</Code>
                {row.entityCode ? (
                  <span className="text-xs font-medium text-accent-text">{row.entityCode}</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-ink">{row.summary}</p>
              {row.actorEmail ? (
                <p className="mt-0.5 text-xs text-ink-faint">
                  {row.actorEmail}
                  {row.ip ? ` · IP ${row.ip}` : ""}
                </p>
              ) : null}
            </article>
          ))}
        </Card>
      )}
    </>
  );
}
