import Link from "next/link";
import { findSchool } from "@/lib/prototype-data";
import { Photo } from "@/components/prototype/parts";

export const metadata = { title: "Мои заявки" };

/** Демонстрационные заявки: показывают, какие статусы вообще бывают. */
const REQUESTS = [
  {
    schoolSlug: "pyatoe-izmerenie",
    child: "Артём, 8 лет",
    createdAt: "3 дня назад",
    status: "Назначена встреча",
    tone: "done" as const,
    detail: "День открытых дверей 14 сентября в 11:00, адрес пришлём накануне",
  },
  {
    schoolSlug: "tochka-rosta",
    child: "Артём, 8 лет",
    createdAt: "3 дня назад",
    status: "Школа изучает анкету",
    tone: "accent" as const,
    detail: "Обычно отвечают в течение рабочего дня",
  },
  {
    schoolSlug: "montessori-dom",
    child: "Ева, 5 лет",
    createdAt: "неделю назад",
    status: "Лист ожидания",
    tone: "later" as const,
    detail: "Место освободится не раньше января, школа сообщит",
  },
];

const toneClass = {
  done: "bg-done-soft text-done",
  accent: "bg-accent-soft text-accent-text",
  later: "bg-later-soft text-later",
};

export default function CabinetPage() {
  return (
    <>
      <h1 className="display text-xl text-ink">Мои заявки</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Здесь видно, что происходит с каждой заявкой и что делать дальше.
      </p>

      <ul className="mt-5 space-y-3">
        {REQUESTS.map((request) => {
          const school = findSchool(request.schoolSlug);
          if (!school) return null;

          return (
            <li
              key={request.schoolSlug}
              className="flex flex-wrap items-start gap-4 rounded-xl border border-line bg-surface-raised p-4"
            >
              <Photo school={school} className="h-14 w-14 shrink-0 rounded-lg" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/prototype/school/${school.slug}`}
                    className="font-medium text-ink hover:text-accent-text"
                  >
                    {school.name}
                  </Link>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${toneClass[request.tone]}`}
                  >
                    {request.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{request.detail}</p>
                <p className="mt-1.5 text-xs text-ink-faint">
                  {request.child} · заявка отправлена {request.createdAt}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-line-strong px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-sunken"
                >
                  Написать школе
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-xl border border-dashed border-line-strong px-5 py-6 text-center">
        <p className="text-sm text-ink-muted">Хотите рассмотреть ещё варианты?</p>
        <Link
          href="/prototype/catalog"
          className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Подобрать школы
        </Link>
      </div>
    </>
  );
}
