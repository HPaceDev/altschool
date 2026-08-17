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
/**
 * Адрес портала для ссылок входа.
 *
 * Приоритет у APP_URL: заголовок Host приходит от клиента, и если полагаться
 * только на него, злоумышленник смог бы выпустить ссылку, ведущую на свой
 * домен. Заголовки — запасной вариант, чтобы первый деплой работал даже до
 * того, как переменная задана.
 *
 * Имя намеренно без префикса NEXT_PUBLIC_: такие переменные подставляются на
 * этапе сборки, и адрес, заданный после деплоя, не подхватился бы без пересборки.
 */
export async function getBaseUrl(): Promise<string> {
  const configured = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3000";

  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return {
    ip: forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
    userAgent: h.get("user-agent"),
  };
}
