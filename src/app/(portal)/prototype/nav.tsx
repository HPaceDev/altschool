"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/prototype/catalog", label: "Каталог" },
  { href: "/prototype/compare", label: "Сравнение" },
  { href: "/prototype/cabinet", label: "Мои заявки" },
];

export function ProtoNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-2.5 py-1.5 transition-colors ${
              active ? "bg-accent-soft text-accent-text" : "text-ink-muted hover:bg-surface-sunken"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
