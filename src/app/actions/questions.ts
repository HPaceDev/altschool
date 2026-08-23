"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { answers, approvals, comments, questions } from "@/db/schema";
import { canAnswer, canEditProject, getCurrentRole } from "@/lib/roles";
import { recordAudit } from "@/lib/audit";
import { getRequestContext } from "@/lib/request-context";
import { nextCode } from "@/lib/codes";

export type ActionResult = { ok: boolean; message: string };

const ok = (message: string): ActionResult => ({ ok: true, message });
const fail = (message: string): ActionResult => ({ ok: false, message });

/**
 * Имя автора. Поле необязательное: если его не заполнили, в истории
 * останется название роли — это хуже, чем имя, но лучше, чем пустота.
 */
function displayName(formData: FormData, fallback: string): string {
  return String(formData.get("authorName") ?? "").trim().slice(0, 80) || fallback;
}

/* ------------------------------------------------------------------ *
 * Ответ на вопрос
 * ------------------------------------------------------------------ */

export async function submitAnswerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const role = await getCurrentRole();
  if (!role || !canAnswer(role)) return fail("Отвечать на вопросы может только заказчик.");

  const questionId = String(formData.get("questionId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (body.length < 2) return fail("Напишите ответ — хотя бы пару слов.");

  const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!question) return fail("Вопрос не найден.");
  if (question.status === "withdrawn") return fail("Вопрос снят, отвечать на него уже не нужно.");

  const { ip, userAgent } = await getRequestContext();

  // Новый ответ всегда добавляется следующей версией: прежний текст остаётся
  // в истории нетронутым, поэтому «мы такого не писали» не сработает.
  const [{ current }] = await db
    .select({ current: sql<number>`coalesce(max(${answers.version}), 0)` })
    .from(answers)
    .where(eq(answers.questionId, questionId));

  const version = Number(current) + 1;

  await db.insert(answers).values({
    questionId,
    version,
    body,
    authorRole: role.id,
    authorName: displayName(formData, role.title),
    ip,
    userAgent,
  });

  await db
    .update(questions)
    .set({ status: "answered", updatedAt: new Date() })
    .where(eq(questions.id, questionId));

  await recordAudit({
    actorRole: role.id,
    actorName: displayName(formData, role.title),
    action: version === 1 ? "question.answered" : "question.answer_revised",
    entityType: "question",
    entityId: questionId,
    entityCode: question.code,
    summary:
      version === 1
        ? `${displayName(formData, role.title)} ответил на ${question.code}`
        : `${displayName(formData, role.title)} уточнил ответ на ${question.code} (версия ${version})`,
    payload: { version, body },
  });

  revalidatePath("/questions");
  revalidatePath(`/questions/${question.code}`);
  revalidatePath("/");
  revalidatePath("/journal");

  return ok(
    version === 1
      ? "Ответ сохранён. Мы его увидим сразу."
      : `Сохранена версия ${version}. Предыдущая осталась в истории.`,
  );
}

/* ------------------------------------------------------------------ *
 * Комментарий (обсуждение без изменения ответа)
 * ------------------------------------------------------------------ */

export async function addCommentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const role = await getCurrentRole();
  if (!role) return fail("Сначала выберите роль на стартовой странице.");

  const questionId = String(formData.get("questionId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2) return fail("Комментарий пустой.");

  const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!question) return fail("Вопрос не найден.");

  await db.insert(comments).values({
    questionId,
    body,
    authorRole: role.id,
    authorName: displayName(formData, role.title),
  });

  await recordAudit({
    actorRole: role.id,
    actorName: displayName(formData, role.title),
    action: "question.commented",
    entityType: "question",
    entityId: questionId,
    entityCode: question.code,
    summary: `${displayName(formData, role.title)} прокомментировал ${question.code}`,
    payload: { body },
  });

  revalidatePath(`/questions/${question.code}`);
  revalidatePath("/journal");
  return ok("Комментарий добавлен.");
}

/* ------------------------------------------------------------------ *
 * Фиксация ответа и утверждение
 * ------------------------------------------------------------------ */

/** Исполнитель принимает ответ как основание для требований. */
export async function acceptAnswerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const role = await getCurrentRole();
  if (!role || !canEditProject(role)) return fail("Фиксировать ответ может только команда проекта.");

  const questionId = String(formData.get("questionId") ?? "");
  const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!question) return fail("Вопрос не найден.");

  const [latest] = await db
    .select()
    .from(answers)
    .where(eq(answers.questionId, questionId))
    .orderBy(desc(answers.version))
    .limit(1);

  if (!latest) return fail("Ответа пока нет — фиксировать нечего.");

  await db
    .update(questions)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(questions.id, questionId));

  await recordAudit({
    actorRole: role.id,
    actorName: displayName(formData, role.title),
    action: "question.accepted",
    entityType: "question",
    entityId: questionId,
    entityCode: question.code,
    summary: `${question.code}: ответ зафиксирован как основание для требований`,
    payload: { answerVersion: latest.version },
  });

  revalidatePath(`/questions/${question.code}`);
  revalidatePath("/questions");
  revalidatePath("/journal");
  return ok("Ответ зафиксирован.");
}

