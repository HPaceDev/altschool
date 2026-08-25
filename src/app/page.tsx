import { GROUP_NOTE, GROUP_TITLE, ROLES, type RoleGroup } from "@/lib/roles";

export const metadata = { title: "Выбор роли" };

/**
 * Стартовый экран. Вместо входа по паролю — выбор роли: прототип показывают
 * заказчику, и лишний барьер здесь только мешает.
 */
export default function RolePicker() {
  return (
    <main className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-56 -right-32 h-[30rem] w-[30rem] rounded-full border border-accent/15"
        style={{ boxShadow: "0 0 0 64px rgba(36,95,61,.03), 0 0 0 128px rgba(36,95,61,.02)" }}
      />

      <header className="relative max-w-2xl">
        <p className="kicker">Прототип · версия 0.3</p>
        <h1 className="display mt-5 text-4xl text-ink sm:text-5xl">Карта школ РО</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          Проверяемая карта школ развивающего обучения и платформа для сети франшиз.
          Здесь собран кликабельный макет будущего сервиса и вопросы, на которые нужно
          ответить, прежде чем отдавать его в разработку.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-faint">
          Выберите, чьими глазами хотите посмотреть. Пароль не нужен — это макет,
          а не работающий сервис.
        </p>
      </header>

      {(["product", "project"] as RoleGroup[]).map((group) => (
        <section key={group} className="relative mt-14">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-3">
            <h2 className="display text-xl text-ink">{GROUP_TITLE[group]}</h2>
            <p className="text-sm text-ink-faint">{GROUP_NOTE[group]}</p>
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {ROLES.filter((role) => role.group === group).map((role) => (
              <li key={role.id}>
                {/* Обычная ссылка, а не <Link>: этот адрес ставит cookie роли,
                    а Next.js подгружает <Link> заранее — тогда роль выбиралась
                    бы сама, стоило прокрутить страницу до карточки. */}
                <a
                  href={`/enter/${role.id}`}
                  className="liftable group flex h-full flex-col rounded-2xl border border-line bg-surface-raised p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="display text-xl text-ink">{role.title}</h3>
                      <p className="mt-1 text-sm text-ink-faint">{role.who}</p>
                    </div>
                    {!role.ready ? (
                      <span className="shrink-0 rounded-full border border-line bg-surface-sunken px-2.5 py-0.5 text-xs text-ink-faint">
                        в проработке
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                    {role.description}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {role.highlights.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-ink-muted"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text">
                    Открыть
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="relative mt-16 border-t border-line pt-6">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-faint">
          Школы, цены и отзывы в макете вымышлены. Роль можно поменять в любой
          момент — в боковой панели внутри рабочей области.
        </p>
      </footer>
    </main>
  );
}
