import { NextResponse, type NextRequest } from "next/server";
import { consumeLoginLink } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const home = new URL("/", request.nextUrl.origin);

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing", request.nextUrl.origin));
  }

  const user = await consumeLoginLink(token);

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=expired", request.nextUrl.origin));
  }

  await recordAudit({
    actor: user,
    action: "auth.login",
    entityType: "user",
    entityId: user.id,
    entityCode: user.email,
    summary: `${user.name} вошёл в портал`,
  });

  return NextResponse.redirect(home);
}
