import Link from "next/link";
import { ProtoNav } from "./nav";

/**
 * Прототип живёт внутри портала, но выглядит как будущий продукт: у него
 * своя шапка и навигация. Полоса сверху нужна, чтобы это не приняли за
 * готовый сайт — там же ссылка на вопросы, если что-то непонятно.
 */
export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 -my-8 sm:-mx-6">
      <div className="border-b border-important/25 bg-important-soft px-4 py-2.5 sm:px-6">
        <p className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-1 text-xs text-important">
          <strong className="font-semibold">Прототип, версия 0.1.</strong>
          Школы, цены и отзывы вымышлены. Кнопки работают по сценарию, оплаты и
          писем нет.
          <Link href="/questions" className="underline underline-offset-2">
            Есть замечание — оставьте его в вопросах
          </Link>
        </p>
      </div>

      <header className="border-b border-line bg-surface-raised">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/prototype" className="flex items-center gap-2">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-sm font-bold text-white"
            >
              А
            </span>
            <span className="text-base font-semibold tracking-tight text-ink">
              АльтШкола
            </span>
          </Link>

          <ProtoNav />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
