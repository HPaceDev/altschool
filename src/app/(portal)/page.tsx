import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, decisions, prototypeVersions, scopeItems } from "@/db/schema";
import { getCurrentUser, roleLabel } from "@/lib/auth";
import { listQuestions } from "@/lib/queries";
import {
  describeDeadline,
  formatDateTime,
  plural,
  priorityLabel,
  priorityTone,
} from "@/lib/labels";
import { Badge, Card, Code, EmptyState, PageHeader, Section, Stat } from "@/components/ui";

export default async function OverviewPage() {
  const [user, questions, decisionRows, scopeRows, activity, prototypes] = await Promise.all([
    getCurrentUser(),
    listQuestions(),
    db.select().from(decisions),
    db.select().from(scopeItems),
    db.select().from(auditLog).orderBy(desc(auditLog.at)).limit(12),
    db
      .select()
      .from(prototypeVersions)
      .where(eq(prototypeVersions.isCurrent, true))
      .limit(1),
  ]);

  const live = questions.filter((q) => q.status !== "withdrawn");
  const open = live.filter((q) => q.status === "open");
  const blockers = open.filter((q) => q.priority === "blocker");
  const overdue = open.filter((q) => q.answerDueAt && q.answerDueAt < new Date());
  const settled = live.filter(
    (q) => q.status === "accepted" || q.status === "assumption_applied",
  );

  const approved = decisionRows.filter((d) => d.status === "approved").length;
  const inScope = scopeRows.filter((s) => s.inclusion === "in").length;
  const outOfScope = scopeRows.filter((s) => s.inclusion === "out").length;

  const readiness = live.length ? Math.round((settled.length / live.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title={`Здравствуйте, ${user?.name ?? ""}`}
        lead={
          <>
            Это рабочая площадка проекта. Здесь лежит прототип, все наши вопросы к вам и
            все зафиксированные решения. Вы вошли как{" "}
            <strong className="font-medium text-ink">
              {user ? roleLabel(user.role).toLowerCase() : "гость"}
            </strong>
            .
          </>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Ждут вашего ответа"
          value={open.length}
          tone={open.length ? "important" : "done"}
          hint={open.length ? "Откройте вкладку «Вопросы»" : "Открытых вопросов нет"}
        />
        <Stat
          label="Из них блокеры"
          value={blockers.length}
          tone={blockers.length ? "blocker" : "done"}
          hint={blockers.length ? "Без ответа работа стоит" : "Ничего не блокирует"}
        />
        <Stat
          label="Просрочены"
          value={overdue.length}
          tone={overdue.length ? "blocker" : "neutral"}
          hint={overdue.length ? "Скоро вступит допущение" : "Сроки соблюдаются"}
        />
        <Stat
          label="Готовность к ТЗ"
          value={`${readiness}%`}
          tone={readiness > 80 ? "done" : "accent"}
          hint={`${settled.length} из ${live.length} вопросов закрыто`}
        />
      </div>

      {/* Главный блок: что именно нужно от заказчика прямо сейчас. */}
      <Section
        title="Что нужно от вас"
        description="Список отсортирован по важности. Ответ занимает пару минут и сразу разблокирует работу."
      >
        {open.length === 0 ? (
          <EmptyState
            title="Открытых вопросов нет"
            hint="Мы работаем по уже полученным ответам. Как только появятся новые развилки, они возникнут здесь."
          />
        ) : (
          <ul className="space-y-2.5">
            {open
              .sort((a, b) => {
                const order = { blocker: 0, important: 1, later: 2 };
                return order[a.priority] - order[b.priority];
              })
              .slice(0, 6)
              .map((q) => {
                const deadline = describeDeadline(q.answerDueAt);
                return (
                  <li key={q.id}>
                    <Link
                      href={`/questions/${q.code}`}
                      className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-surface-raised px-4 py-3 transition-colors hover:border-line-strong hover:bg-surface"
                    >
                      <Code>{q.code}</Code>
                      <Badge tone={priorityTone[q.priority]}>{priorityLabel[q.priority]}</Badge>
                      <span className="min-w-0 flex-1 font-medium text-ink">{q.title}</span>
                      {deadline ? (
                        <span
                          className={`text-xs font-medium ${
                            deadline.overdue ? "text-blocker" : "text-ink-faint"
                          }`}
                        >
                          {deadline.text}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}

        {open.length > 6 ? (
          <Link
            href="/questions?status=open"
            className="mt-3 inline-block text-sm text-accent-text underline underline-offset-2"
          >
            Показать все {plural(open.length, "вопрос", "вопроса", "вопросов")}
          </Link>
        ) : null}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Состояние проекта">
          <Card className="divide-y divide-line">
            <Row
              label="Текущая версия прототипа"
              value={prototypes[0]?.version ?? "ещё не опубликована"}
              href="/prototype"
            />
            <Row label="Утверждённых решений" value={String(approved)} href="/decisions" />
            <Row
              label="Границы MVP"
              value={`${inScope} входит · ${outOfScope} не входит`}
              href="/scope"
            />
            <Row
              label="Закрытых вопросов"
              value={`${settled.length} из ${live.length}`}
              href="/questions?status=accepted"
            />
          </Card>
        </Section>

        <Section title="Последние события">
          {activity.length === 0 ? (
            <EmptyState title="Пока пусто" />
          ) : (
            <Card className="divide-y divide-line">
              {activity.map((event) => (
                <div key={event.id} className="px-4 py-2.5">
                  <p className="text-sm text-ink">{event.summary}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{formatDateTime(event.at)}</p>
                </div>
              ))}
            </Card>
          )}
          <Link
            href="/journal"
            className="mt-3 inline-block text-sm text-accent-text underline underline-offset-2"
          >
            Весь журнал
          </Link>
        </Section>
      </div>
    </>
  );
}

function Row({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3 hover:bg-surface">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </Link>
  );
}
