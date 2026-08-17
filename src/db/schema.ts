import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ *
 * Люди и доступ
 * ------------------------------------------------------------------ */

/**
 * owner  — наша команда: заводит вопросы, пишет ТЗ, ведёт скоуп.
 * client — сторона заказчика: отвечает на вопросы и утверждает решения.
 * viewer — только чтение (например, наблюдатели со стороны заказчика).
 */
export const roleEnum = pgEnum("role", ["owner", "client", "viewer"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  org: text("org"),
  role: roleEnum("role").notNull().default("viewer"),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Одноразовые ссылки для входа. Хранится только хеш токена — сам токен
 * живёт лишь в присланной ссылке.
 */
export const magicLinks = pgTable(
  "magic_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("magic_links_token_hash_idx").on(t.tokenHash)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    ip: text("ip"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_hash_idx").on(t.tokenHash)],
);

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
    createdBy: uuid("created_by").references(() => users.id),
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
    authorId: uuid("author_id").references(() => users.id),
    authorEmail: text("author_email").notNull(),
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
    authorId: uuid("author_id").references(() => users.id),
    authorName: text("author_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("comments_question_idx").on(t.questionId)],
);

/* ------------------------------------------------------------------ *
 * Решения, скоуп, риски, глоссарий
 * ------------------------------------------------------------------ */

export const decisionStatusEnum = pgEnum("decision_status", [
  "proposed",
  "approved",
  "superseded",
]);

export const decisions = pgTable("decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  context: text("context").notNull(),
  decision: text("decision").notNull(),
  consequences: text("consequences"),
  status: decisionStatusEnum("status").notNull().default("proposed"),
  /** Ссылка на решение, которое это заменяет. Старое не удаляем никогда. */
  supersedesId: uuid("supersedes_id"),
  sourceQuestionCode: text("source_question_code"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inclusionEnum = pgEnum("inclusion", ["in", "out"]);
export const moscowEnum = pgEnum("moscow", ["must", "should", "could", "wont"]);

export const scopeItems = pgTable("scope_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  /** Явное «не входит» ценнее списка «входит» — оно и снимает претензии. */
  inclusion: inclusionEnum("inclusion").notNull().default("in"),
  moscow: moscowEnum("moscow").notNull().default("must"),
  phase: text("phase").notNull().default("MVP"),
  estimateDays: integer("estimate_days"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const riskStatusEnum = pgEnum("risk_status", ["open", "mitigated", "accepted", "closed"]);
export const levelEnum = pgEnum("level", ["low", "medium", "high"]);

export const risks = pgTable("risks", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  likelihood: levelEnum("likelihood").notNull().default("medium"),
  impact: levelEnum("impact").notNull().default("medium"),
  mitigation: text("mitigation"),
  owner: text("owner"),
  status: riskStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const glossary = pgTable("glossary", {
  id: uuid("id").primaryKey().defaultRandom(),
  term: text("term").notNull().unique(),
  definition: text("definition").notNull(),
  synonyms: text("synonyms"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ *
 * Требования и прототип
 * ------------------------------------------------------------------ */

export const requirementStatusEnum = pgEnum("requirement_status", [
  "draft",
  "review",
  "approved",
  "implemented",
]);

export const requirements = pgTable("requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  /** История в формате «Как <роль>, я хочу <действие>, чтобы <польза>». */
  story: text("story").notNull(),
  /** Критерии приёмки в формате Given / When / Then. */
  acceptance: text("acceptance"),
  area: text("area").notNull().default("Общее"),
  moscow: moscowEnum("moscow").notNull().default("must"),
  status: requirementStatusEnum("status").notNull().default("draft"),
  screenRef: text("screen_ref"),
  /** Трассируемость: из каких вопросов и решений выросло требование. */
  sourceQuestionCodes: text("source_question_codes").array(),
  sourceDecisionCodes: text("source_decision_codes").array(),
  estimatePoints: integer("estimate_points"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const screens = pgTable("screens", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  route: text("route"),
  role: text("role"),
  /** Пустое состояние, загрузка, ошибка, нет прав — где и живут пробелы в ТЗ. */
  states: text("states").array(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const prototypeVersions = pgTable("prototype_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: text("version").notNull().unique(),
  notes: text("notes"),
  url: text("url"),
  isCurrent: boolean("is_current").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

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
    actorId: uuid("actor_id").references(() => users.id),
    actorEmail: text("actor_email").notNull(),
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
    actorId: uuid("actor_id"),
    actorEmail: text("actor_email"),
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
