"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
  /** Число открытых блокеров и т.п. — показывается рядом с вкладкой. */
  badge?: number;
  badgeTone?: "blocker" | "important";
};

export function Tabs({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Разделы проекта" className="table-scroll -mb-px">
      <ul className="flex min-w-max gap-0.5 px-4 sm:px-6">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent text-accent-text"
                    : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {item.label}
                {item.badge ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                      item.badgeTone === "blocker"
                        ? "bg-blocker-soft text-blocker"
                        : "bg-important-soft text-important"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
