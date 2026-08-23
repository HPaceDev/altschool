import { writeFileSync } from "node:fs";
import { SEED_QUESTIONS, inDays } from "../src/db/questions";

/**
 * Готовит SQL-патч, которым вопросы на уже работающем сервере приводятся в
 * соответствие с исходником.
 *
 * Зачем отдельный файл, а не npm run db:seed: на сервере крутится собранный
 * образ без tsx и исходников, а пересоздавать базу нельзя — вместе с ней
 * пропадут ответы заказчика.
 *
 * Патч добавляет недостающие вопросы и обновляет тексты уже заведённых.
 * Он намеренно не трогает статус, срок ответа и всё, что связано с ответами:
 * формулировку вопроса уточнять можно, ход согласования переписывать нельзя.
 *
 * Запуск: npm run db:questions-sql
 */

const quote = (value: string | null): string =>
  value === null ? "NULL" : `'${value.replace(/'/g, "''")}'`;

const lines: string[] = [
  "-- Синхронизация вопросов с исходником.",
  "--",
  "-- Как применить на сервере:",
  "--   docker compose exec -T db psql -U portal -d portal < drizzle/questions-sync.sql",
  "--",
  "-- Патч добавляет новые вопросы и уточняет формулировки существующих.",
  "-- Ответы, утверждения, статусы и сроки не затрагиваются.",
  "",
  "BEGIN;",
  "",
];

for (const q of SEED_QUESTIONS) {
  lines.push(
    `INSERT INTO questions (code, title, body, area, screen_ref, priority, default_assumption, answer_due_at)`,
    `VALUES (${quote(q.code)}, ${quote(q.title)}, ${quote(q.body)}, ${quote(q.area)}, ${quote(q.screenRef)}, ${quote(q.priority)}, ${quote(q.defaultAssumption)}, ${quote(inDays(q.dueInDays).toISOString())})`,
    `ON CONFLICT (code) DO UPDATE SET`,
    `  title = EXCLUDED.title,`,
    `  body = EXCLUDED.body,`,
    `  area = EXCLUDED.area,`,
    `  screen_ref = EXCLUDED.screen_ref,`,
    `  default_assumption = EXCLUDED.default_assumption,`,
    `  updated_at = now();`,
    "",
  );
}

lines.push(
  `INSERT INTO audit_log (actor_role, actor_name, action, entity_type, summary)`,
  `VALUES ('team', 'Команда проекта', 'questions.synced', 'project',`,
  `        'Вопросы приведены в соответствие с исходником: ${SEED_QUESTIONS.length} шт.');`,
  "",
  "COMMIT;",
  "",
);

const out = "drizzle/questions-sync.sql";
writeFileSync(out, lines.join("\n"));
console.log(`Готово: ${out} (${SEED_QUESTIONS.length} вопросов)`);
