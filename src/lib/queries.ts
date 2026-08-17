import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { answers, approvals, comments, questions } from "@/db/schema";

export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;

export type QuestionWithAnswers = Question & {
  answers: Answer[];
  latestAnswer: Answer | null;
  commentCount: number;
  approvalCount: number;
};

/**
 * Вопросов на проекте — десятки, поэтому дешевле собрать связанные данные
 * тремя запросами и сшить их в памяти, чем городить оконные функции.
 */
export async function listQuestions(): Promise<QuestionWithAnswers[]> {
  const [questionRows, answerRows, commentRows, approvalRows] = await Promise.all([
    db.select().from(questions).orderBy(asc(questions.code)),
    db.select().from(answers).orderBy(asc(answers.questionId), asc(answers.version)),
    db.select({ questionId: comments.questionId }).from(comments),
    db
      .select({ entityId: approvals.entityId })
      .from(approvals)
      .where(eq(approvals.entityType, "question")),
  ]);

  const byQuestion = new Map<string, Answer[]>();
  for (const answer of answerRows) {
    const list = byQuestion.get(answer.questionId) ?? [];
    list.push(answer);
    byQuestion.set(answer.questionId, list);
  }

  const commentCounts = new Map<string, number>();
  for (const row of commentRows) {
    commentCounts.set(row.questionId, (commentCounts.get(row.questionId) ?? 0) + 1);
  }

  const approvalCounts = new Map<string, number>();
  for (const row of approvalRows) {
    approvalCounts.set(row.entityId, (approvalCounts.get(row.entityId) ?? 0) + 1);
  }

  return questionRows.map((question) => {
    const list = byQuestion.get(question.id) ?? [];
    return {
      ...question,
      answers: list,
      latestAnswer: list.length ? list[list.length - 1] : null,
      commentCount: commentCounts.get(question.id) ?? 0,
      approvalCount: approvalCounts.get(question.id) ?? 0,
    };
  });
}

export async function getQuestionByCode(code: string) {
  const [question] = await db.select().from(questions).where(eq(questions.code, code)).limit(1);
  if (!question) return null;

  const [answerRows, commentRows, approvalRows] = await Promise.all([
    db
      .select()
      .from(answers)
      .where(eq(answers.questionId, question.id))
      .orderBy(desc(answers.version)),
    db
      .select()
      .from(comments)
      .where(eq(comments.questionId, question.id))
      .orderBy(asc(comments.createdAt)),
    db
      .select()
      .from(approvals)
      .where(eq(approvals.entityId, question.id))
      .orderBy(desc(approvals.createdAt)),
  ]);

  return {
    question,
    answers: answerRows,
    latestAnswer: answerRows[0] ?? null,
    comments: commentRows,
    approvals: approvalRows,
  };
}
