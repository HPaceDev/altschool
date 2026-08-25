import Link from "next/link";
import { notFound } from "next/navigation";
import { findSchool } from "@/lib/prototype-data";
import { Photo } from "@/components/prototype/parts";

export const metadata = { title: "Заявка отправлена" };

export default async function RequestSentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = findSchool(slug);
  if (!school) notFound();

  return (
    <div className="mx-auto max-w-xl py-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-done-soft text-xl text-done">
        ✓
      </div>
      <h1 className="display mt-4 text-2xl text-ink">Заявка отправлена</h1>

      <div className="mx-auto mt-5 flex max-w-sm items-center gap-3 rounded-xl border border-line bg-surface-raised p-3 text-left">
        <Photo school={school} className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <p className="font-medium text-ink">{school.name}</p>
          <p className="text-sm text-ink-muted">
            {school.city} · {school.admission.value}
          </p>
        </div>
      </div>

      <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
        Школа получит заявку и свяжется с вами напрямую — обычно в течение рабочего дня.
        Что происходит с заявкой дальше и видит ли её ваш менеджер — открытый вопрос{" "}
        <Link href="/questions/Q-003" className="underline underline-offset-2">
          Q-003
        </Link>
        .
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/prototype/catalog"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Смотреть другие школы
        </Link>
        <Link
          href="/prototype/favorites"
          className="rounded-lg border border-line-strong px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-sunken"
        >
          Избранное
        </Link>
      </div>
    </div>
  );
}
