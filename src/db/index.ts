import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL не задан. Скопируйте .env.example в .env.local и укажите строку подключения.",
  );
}

/**
 * В dev Next.js перезагружает модули на каждое изменение, а каждый новый
 * postgres() открывает свой пул — без кеша соединения быстро кончаются.
 */
const globalForDb = globalThis as unknown as {
  __portalSql?: ReturnType<typeof postgres>;
};

const sql =
  globalForDb.__portalSql ??
  postgres(connectionString, {
    // Supabase и другие пулеры не поддерживают prepared statements.
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 10 : 3,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__portalSql = sql;
}

export const db = drizzle(sql, { schema });
export { schema, sql };
