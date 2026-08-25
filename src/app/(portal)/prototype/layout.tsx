import Link from "next/link";
import { ProtoNav } from "./nav";

/**
 * Шапка будущего сервиса. Внутри рабочей области прототип занимает весь
 * экран — служебные ссылки убраны в скрытую панель уровнем выше.
 */
export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-surface-raised">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
          <Link href="/prototype" className="flex items-baseline gap-2">
            <span className="display text-lg text-ink">Карта школ РО</span>
            <span className="hidden text-xs text-ink-faint sm:inline">развивающее обучение по России</span>
          </Link>

          <ProtoNav />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">{children}</div>
    </>
  );
}
