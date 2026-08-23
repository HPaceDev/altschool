import { redirect } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { ROLES, getCurrentRole } from "@/lib/roles";
import { WorkspaceShell, type ShellLink } from "@/components/workspace-shell";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  if (!role) redirect("/");

  const [{ value: openBlockers }] = await db
    .select({ value: count() })
    .from(questions)
    .where(and(eq(questions.status, "open"), eq(questions.priority, "blocker")));

  // Панель показывает все области, а не только доступные роли: прототип
  // смотрят целиком, переключаясь между точками зрения.
  const links: ShellLink[] = ROLES.map((item) => ({
    href: item.entry,
    label: item.title,
    hint: item.who,
    badge: item.entry === "/questions" ? openBlockers || undefined : undefined,
    ready: item.ready,
  })).filter(
    (link, index, all) => all.findIndex((other) => other.href === link.href) === index,
  );

  return (
    <WorkspaceShell roleTitle={role.title} links={links}>
      {children}
    </WorkspaceShell>
  );
}
