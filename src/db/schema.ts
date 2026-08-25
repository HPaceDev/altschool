import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ *
 * Роли
 *
 * Таблицы пользователей нет: прототип открывается выбором роли, без входа
 * в систему. Роль и введённое имя сохраняются прямо в записях — этого
 * достаточно, чтобы у ответа был автор, и не требует учётных записей.
 * ------------------------------------------------------------------ */

export const roleEnum = pgEnum("role", [
  "parent",
  "school",
  "franchisee",
  "network",
  "moderator",
  "client",
  "team",
]);

/* ------------------------------------------------------------------ *
 * Вопросы и ответы — ядро портала
 * ------------------------------------------------------------------ */

/** Блокер останавливает работу, important тормозит, later можно решить позже. */
export const priorityEnum = pgEnum("priority", ["blocker", "important", "later"]);

/**
 * open              — ждём ответа заказчика
 * answered          — ответ есть, мы его ещё не приняли в работу
 * accepted          — ответ зафиксирован как основание для требований
 * assumption_applied— срок ответа вышел, действует допущение по умолчанию
 * withdrawn         — вопрос снят (например, отпал вместе со скоупом)
 */
export const questionStatusEnum = pgEnum("question_status", [
  "open",
  "answered",
  "accepted",
  "assumption_applied",
  "withdrawn",
]);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    area: text("area").notNull().default("Общее"),
    priority: priorityEnum("priority").notNull().default("important"),
    status: questionStatusEnum("status").notNull().default("open"),
    /** Экран прототипа, к которому привязан вопрос, напр. "SCR-012". */
    screenRef: text("screen_ref"),
    /**
     * Что мы сделаем, если ответа не будет в срок. Это ключевая защита:
     * молчание перестаёт блокировать работу и становится согласием.
     */
    defaultAssumption: text("default_assumption"),
    answerDueAt: timestamp("answer_due_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("questions_status_idx").on(t.status),
    index("questions_priority_idx").on(t.priority),
  ],
);

/**
 * Ответы неизменяемы. Правка ответа — это новая версия с большим `version`,
 * прежняя строка остаётся нетронутой. Текущий ответ = максимальная версия.
 */
export const answers = pgTable(
  "answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    body: text("body").notNull(),
    authorRole: roleEnum("author_role").notNull(),
    authorName: text("author_name").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("answers_question_version_idx").on(t.questionId, t.version)],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    body: text("body").notNull(),
    authorRole: roleEnum("author_role").notNull(),
    authorName: text("author_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("comments_question_idx").on(t.questionId)],
);

/* ------------------------------------------------------------------ *
 * Фиксация: утверждения и неизменяемый журнал
 * ------------------------------------------------------------------ */

/**
 * Явное «Утверждаю» с привязкой к человеку и времени. Отдельно от audit_log,
 * потому что это осознанное действие заказчика, а не просто след в системе.
 */
export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    entityCode: text("entity_code").notNull(),
    /** Текст, под которым человек подписался, в том виде, в каком он его видел. */
    statement: text("statement").notNull(),
    actorRole: roleEnum("actor_role").notNull(),
    actorName: text("actor_name").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("approvals_entity_idx").on(t.entityType, t.entityId)],
);

/**
 * Только вставка: ни одна операция портала не изменяет и не удаляет записи
 * этой таблицы. Права на UPDATE/DELETE отзываются на уровне БД в миграции.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    actorRole: text("actor_role"),
    actorName: text("actor_name"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    entityCode: text("entity_code"),
    summary: text("summary").notNull(),
    payload: jsonb("payload"),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (t) => [index("audit_log_at_idx").on(t.at), index("audit_log_entity_idx").on(t.entityType, t.entityId)],
);
