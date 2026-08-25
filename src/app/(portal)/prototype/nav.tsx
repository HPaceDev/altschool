"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/prototype/catalog", label: "Школы" },
  { href: "/prototype/map", label: "Карта" },
  { href: "/prototype/franchises", label: "Франшизы" },
  { href: "/prototype/favorites", label: "Избранное" },
];

export function ProtoNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
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
      <Link
        href="/prototype/add-school"
        className="ml-1 rounded-lg border border-line-strong px-2.5 py-1.5 text-ink transition-colors hover:bg-surface-sunken"
      >
        Добавить школу
      </Link>
    </nav>
  );
}
