import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { getRequestContext } from "./request-context";
import type { RoleId } from "./roles";

export type AuditEntry = {
  /** Имя, которое человек ввёл сам, либо название роли. */
  actorName?: string | null;
  actorRole?: RoleId | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityCode?: string | null;
  summary: string;
  payload?: unknown;
};

/**
 * Единственный способ записать событие в журнал. Вызывается из каждого
 * действия, меняющего состояние портала: если события нет в журнале, значит
 * действия не было.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  const { ip, userAgent } = await getRequestContext();

  try {
    await writeAudit(entry, ip, userAgent);
  } catch (error) {
    // Журнал — это след действия, а не само действие. Недоступная база не
    // должна закрывать прототип: агрегатор работает вообще без неё, и падать
    // на показе заказчику из-за записи в журнал недопустимо.
    console.error("[журнал] не удалось записать событие:", entry.action, error);
  }
}

async function writeAudit(
  entry: AuditEntry,
  ip: string | null,
  userAgent: string | null,
): Promise<void> {
  await db.insert(auditLog).values({
    actorRole: entry.actorRole ?? null,
    actorName: entry.actorName ?? null,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
    entityCode: entry.entityCode ?? null,
    summary: entry.summary,
    payload: (entry.payload ?? null) as Record<string, unknown> | null,
    ip,
    userAgent,
  });
}
