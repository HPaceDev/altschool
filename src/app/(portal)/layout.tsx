import { redirect } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { getCurrentUser, roleLabel } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Tabs, type NavItem } from "@/components/nav";
import { buttonStyles } from "@/components/ui";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ value: openBlockers }] = await db
    .select({ value: count() })
    .from(questions)
    .where(and(eq(questions.status, "open"), eq(questions.priority, "blocker")));

  const items: NavItem[] = [
    { href: "/prototype", label: "Прототип" },
    {
      href: "/questions",
      label: "Вопросы",
      badge: openBlockers || undefined,
      badgeTone: "blocker",
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface-raised">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-semibold tracking-tight text-ink">
              Портал согласования
            </span>
            <span className="text-xs text-ink-faint">этап проектирования</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-ink">{user.name}</p>
              <p className="text-xs text-ink-faint">
                {roleLabel(user.role)}
                {user.org ? ` · ${user.org}` : ""}
              </p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className={buttonStyles.quiet}>
                Выйти
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-6xl border-t border-line">
          <Tabs items={items} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <p className="border-t border-line pt-4 text-xs text-ink-faint">
          Все ответы, комментарии и утверждения сохраняются с указанием автора и времени.
          Записи не редактируются и не удаляются: правка добавляет новую версию, прежняя
          остаётся в истории.
        </p>
      </footer>
    </div>
  );
}
