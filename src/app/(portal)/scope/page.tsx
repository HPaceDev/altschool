import { asc } from "drizzle-orm";
import { db } from "@/db";
import { scopeItems } from "@/db/schema";
import { moscowLabel, moscowTone, plural } from "@/lib/labels";
import { Badge, Card, Code, EmptyState, PageHeader, Section } from "@/components/ui";

export const metadata = { title: "Скоуп" };

export default async function ScopePage() {
  const rows = await db.select().from(scopeItems).orderBy(asc(scopeItems.code));

  const included = rows.filter((r) => r.inclusion === "in");
  const excluded = rows.filter((r) => r.inclusion === "out");
  const totalDays = included.reduce((sum, r) => sum + (r.estimateDays ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Границы работ"
        lead="Слева то, что мы делаем в этом этапе. Справа — то, что мы сознательно не делаем. Второй список важнее первого: именно он снимает разночтения на приёмке. Если чего-то нет ни там, ни там — задайте вопрос, и мы внесём."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Границы ещё не описаны"
          hint="Появятся после первого круга вопросов: сначала нужно понять, из чего вообще состоит система."
        />
      ) : (
        <>
          <Section
            title="Входит в этап"
            description={
              totalDays > 0
                ? `${plural(included.length, "пункт", "пункта", "пунктов")} · предварительная оценка ${plural(totalDays, "день", "дня", "дней")}`
                : plural(included.length, "пункт", "пункта", "пунктов")
            }
          >
            <div className="space-y-2.5">
              {included.map((item) => (
                <Card key={item.id} className="px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Code>{item.code}</Code>
                    <Badge tone={moscowTone[item.moscow]}>{moscowLabel[item.moscow]}</Badge>
                    <span className="text-xs text-ink-faint">{item.phase}</span>
                    {item.estimateDays ? (
                      <span className="text-xs text-ink-faint">
                        ~{plural(item.estimateDays, "день", "дня", "дней")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 font-medium text-ink">{item.title}</p>
                  {item.description ? (
                    <p className="prose-portal mt-1 text-sm text-ink-muted">{item.description}</p>
                  ) : null}
                </Card>
              ))}
            </div>
          </Section>

          <Section
            title="Не входит в этап"
            description="Это не отказ навсегда — это перенос на следующие этапы. Любой пункт можно вернуть в работу, но это изменит срок и стоимость."
          >
            {excluded.length === 0 ? (
              <EmptyState
                title="Исключения не описаны"
                hint="Пока список пуст, любая доработка выглядит «само собой разумеющейся». Стоит заполнить."
              />
            ) : (
              <div className="space-y-2.5">
                {excluded.map((item) => (
                  <Card key={item.id} className="border-dashed px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Code>{item.code}</Code>
                      <Badge tone="later">Не делаем сейчас</Badge>
                      <span className="text-xs text-ink-faint">{item.phase}</span>
                    </div>
                    <p className="mt-1.5 font-medium text-ink-muted">{item.title}</p>
                    {item.description ? (
                      <p className="prose-portal mt-1 text-sm text-ink-faint">
                        {item.description}
                      </p>
                    ) : null}
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </>
  );
}
