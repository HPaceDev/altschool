import { headers } from "next/headers";

export type RequestContext = {
  ip: string | null;
  userAgent: string | null;
};

/**
 * IP и браузер отвечающего попадают в журнал и в каждую фиксацию ответа.
 * Это не идентификация уровня ЭЦП, но вместе с входом по личной ссылке
 * на email даёт связку «конкретный человек — конкретное время — конкретный текст».
 */
export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return {
    ip: forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
    userAgent: h.get("user-agent"),
  };
}
