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
    <nav className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-sm">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative rounded-full px-3 py-2 font-medium transition-colors ${
              active ? "text-accent-text" : "text-ink-muted hover:text-ink"
            }`}
          >
            {link.label}
            {active ? (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
              />
            ) : null}
          </Link>
        );
      })}
      <Link
        href="/prototype/add-school"
        className="ml-1.5 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent-text"
      >
        Добавить школу
      </Link>
    </nav>
  );
}
