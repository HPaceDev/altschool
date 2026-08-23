"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type ShellLink = {
  href: string;
  label: string;
  hint: string;
  badge?: number;
  ready: boolean;
};

/**
 * Оболочка рабочей области.
 *
 * Навигация убрана в скрытую панель: прототип должен занимать весь экран, а
 * служебные ссылки нужны редко. Сверху остаётся узкая полоса — она же
 * напоминает, что это макет, и от какой роли смотрит человек.
 */
export function WorkspaceShell({
  roleTitle,
  links,
  children,
}: {
  roleTitle: string;
  links: ShellLink[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Панель закрывается по самому клику, а не по смене адреса: так она уходит
  // сразу, не дожидаясь загрузки следующей страницы.
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 flex h-10 items-center gap-3 border-b border-line bg-surface-raised px-3 sm:px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="workspace-drawer"
          className="-ml-1 flex items-center gap-2 rounded-md px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
          </span>
          Меню
        </button>

        <span className="h-4 w-px bg-line" aria-hidden />

        <p className="truncate text-sm text-ink-faint">
          <span className="text-ink-muted">{roleTitle}</span>
          <span className="hidden sm:inline"> · прототип, версия 0.2</span>
        </p>

        <Link
          href="/"
          className="ml-auto rounded-md px-2 py-1 text-sm text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          Сменить роль
        </Link>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Закрыть меню"
          onClick={close}
          className="fixed inset-0 z-40 bg-ink/25"
        />
      ) : null}

      <aside
        id="workspace-drawer"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-line bg-surface-raised transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-10 items-center justify-between border-b border-line px-4">
          <span className="text-sm font-medium text-ink">Рабочие области</span>
          <button
            type="button"
            onClick={close}
            className="rounded-md px-2 py-0.5 text-sm text-ink-faint hover:bg-surface-sunken hover:text-ink"
          >
            Закрыть
          </button>
        </div>

        <nav className="p-3">
          <ul className="space-y-0.5">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    tabIndex={open ? undefined : -1}
                    onClick={close}
                    className={`block rounded-lg px-3 py-2.5 transition-colors ${
                      active ? "bg-accent-soft" : "hover:bg-surface-sunken"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium ${
                          active ? "text-accent-text" : "text-ink"
                        }`}
                      >
                        {link.label}
                      </span>
                      {link.badge ? (
                        <span className="nums rounded-full bg-blocker-soft px-1.5 py-0.5 text-xs font-semibold text-blocker">
                          {link.badge}
                        </span>
                      ) : !link.ready ? (
                        <span className="text-xs text-ink-faint">в проработке</span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-faint">{link.hint}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 border-t border-line px-3 pt-3 text-xs leading-relaxed text-ink-faint">
            Школы, цены и отзывы в макете вымышлены. Ответы на вопросы
            сохраняются с именем и временем.
          </p>
        </nav>
      </aside>

      <main>{children}</main>
    </div>
  );
}
