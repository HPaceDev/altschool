import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { magicLinks, sessions, users } from "@/db/schema";
import { getRequestContext } from "./request-context";

export const SESSION_COOKIE = "portal_session";

const MAGIC_LINK_TTL_MINUTES = 30;
const SESSION_TTL_DAYS = 30;

export type Role = "owner" | "client" | "viewer";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  org: string | null;
  role: Role;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function newToken(): string {
  return randomBytes(32).toString("base64url");
}

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60_000);
}

/* ------------------------------------------------------------------ *
 * Запрос ссылки для входа
 * ------------------------------------------------------------------ */

export type LoginRequestResult =
  | { ok: true; magicUrl: string; delivered: boolean }
  | { ok: false; reason: "unknown_email" | "disabled" };

/**
 * Портал закрытый: ссылку получает только тот, кого мы завели заранее.
 * Исключение — OWNER_EMAIL: он создаётся при первом входе, иначе в свежую
 * систему было бы некому войти.
 */
export async function requestLoginLink(rawEmail: string): Promise<LoginRequestResult> {
  const email = rawEmail.trim().toLowerCase();

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
    if (!ownerEmail || email !== ownerEmail) {
      return { ok: false, reason: "unknown_email" };
    }
    [user] = await db
      .insert(users)
      .values({ email, name: email.split("@")[0], role: "owner" })
      .returning();
  }

  if (user.disabledAt) {
    return { ok: false, reason: "disabled" };
  }

  const token = newToken();
  await db.insert(magicLinks).values({
    email,
    tokenHash: hashToken(token),
    expiresAt: minutesFromNow(MAGIC_LINK_TTL_MINUTES),
  });

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const magicUrl = `${base}/api/auth/verify?token=${token}`;

  const delivered = await deliverLoginEmail(email, magicUrl);
  return { ok: true, magicUrl, delivered };
}

/**
 * Пока не настроен почтовый сервис, ссылка пишется в серверную консоль.
 * Портал остаётся полностью рабочим: ссылку можно отправить заказчику вручную.
 */
async function deliverLoginEmail(email: string, magicUrl: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    console.info(`\n[вход] Ссылка для ${email}:\n${magicUrl}\n`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: "Вход в портал согласования",
        text: `Ссылка действует ${MAGIC_LINK_TTL_MINUTES} минут и работает один раз:\n\n${magicUrl}\n\nЕсли вы не запрашивали вход, просто проигнорируйте письмо.`,
      }),
    });

    if (!response.ok) {
      console.error(`[вход] Resend вернул ${response.status}. Ссылка для ${email}: ${magicUrl}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[вход] Не удалось отправить письмо:", error);
    console.info(`[вход] Ссылка для ${email}: ${magicUrl}`);
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Проверка ссылки и сессия
 * ------------------------------------------------------------------ */

export async function consumeLoginLink(token: string): Promise<SessionUser | null> {
  const tokenHash = hashToken(token);

  const [link] = await db
    .select()
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.tokenHash, tokenHash),
        isNull(magicLinks.usedAt),
        gt(magicLinks.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!link) return null;

  // Ссылка одноразовая: помечаем использованной до выдачи сессии, чтобы
  // повторный переход по той же ссылке уже ничего не давал.
  await db.update(magicLinks).set({ usedAt: new Date() }).where(eq(magicLinks.id, link.id));

  const [user] = await db.select().from(users).where(eq(users.email, link.email)).limit(1);
  if (!user || user.disabledAt) return null;

  await startSession(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    org: user.org,
    role: user.role,
  };
}

async function startSession(userId: string): Promise<void> {
  const token = newToken();
  const { ip, userAgent } = await getRequestContext();
  const expiresAt = daysFromNow(SESSION_TTL_DAYS);

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    ip,
    userAgent,
    expiresAt,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      org: users.org,
      role: users.role,
      disabledAt: users.disabledAt,
      sessionTokenHash: sessions.tokenHash,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!row || row.disabledAt) return null;

  // Сравнение постоянного времени: индекс уже нашёл строку по хешу, но
  // подтверждаем совпадение так, чтобы по времени ответа ничего не утекало.
  const provided = Buffer.from(hashToken(token));
  const stored = Buffer.from(row.sessionTokenHash);
  if (provided.length !== stored.length || !timingSafeEqual(provided, stored)) return null;

  return { id: row.id, email: row.email, name: row.name, org: row.org, role: row.role };
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/* ------------------------------------------------------------------ *
 * Права
 * ------------------------------------------------------------------ */

/** Ведут проект: заводят вопросы, требования, скоуп. */
export function canEditProject(user: SessionUser | null): boolean {
  return user?.role === "owner";
}

/** Отвечают на вопросы и утверждают: заказчик и мы (мы — чтобы внести ответ с встречи). */
export function canAnswer(user: SessionUser | null): boolean {
  return user?.role === "owner" || user?.role === "client";
}

/** Утверждать вправе только сторона заказчика. */
export function canApprove(user: SessionUser | null): boolean {
  return user?.role === "client";
}

export function roleLabel(role: Role): string {
  return { owner: "Исполнитель", client: "Заказчик", viewer: "Наблюдатель" }[role];
}
