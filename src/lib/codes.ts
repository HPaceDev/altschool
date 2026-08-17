import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Человекочитаемые номера (Q-014, D-003, REQ-021) нужны, чтобы на вопрос можно
 * было сослаться в переписке, в ТЗ и в протоколе встречи одинаково.
 */
export async function nextCode(
  table: "questions" | "decisions" | "scope_items" | "risks" | "requirements" | "screens",
  prefix: string,
): Promise<string> {
  const rows = await db.execute<{ max: number | null }>(
    sql`select max(cast(substring(code from '[0-9]+$') as integer)) as max
        from ${sql.identifier(table)}
        where code like ${`${prefix}-%`}`,
  );

  const max = Number(rows[0]?.max ?? 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}
