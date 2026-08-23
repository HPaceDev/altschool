import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, findRole } from "@/lib/roles";
import { getBaseUrl } from "@/lib/request-context";
import { recordAudit } from "@/lib/audit";

/**
 * Вход в рабочую область роли. Не авторизация: просто запоминаем выбор и
 * отправляем на нужный экран.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ role: string }> },
) {
  const { role: id } = await params;
  const role = findRole(id);
  const base = await getBaseUrl();

  if (!role) {
    return NextResponse.redirect(new URL("/", base));
  }

  await recordAudit({
    actorName: role.title,
    actorRole: role.id,
    action: "role.entered",
    entityType: "role",
    entityCode: role.id,
    summary: `Открыта рабочая область: ${role.title}`,
  });

  const response = NextResponse.redirect(new URL(role.entry, base));
  response.cookies.set(ROLE_COOKIE, role.id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
