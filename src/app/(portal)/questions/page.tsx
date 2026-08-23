import Link from "next/link";
import { canEditProject, getCurrentRole } from "@/lib/roles";
import { listQuestions } from "@/lib/queries";
import {
  describeDeadline,
  formatDateTime,
  priorityLabel,
  priorityTone,
  questionStatusLabel,
  questionStatusTone,
  plural,
} from "@/lib/labels";
import { Badge, Card, Code, EmptyState, PageHeader, buttonStyles } from "@/components/ui";
import { QuestionFilters } from "./filters";

export const metadata = { title: "Вопросы" };

const ORDER = { blocker: 0, important: 1, later: 2 } as const;

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; area?: string }>;
}) {
  const [role, all, filters] = await Promise.all([
    getCurrentRole(),
    listQuestions(),
    searchParams,
  ]);

  const areas = [...new Set(all.map((q) => q.area))].sort((a, b) => a.localeCompare(b, "ru"));

  const visible = all
    .filter((q) => (filters.status ? q.status === filters.status : q.status !== "withdrawn"))
    .filter((q) => (filters.priority ? q.priority === filters.priority : true))
    .filter((q) => (filters.area ? q.area === filters.area : true))
    .sort((a, b) => {
      const open = Number(b.status === "open") - Number(a.status === "open");
      if (open !== 0) return open;
      const priority = ORDER[a.priority] - ORDER[b.priority];
      if (priority !== 0) return priority;
      return a.code.localeCompare(b.code);
    });

  const waiting = all.filter((q) => q.status === "open").length;
  const blockers = all.filter((q) => q.status === "open" && q.priority === "blocker").length;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Вопросы и ответы"
        lead={
          <>
            Здесь мы задаём всё, что нужно решить до разработки. Отвечайте прямо на странице
            вопроса: ответ сохранится с вашим именем и временем. Если позже вы измените
            мнение — просто напишите новый ответ, прежний останется в истории.
          </>
        }
        actions={
          canEditProject(role) ? (
            <Link href="/questions/new" className={buttonStyles.primary}>
              Новый вопрос
            </Link>
          ) : undefined
        }
      />

      {waiting > 0 ? (
        <Card className="mb-6 border-important/30 bg-important-soft px-4 py-3">
          <p className="text-sm text-important">
            <strong className="font-semibold">
              Ждём ответа по {plural(waiting, "вопросу", "вопросам", "вопросам")}
            </strong>
            {blockers > 0
              ? `, из них ${plural(blockers, "блокер", "блокера", "блокеров")} — без ответа по ним работа стоит.`
              : "."}
          </p>
        </Card>
      ) : null}

      <QuestionFilters areas={areas} />

      {visible.length === 0 ? (
        <EmptyState
          title="Под фильтр ничего не попало"
          hint="Снимите фильтры или загляните позже — новые вопросы появляются по мере проработки экранов."
        />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((q) => {
            const deadline = q.status === "open" ? describeDeadline(q.answerDueAt) : null;

            return (
              <li key={q.id}>
                <Link
                  href={`/questions/${q.code}`}
                  className="block rounded-xl border border-line bg-surface-raised px-4 py-3.5 transition-colors hover:border-line-strong hover:bg-surface"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Code>{q.code}</Code>
                    <Badge tone={priorityTone[q.priority]}>{priorityLabel[q.priority]}</Badge>
                    <Badge tone={questionStatusTone[q.status]}>
                      {questionStatusLabel[q.status]}
                    </Badge>
                    <span className="text-xs text-ink-faint">{q.area}</span>
                    {q.screenRef ? (
                      <span className="text-xs text-ink-faint">экран {q.screenRef}</span>
                    ) : null}
                    {deadline ? (
                      <span
                        className={`text-xs font-medium ${
                          deadline.overdue ? "text-blocker" : "text-ink-faint"
                        }`}
                      >
                        {deadline.text}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 font-medium text-ink">{q.title}</p>

                  {q.latestAnswer ? (
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">
                      <span className="text-ink-faint">
                        {q.latestAnswer.authorName}, {formatDateTime(q.latestAnswer.createdAt)}:{" "}
                      </span>
                      {q.latestAnswer.body}
                    </p>
                  ) : (
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{q.body}</p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-faint">
                    {q.answers.length > 1 ? (
                      <span>{plural(q.answers.length, "версия", "версии", "версий")} ответа</span>
                    ) : null}
                    {q.commentCount > 0 ? (
                      <span>
                        {plural(q.commentCount, "комментарий", "комментария", "комментариев")}
                      </span>
                    ) : null}
                    {q.approvalCount > 0 ? <span className="text-done">утверждено</span> : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
