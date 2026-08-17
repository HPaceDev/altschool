import { asc } from "drizzle-orm";
import { db } from "@/db";
import { risks } from "@/db/schema";
import { levelLabel, riskStatusLabel, riskStatusTone } from "@/lib/labels";
import { Badge, Card, Code, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Риски" };

export default async function RisksPage() {
  const rows = await db.select().from(risks).orderBy(asc(risks.code));

  return (
    <>
      <PageHeader
        title="Риски и допущения"
        lead="То, что может пойти не так, и что мы с этим делаем. Мы фиксируем риски заранее, а не объясняем задним числом: если риск сработает, обе стороны уже знают план действий."
      />

      {rows.length === 0 ? (
        <EmptyState title="Риски пока не зафиксированы" />
      ) : (
        <ul className="space-y-2.5">
          {rows.map((risk) => (
            <li key={risk.id}>
              <Card className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Code>{risk.code}</Code>
                  <Badge tone={riskStatusTone[risk.status]}>{riskStatusLabel[risk.status]}</Badge>
                  <span className="text-xs text-ink-faint">
                    вероятность {levelLabel[risk.likelihood].toLowerCase()} · влияние{" "}
                    {levelLabel[risk.impact].toLowerCase()}
                  </span>
                  {risk.owner ? (
                    <span className="text-xs text-ink-faint">отвечает: {risk.owner}</span>
                  ) : null}
                </div>

                <h2 className="mt-2 font-medium text-ink">{risk.title}</h2>
                <p className="prose-portal mt-1 text-sm text-ink-muted">{risk.description}</p>

                {risk.mitigation ? (
                  <p className="prose-portal mt-2.5 border-t border-line pt-2.5 text-sm text-ink">
                    <span className="font-medium">Что делаем: </span>
                    {risk.mitigation}
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
