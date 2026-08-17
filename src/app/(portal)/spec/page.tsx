import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { requirements } from "@/db/schema";
import {
  moscowLabel,
  moscowTone,
  requirementStatusLabel,
  requirementStatusTone,
  plural,
} from "@/lib/labels";
import { Badge, Card, Code, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "ТЗ" };

export default async function SpecPage() {
  const rows = await db.select().from(requirements).orderBy(asc(requirements.code));

  const byArea = new Map<string, typeof rows>();
  for (const row of rows) {
    byArea.set(row.area, [...(byArea.get(row.area) ?? []), row]);
  }

  const points = rows.reduce((sum, r) => sum + (r.estimatePoints ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Техническое задание"
        lead="Растёт по мере согласований, а не пишется в последний день. У каждого требования указано, из какого вопроса или решения оно выросло — так видно, что мы ничего не придумали за вас."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Требования появятся после первых зафиксированных ответов"
          hint="Мы принципиально не пишем ТЗ раньше: иначе оно описывает наши догадки, а не вашу систему."
        />
      ) : (
        <>
          <p className="mb-6 text-sm text-ink-muted">
            {plural(rows.length, "требование", "требования", "требований")}
            {points > 0 ? ` · предварительная оценка ${points} story points` : ""}
          </p>

          {[...byArea.entries()].map(([area, items]) => (
            <section key={area} className="mb-8">
              <h2 className="mb-3 text-base font-semibold text-ink">{area}</h2>
              <div className="space-y-2.5">
                {items.map((req) => (
                  <Card key={req.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Code>{req.code}</Code>
                      <Badge tone={moscowTone[req.moscow]}>{moscowLabel[req.moscow]}</Badge>
                      <Badge tone={requirementStatusTone[req.status]}>
                        {requirementStatusLabel[req.status]}
                      </Badge>
                      {req.screenRef ? (
                        <span className="text-xs text-ink-faint">экран {req.screenRef}</span>
                      ) : null}
                      {req.estimatePoints ? (
                        <span className="text-xs text-ink-faint">{req.estimatePoints} sp</span>
                      ) : null}
                    </div>

                    <h3 className="mt-2 font-medium text-ink">{req.title}</h3>
                    <p className="prose-portal mt-1 text-sm text-ink-muted">{req.story}</p>

                    {req.acceptance ? (
                      <div className="mt-3 rounded-lg bg-surface-sunken px-3.5 py-3">
                        <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
                          Критерии приёмки
                        </p>
                        <pre className="prose-portal mt-1.5 font-mono text-xs text-ink">
                          {req.acceptance}
                        </pre>
                      </div>
                    ) : null}

                    {/* Трассируемость — то, чем ТЗ отличается от сочинения. */}
                    {req.sourceQuestionCodes?.length || req.sourceDecisionCodes?.length ? (
                      <p className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-2.5 text-xs text-ink-faint">
                        <span>Основание:</span>
                        {req.sourceQuestionCodes?.map((code) => (
                          <Link
                            key={code}
                            href={`/questions/${code}`}
                            className="text-accent-text underline underline-offset-2"
                          >
                            {code}
                          </Link>
                        ))}
                        {req.sourceDecisionCodes?.map((code) => (
                          <span key={code} className="text-ink-muted">
                            {code}
                          </span>
                        ))}
                      </p>
                    ) : null}
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </>
  );
}
