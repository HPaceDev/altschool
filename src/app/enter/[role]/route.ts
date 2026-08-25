import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, findRole } from "@/lib/roles";
import { getBaseUrl } from "@/lib/request-context";
import { recordAudit } from "@/lib/audit";

/**
 * Вход в рабочую область роли. Не авторизация: просто запоминаем выбор и
 * отправляем на нужный экран.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ role: string }> },
) {
  const { role: id } = await params;
  const role = findRole(id);
  const base = await getBaseUrl();

  if (!role) {
    return NextResponse.redirect(new URL("/", base));
  }

  // Браузеры и роутеры умеют подгружать ссылки заранее. Такой запрос — не
  // выбор роли: cookie по нему не ставим и в журнал ничего не пишем.
  const prefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch");
  if (prefetch) {
    return new NextResponse(null, { status: 204 });
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
