import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { decisionStatusLabel, decisionStatusTone, formatDateTime } from "@/lib/labels";
import { Badge, Card, Code, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Решения" };

export default async function DecisionsPage() {
  const rows = await db.select().from(decisions).orderBy(asc(decisions.code));

  return (
    <>
      <PageHeader
        title="Журнал решений"
        lead="Каждое принятое решение записано вместе с контекстом и последствиями. Решения не переписываются: если позже мы передумали, появляется новое решение со ссылкой на прежнее, а прежнее помечается как заменённое."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Решений пока нет"
          hint="Они появятся, как только мы начнём фиксировать ответы на вопросы."
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((d) => (
            <li key={d.id}>
              <Card
                className={`px-5 py-4 ${d.status === "superseded" ? "opacity-70" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Code>{d.code}</Code>
                  <Badge tone={decisionStatusTone[d.status]}>
                    {decisionStatusLabel[d.status]}
                  </Badge>
                  {d.sourceQuestionCode ? (
                    <Link
                      href={`/questions/${d.sourceQuestionCode}`}
                      className="text-xs text-accent-text underline underline-offset-2"
                    >
                      из вопроса {d.sourceQuestionCode}
                    </Link>
                  ) : null}
                </div>

                <h2 className="mt-2 font-semibold text-ink">{d.title}</h2>

                <dl className="mt-3 space-y-2.5 text-sm">
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-ink-faint uppercase">
                      Контекст
                    </dt>
                    <dd className="prose-portal mt-0.5 text-ink-muted">{d.context}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-ink-faint uppercase">
                      Решение
                    </dt>
                    <dd className="prose-portal mt-0.5 text-ink">{d.decision}</dd>
                  </div>
                  {d.consequences ? (
                    <div>
                      <dt className="text-xs font-medium tracking-wide text-ink-faint uppercase">
                        Последствия
                      </dt>
                      <dd className="prose-portal mt-0.5 text-ink-muted">{d.consequences}</dd>
                    </div>
                  ) : null}
                </dl>

                <p className="mt-3 border-t border-line pt-2.5 text-xs text-ink-faint">
                  {formatDateTime(d.createdAt)}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
