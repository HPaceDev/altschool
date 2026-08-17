import postgres from "postgres";

/**
 * Полностью пересоздаёт схему. Нужен только в разработке: очистить таблицы
 * с историей иначе нельзя — это и есть смысл защиты в миграциях 0001 и 0002.
 *
 * Требует прав владельца схемы. В продакшене приложение подключается ролью
 * без права DDL, поэтому там этот сценарий недоступен в принципе.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Не задан DATABASE_URL");

  if (process.env.NODE_ENV === "production" || process.env.ALLOW_RESET === "false") {
    throw new Error("Пересоздание базы запрещено в этом окружении.");
  }

  const host = new URL(url).host;
  console.log(`Пересоздаю схему public на ${host}…`);

  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    // Журнал применённых миграций drizzle живёт в отдельной схеме: без него
    // drizzle-kit решит, что всё уже накатано, и таблицы не появятся.
    await sql.unsafe(
      "drop schema if exists drizzle cascade; drop schema public cascade; create schema public;",
    );
    console.log("Схема пересоздана. Дальше применятся миграции.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
