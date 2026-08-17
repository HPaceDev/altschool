import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { getRequestContext } from "./request-context";
import type { SessionUser } from "./auth";

export type AuditEntry = {
  actor: SessionUser | null;
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

  await db.insert(auditLog).values({
    actorId: entry.actor?.id ?? null,
    actorEmail: entry.actor?.email ?? null,
    actorName: entry.actor?.name ?? null,
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
