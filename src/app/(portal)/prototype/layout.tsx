import Link from "next/link";
import { ProtoNav } from "./nav";

const FOOTER = [
  {
    title: "Выбор школы",
    links: [
      { href: "/prototype/catalog", label: "Каталог" },
      { href: "/prototype/map", label: "Карта России" },
      { href: "/prototype/compare", label: "Сравнение" },
      { href: "/prototype/favorites", label: "Избранное" },
    ],
  },
  {
    title: "Для партнёров",
    links: [
      { href: "/prototype/franchises", label: "Франшизы" },
      { href: "/prototype/add-school", label: "Добавить школу" },
      { href: "/network", label: "Платформа для сети" },
      { href: "/school", label: "Кабинет школы" },
    ],
  },
  {
    title: "О проекте",
    links: [
      { href: "/prototype", label: "Как проверяем данные" },
      { href: "/questions", label: "Вопросы к заказчику" },
      { href: "/admin", label: "Редакция платформы" },
    ],
  },
];

/**
 * Шапка и подвал будущего сервиса.
 *
 * Внутри рабочей области прототип занимает весь экран: служебные ссылки
 * убраны в скрытую панель уровнем выше, а здесь остаётся только то, что
 * увидит родитель на настоящем сайте.
 */
export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-2.5rem)] flex-col">
      <header className="sticky top-10 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-[68px] max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
          <Link href="/prototype" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="leading-tight">
              <span className="display block text-[17px] text-ink">Карта школ РО</span>
              <span className="hidden text-xs text-ink-faint sm:block">
                развивающее обучение по России
              </span>
            </span>
          </Link>

          <ProtoNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        {children}
      </main>

      <footer className="mt-16 border-t border-line bg-surface-sunken/60">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <BrandMark />
                <span className="display text-[17px] text-ink">Карта школ РО</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
                Проверяемая география развивающего обучения: у каждого факта есть
                источник и дата проверки.
              </p>
            </div>

            {FOOTER.map((column) => (
              <div key={column.title}>
                <h2 className="text-xs font-semibold tracking-[0.12em] text-ink uppercase">
                  {column.title}
                </h2>
                <ul className="mt-3.5 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted transition-colors hover:text-accent-text"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 border-t border-line pt-6 text-xs text-ink-faint">
            Прототип. Школы, цены, заявки и цифры вымышлены и нужны только для того,
            чтобы обсудить структуру экранов.
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Знак сервиса: карта и точка на ней. Рисуется разметкой, файла нет. */
function BrandMark() {
  return (
    <span
      aria-hidden
      className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent/45"
    >
      <span className="h-2 w-2 rounded-full bg-accent" />
      <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-warm" />
    </span>
  );
}
