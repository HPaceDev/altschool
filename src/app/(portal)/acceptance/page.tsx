import { asc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { requirements } from "@/db/schema";
import { Card, Code, EmptyState, PageHeader, Section } from "@/components/ui";

export const metadata = { title: "Приёмка" };

export default async function AcceptancePage() {
  const rows = await db
    .select()
    .from(requirements)
    .where(or(eq(requirements.status, "approved"), eq(requirements.status, "implemented")))
    .orderBy(asc(requirements.code));

  const withCriteria = rows.filter((r) => r.acceptance);

  return (
    <>
      <PageHeader
        title="Как будем принимать работу"
        lead="Единый чек-лист приёмки: работа считается сданной, когда выполнены перечисленные ниже критерии — и ничего сверх них. Список формируется только из утверждённых требований, поэтому сюрпризов на приёмке быть не может."
      />

      <Section
        title="Правила приёмки"
        description="Договорённости о самой процедуре, а не о содержании."
      >
        <Card className="px-5 py-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-muted marker:text-ink-faint">
            <li>
              Приёмка идёт по критериям ниже. Замечание принимается, если оно указывает на
              невыполненный критерий.
            </li>
            <li>
              Пожелания вне этого списка — это новые задачи. Мы их с радостью оценим
              отдельно, но они не блокируют приёмку текущего этапа.
            </li>
            <li>
              Замечания присылаются одним списком в течение согласованного срока проверки.
              Каждое замечание фиксируется в портале со ссылкой на критерий.
            </li>
            <li>
              Если в согласованный срок замечаний не поступило, этап считается принятым — так
              же, как вопрос без ответа переходит на допущение по умолчанию.
            </li>
          </ol>
        </Card>
      </Section>

      <Section title="Критерии приёмки">
        {withCriteria.length === 0 ? (
          <EmptyState
            title="Критериев пока нет"
            hint="Они появятся автоматически, когда требования во вкладке «ТЗ» перейдут в статус «Утверждено»."
          />
        ) : (
          <ul className="space-y-2.5">
            {withCriteria.map((req) => (
              <li key={req.id}>
                <Card className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Code>{req.code}</Code>
                    <span className="text-xs text-ink-faint">{req.area}</span>
                  </div>
                  <h2 className="mt-1.5 font-medium text-ink">{req.title}</h2>
                  <pre className="prose-portal mt-2 rounded-lg bg-surface-sunken px-3.5 py-3 font-mono text-xs text-ink">
                    {req.acceptance}
                  </pre>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
