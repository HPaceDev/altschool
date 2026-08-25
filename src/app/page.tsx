import { GROUP_NOTE, GROUP_TITLE, ROLES, type RoleGroup } from "@/lib/roles";

export const metadata = { title: "Выбор роли" };

/**
 * Стартовый экран. Вместо входа по паролю — выбор роли: прототип показывают
 * заказчику, и лишний барьер здесь только мешает.
 */
export default function RolePicker() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.14em] text-ink-faint uppercase">
          Прототип · версия 0.2
        </p>
        <h1 className="display mt-3 text-3xl leading-tight text-ink sm:text-4xl">
          АльтШкола
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Агрегатор частных, семейных и онлайн-школ. Здесь собран кликабельный
          макет будущего сервиса и вопросы, на которые нужно ответить, прежде чем
          отдавать его в разработку.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-faint">
          Выберите, чьими глазами хотите посмотреть. Пароль не нужен — это макет,
          а не работающий сервис.
        </p>
      </header>

      {(["product", "project"] as RoleGroup[]).map((group) => (
        <section key={group} className="mt-12">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-3">
            <h2 className="display text-lg text-ink">{GROUP_TITLE[group]}</h2>
            <p className="text-sm text-ink-faint">{GROUP_NOTE[group]}</p>
          </div>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {ROLES.filter((role) => role.group === group).map((role) => (
              <li key={role.id}>
                {/* Обычная ссылка, а не <Link>: этот адрес ставит cookie роли,
                    а Next.js подгружает <Link> заранее — тогда роль выбиралась
                    бы сама, стоило прокрутить страницу до карточки. */}
                <a
                  href={`/enter/${role.id}`}
                  className="group flex h-full flex-col rounded-xl border border-line bg-surface-raised p-5 transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-[0_2px_12px_rgba(27,32,29,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="display text-lg text-ink">{role.title}</h3>
                      <p className="mt-0.5 text-sm text-ink-faint">{role.who}</p>
                    </div>
                    {!role.ready ? (
                      <span className="shrink-0 rounded-md border border-line bg-surface-sunken px-2 py-0.5 text-xs text-ink-faint">
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
                        className="rounded-full border border-line bg-surface-sunken px-2.5 py-1 text-xs text-ink-muted"
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

      <footer className="mt-14 border-t border-line pt-5">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-faint">
          Школы, цены и отзывы в макете вымышлены. Роль можно поменять в любой
          момент — в боковой панели внутри рабочей области.
        </p>
      </footer>
    </main>
  );
}
