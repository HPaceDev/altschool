import { db, sql } from "./index";
import { auditLog, questions } from "./schema";
import { SEED_QUESTIONS } from "./questions";

/**
 * Стартовое наполнение портала: участники и первый круг вопросов к заказчику.
 *
 * Вопросы привязаны к экранам прототипа: на каждый экран, где мы что-то
 * додумали за заказчика, приходится вопрос. Ответы на них определяют, каким
 * станет прототип во второй версии и что попадёт в задание разработчикам.
 */

async function main() {
  // Добавляем только недостающие вопросы: ответы и утверждения по уже
  // заведённым трогать нельзя, а новые вопросы появляются после каждого
  // разговора с заказчиком.
  const existing = await db.select({ code: questions.code }).from(questions);
  const known = new Set(existing.map((q) => q.code));
  const missing = SEED_QUESTIONS.filter((q) => !known.has(q.code));

  if (missing.length === 0) {
    console.log(`Все ${SEED_QUESTIONS.length} вопросов уже в базе — добавлять нечего.`);
    return;
  }

  await db.insert(questions).values(
    missing.map((q) => ({
      code: q.code,
      title: q.title,
      body: q.body,
      area: q.area,
      screenRef: q.screenRef,
      priority: q.priority,
      defaultAssumption: q.defaultAssumption,
    })),
  );

  await db.insert(auditLog).values({
    actorRole: "team",
    actorName: "Команда проекта",
    action: "project.seeded",
    entityType: "project",
    summary: `Заведено вопросов: ${missing.length} (${missing.map((q) => q.code).join(", ")})`,
  });

  console.log(`Добавлено вопросов: ${missing.length} из ${SEED_QUESTIONS.length}.`);
  console.log("Входа по паролю нет — на стартовой странице выбирается роль.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
