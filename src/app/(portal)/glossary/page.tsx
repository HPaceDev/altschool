import { asc } from "drizzle-orm";
import { db } from "@/db";
import { glossary } from "@/db/schema";
import { formatDate } from "@/lib/labels";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Глоссарий" };

export default async function GlossaryPage() {
  const rows = await db.select().from(glossary).orderBy(asc(glossary.term));

  return (
    <>
      <PageHeader
        title="Глоссарий"
        lead="Общий словарь проекта. Половина споров на приёмке возникает из-за того, что «заявка» у заказчика и у разработчика значит разное. Если встретили в прототипе термин, который понимаете иначе — заведите вопрос, поправим здесь."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Словарь пока пуст"
          hint="Он наполняется по ходу: как только термин встречается второй раз, мы его фиксируем."
        />
      ) : (
        <Card className="divide-y divide-line">
          {rows.map((entry) => (
            <div key={entry.id} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-ink">{entry.term}</h2>
                <span className="text-xs text-ink-faint">
                  уточнён {formatDate(entry.updatedAt)}
                </span>
              </div>
              <p className="prose-portal mt-1 text-sm text-ink-muted">{entry.definition}</p>
              {entry.synonyms ? (
                <p className="mt-1.5 text-xs text-ink-faint">Также говорят: {entry.synonyms}</p>
              ) : null}
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
