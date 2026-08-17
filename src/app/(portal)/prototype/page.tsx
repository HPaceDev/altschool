import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { prototypeVersions, screens } from "@/db/schema";
import { formatDate } from "@/lib/labels";
import { Badge, Card, Code, EmptyState, PageHeader, Section } from "@/components/ui";

export const metadata = { title: "Прототип" };

export default async function PrototypePage() {
  const [versions, screenRows] = await Promise.all([
    db.select().from(prototypeVersions).orderBy(desc(prototypeVersions.publishedAt)),
    db.select().from(screens).orderBy(asc(screens.sortOrder), asc(screens.code)),
  ]);

  const current = versions.find((v) => v.isCurrent) ?? versions[0];

  return (
    <>
      <PageHeader
        title="Кликабельный прототип"
        lead="Прототип показывает будущую систему до того, как написана хоть одна строка кода. Кликайте по нему как по настоящему приложению: любое «а вот тут неудобно» сейчас стоит нам десять минут, а после разработки — несколько дней."
      />

      {!current ? (
        <EmptyState
          title="Прототип ещё не опубликован"
          hint="Он появится здесь после того, как мы согласуем карту экранов. Пока что все вопросы по будущим экранам — во вкладке «Вопросы»."
        />
      ) : (
        <>
          <Card className="mb-6 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-ink">Версия {current.version}</h2>
                  <Badge tone="accent">текущая</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  опубликована {formatDate(current.publishedAt)}
                </p>
              </div>
              {current.url ? (
                <a
                  href={current.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-text"
                >
                  Открыть прототип
                </a>
              ) : null}
            </div>
            {current.notes ? (
              <p className="prose-portal mt-3 border-t border-line pt-3 text-sm text-ink-muted">
                {current.notes}
              </p>
            ) : null}
          </Card>

          {versions.length > 1 ? (
            <Section
              title="Предыдущие версии"
              description="Видно, что менялось между показами — чтобы не спорить о том, «так было или не так»."
            >
              <Card className="divide-y divide-line">
                {versions
                  .filter((v) => v.id !== current.id)
                  .map((version) => (
                    <div key={version.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-ink">
                          Версия {version.version}
                        </span>
                        <span className="text-xs text-ink-faint">
                          {formatDate(version.publishedAt)}
                        </span>
                      </div>
                      {version.notes ? (
                        <p className="mt-1 text-sm text-ink-muted">{version.notes}</p>
                      ) : null}
                    </div>
                  ))}
              </Card>
            </Section>
          ) : null}
        </>
      )}

      <Section
        title="Карта экранов"
        description="Каждый экран описан вместе с состояниями: пусто, загрузка, ошибка, нет прав. Именно в этих состояниях обычно и прячутся неотвеченные вопросы."
      >
        {screenRows.length === 0 ? (
          <EmptyState
            title="Карта экранов ещё не составлена"
            hint="Это первый шаг после того, как мы поймём роли и основные сценарии."
          />
        ) : (
          <div className="space-y-2.5">
            {screenRows.map((screen) => (
              <Card key={screen.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Code>{screen.code}</Code>
                  {screen.role ? (
                    <span className="text-xs text-ink-faint">{screen.role}</span>
                  ) : null}
                  {screen.route ? (
                    <span className="font-mono text-xs text-ink-faint">{screen.route}</span>
                  ) : null}
                </div>
                <p className="mt-1.5 font-medium text-ink">{screen.title}</p>
                {screen.description ? (
                  <p className="mt-1 text-sm text-ink-muted">{screen.description}</p>
                ) : null}
                {screen.states?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {screen.states.map((state) => (
                      <Badge key={state} tone="later">
                        {state}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <Link
                  href={`/questions?area=${encodeURIComponent(screen.title)}`}
                  className="mt-2 inline-block text-xs text-accent-text underline underline-offset-2"
                >
                  Вопросы по экрану
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