/** Заказчик подтверждает: «да, это наше решение». */
export async function approveQuestionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const role = await getCurrentRole();
  if (!role || !canAnswer(role)) return fail("Утверждать может только заказчик.");

  const questionId = String(formData.get("questionId") ?? "");
  const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!question) return fail("Вопрос не найден.");

  const [latest] = await db
    .select()
    .from(answers)
    .where(eq(answers.questionId, questionId))
    .orderBy(desc(answers.version))
    .limit(1);

  if (!latest) return fail("Сначала нужно ответить на вопрос.");

  const { ip, userAgent } = await getRequestContext();

  // Текст сохраняется целиком: важно зафиксировать не ссылку, а именно то,
  // что человек видел перед собой в момент нажатия кнопки.
  const statement =
    `Подтверждаю ответ на вопрос ${question.code} «${question.title}» ` +
    `в редакции версии ${latest.version}: ${latest.body}`;

  await db.insert(approvals).values({
    entityType: "question",
    entityId: questionId,
    entityCode: question.code,
    statement,
    actorRole: role.id,
    actorName: displayName(formData, role.title),
    ip,
    userAgent,
  });

  await recordAudit({
    actorRole: role.id,
    actorName: displayName(formData, role.title),
    action: "question.approved",
    entityType: "question",
    entityId: questionId,
    entityCode: question.code,
    summary: `${displayName(formData, role.title)} утвердил ответ на ${question.code}`,
    payload: { answerVersion: latest.version },
  });

  revalidatePath(`/questions/${question.code}`);
  revalidatePath("/journal");
  return ok("Утверждение зафиксировано: сохранены ваше имя, время и текст ответа.");
}

/**
 * Срок ответа вышел — вступает в силу заранее описанное допущение.
 * Работа продолжается, а в журнале остаётся след, что решение принято молчанием.
 */
export async function applyAssumptionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const role = await getCurrentRole();
  if (!role || !canEditProject(role)) return fail("Это действие доступно команде проекта.");

  const questionId = String(formData.get("questionId") ?? "");
  const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!question) return fail("Вопрос не найден.");
  if (!question.defaultAssumption)
    return fail("У вопроса не описано допущение по умолчанию — сначала добавьте его.");
  if (!question.answerDueAt) return fail("У вопроса не задан срок ответа.");
  if (question.answerDueAt > new Date())
    return fail(`Срок ответа ещё не вышел (до ${question.answerDueAt.toLocaleDateString("ru-RU")}).`);

  await db
    .update(questions)
    .set({ status: "assumption_applied", updatedAt: new Date() })
    .where(eq(questions.id, questionId));

  await recordAudit({
    actorRole: role.id,
    actorName: displayName(formData, role.title),
    action: "question.assumption_applied",
    entityType: "question",
    entityId: questionId,
    entityCode: question.code,
    summary: `${question.code}: срок ответа истёк, применено допущение по умолчанию`,
    payload: { assumption: question.defaultAssumption, dueAt: question.answerDueAt },
  });

  revalidatePath(`/questions/${question.code}`);
  revalidatePath("/questions");
  revalidatePath("/journal");
  return ok("Допущение применено, работа продолжается по описанному варианту.");
}

/* ------------------------------------------------------------------ *
 * Создание вопроса
 * ------------------------------------------------------------------ */

export async function createQuestionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const role = await getCurrentRole();
  if (!role || !canEditProject(role)) return fail("Заводить вопросы может только команда проекта.");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const area = String(formData.get("area") ?? "Общее").trim() || "Общее";
  const priority = String(formData.get("priority") ?? "important");
  const screenRef = String(formData.get("screenRef") ?? "").trim() || null;
  const defaultAssumption = String(formData.get("defaultAssumption") ?? "").trim() || null;
  const dueRaw = String(formData.get("answerDueAt") ?? "").trim();

  if (title.length < 4) return fail("Сформулируйте заголовок вопроса подробнее.");
  if (body.length < 10) return fail("Опишите вопрос так, чтобы он был понятен без встречи.");
  if (!["blocker", "important", "later"].includes(priority)) return fail("Неизвестная важность.");

  const code = await nextCode("questions", "Q");

  const [created] = await db
    .insert(questions)
    .values({
      code,
      title,
      body,
      area,
      priority: priority as "blocker" | "important" | "later",
      screenRef,
      defaultAssumption,
      answerDueAt: dueRaw ? new Date(dueRaw) : null,
    })
    .returning();

  await recordAudit({
    actorRole: role.id,
    actorName: displayName(formData, role.title),
    action: "question.created",
    entityType: "question",
    entityId: created.id,
    entityCode: code,
    summary: `${displayName(formData, role.title)} завёл вопрос ${code}: ${title}`,
    payload: { priority, area, defaultAssumption, answerDueAt: created.answerDueAt },
  });

  revalidatePath("/questions");
  revalidatePath("/");
  revalidatePath("/journal");
  return ok(`Вопрос ${code} создан.`);
}

/** Вопрос отпал — снимаем, но не удаляем: история остаётся. */
export async function withdrawQuestionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const role = await getCurrentRole();
  if (!role || !canEditProject(role)) return fail("Это действие доступно команде проекта.");

  const questionId = String(formData.get("questionId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3) return fail("Укажите причину — она попадёт в журнал.");

  const [question] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!question) return fail("Вопрос не найден.");

  await db
    .update(questions)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(and(eq(questions.id, questionId)));

  await recordAudit({
    actorRole: role.id,
    actorName: displayName(formData, role.title),
    action: "question.withdrawn",
    entityType: "question",
    entityId: questionId,
    entityCode: question.code,
    summary: `${question.code} снят: ${reason}`,
    payload: { reason },
  });

  revalidatePath("/questions");
  revalidatePath(`/questions/${question.code}`);
  revalidatePath("/journal");
  return ok("Вопрос снят.");
}
