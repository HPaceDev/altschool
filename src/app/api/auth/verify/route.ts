import { NextResponse, type NextRequest } from "next/server";
import { consumeLoginLink } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getBaseUrl } from "@/lib/request-context";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  // Адрес берётся из настройки или заголовков запроса, а не из
  // request.nextUrl.origin: последний отражает адрес, на котором слушает сам
  // сервер. За обратным прокси и при заходе по IP он не совпадает с тем, что
  // видит пользователь, и после перехода по ссылке его унесло бы на чужой
  // адрес — уже без только что выданной cookie.
  const base = await getBaseUrl();

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing", base));
  }

  const user = await consumeLoginLink(token);

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=expired", base));
  }

  await recordAudit({
    actor: user,
    action: "auth.login",
    entityType: "user",
    entityId: user.id,
    entityCode: user.email,
    summary: `${user.name} вошёл в портал`,
  });

  return NextResponse.redirect(new URL("/", base));
}
