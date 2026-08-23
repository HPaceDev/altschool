import Link from "next/link";
import { notFound } from "next/navigation";
import { canAnswer, canEditProject, getCurrentRole } from "@/lib/roles";
import { getQuestionByCode } from "@/lib/queries";
import {
  describeDeadline,
  formatDate,
  formatDateTime,
  priorityHint,
  priorityLabel,
  priorityTone,
  questionStatusLabel,
  questionStatusTone,
} from "@/lib/labels";
import { Badge, Card, Code, inputStyles } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { AuthorNameField } from "@/components/author-name";
import {
  acceptAnswerAction,
  addCommentAction,
  applyAssumptionAction,
  approveQuestionAction,
  submitAnswerAction,
  withdrawQuestionAction,
} from "@/app/actions/questions";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getQuestionByCode(code.toUpperCase());
  return { title: data ? `${data.question.code} — ${data.question.title}` : "Вопрос" };
}

export default async function QuestionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [role, data] = await Promise.all([
    getCurrentRole(),
    getQuestionByCode(code.toUpperCase()),
  ]);

  if (!data) notFound();

  const { question, answers, latestAnswer, comments, approvals } = data;
  const deadline = describeDeadline(question.answerDueAt);
  const isTeam = canEditProject(role);
  const overdueWithoutAnswer =
    question.status === "open" && question.answerDueAt && question.answerDueAt < new Date();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
      <Link
        href="/questions"
        className="text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
      >
        ← Все вопросы
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Code>{question.code}</Code>
        <Badge tone={priorityTone[question.priority]} title={priorityHint[question.priority]}>
          {priorityLabel[question.priority]}
        </Badge>
        <Badge tone={questionStatusTone[question.status]}>
          {questionStatusLabel[question.status]}
        </Badge>
        <span className="text-xs text-ink-faint">{question.area}</span>
        {question.screenRef ? (
          <span className="text-xs text-ink-faint">экран {question.screenRef}</span>
        ) : null}
      </div>

      <h1 className="display mt-2.5 text-2xl text-ink">{question.title}</h1>

      <Card className="mt-4 px-5 py-4">
        <p className="prose-portal text-sm text-ink">{question.body}</p>
        <p className="mt-3 border-t border-line pt-3 text-xs text-ink-faint">
          Задан {formatDateTime(question.createdAt)}
        </p>
      </Card>

      {/* Срок и допущение — то, ради чего вопрос вообще заведён именно так. */}
      {question.defaultAssumption || question.answerDueAt ? (
        <Card
          className={`mt-4 px-5 py-4 ${
            overdueWithoutAnswer
              ? "border-blocker/30 bg-blocker-soft"
              : "border-important/30 bg-important-soft"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              overdueWithoutAnswer ? "text-blocker" : "text-important"
            }`}
          >
            {question.answerDueAt
              ? `Ждём ответ до ${formatDate(question.answerDueAt)}`
              : "Если ответа не будет"}
            {deadline && question.status === "open" ? ` — ${deadline.text}` : ""}
          </p>
          {question.defaultAssumption ? (
            <p
              className={`prose-portal mt-2 text-sm ${
                overdueWithoutAnswer ? "text-blocker" : "text-important"
              }`}
            >
              <span className="font-medium">Что будет без ответа: </span>
              {question.defaultAssumption}
            </p>
          ) : null}
          {question.status === "assumption_applied" ? (
            <p className="mt-2 text-sm font-medium text-blocker">
              Срок прошёл, этот вариант принят в работу. Изменение после этого момента
              оценивается отдельно.
            </p>
          ) : null}
        </Card>
      ) : null}

      {/* Ответ */}
      <section className="mt-8">
        <h2 className="display mb-3 text-base text-ink">
          {latestAnswer ? "Текущий ответ" : "Ответ"}
        </h2>

        {latestAnswer ? (
          <Card className="px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-ink">{latestAnswer.authorName}</p>
              <p className="text-xs text-ink-faint">
                {formatDateTime(latestAnswer.createdAt)}
                {answers.length > 1 ? ` · версия ${latestAnswer.version}` : ""}
              </p>
            </div>
            <p className="prose-portal mt-2.5 text-sm text-ink">{latestAnswer.body}</p>
          </Card>
        ) : (
          <Card className="px-5 py-4">
            <p className="text-sm text-ink-muted">Ответа пока нет.</p>
          </Card>
        )}

        {canAnswer(role) && question.status !== "withdrawn" ? (
          <Card className="mt-3 px-5 py-4">
            <ActionForm
              action={submitAnswerAction}
              submitLabel={latestAnswer ? "Сохранить новую версию" : "Ответить"}
            >
              <input type="hidden" name="questionId" value={question.id} />
              <label className="mb-1.5 block text-sm font-medium text-ink">
                {latestAnswer ? "Уточнить ответ" : "Ваш ответ"}
              </label>
              <textarea
                name="body"
                rows={5}
                required
                placeholder="Опишите, как это должно работать. Чем конкретнее, тем меньше переделок потом."
                className={inputStyles}
              />
              {latestAnswer ? (
                <p className="mt-1.5 text-xs text-ink-faint">
                  Прежний ответ не пропадёт — он останется в истории ниже как версия{" "}
                  {latestAnswer.version}.
                </p>
              ) : null}
              <div className="mt-3">
                <AuthorNameField />
              </div>
            </ActionForm>
          </Card>
        ) : null}
      </section>

      {/* История версий ответа */}
      {answers.length > 1 ? (
        <section className="mt-8">
          <h2 className="display mb-3 text-base text-ink">История ответов</h2>
          <ol className="space-y-2.5">
            {answers.map((answer, index) => (
              <li key={answer.id}>
                <Card className={`px-5 py-4 ${index === 0 ? "" : "opacity-80"}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ink">
                      Версия {answer.version}
                      {index === 0 ? (
                        <span className="ml-2 text-xs font-normal text-done">действующая</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {answer.authorName} · {formatDateTime(answer.createdAt)}
                    </p>
                  </div>
                  <p className="prose-portal mt-2 text-sm text-ink-muted">{answer.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Утверждения */}
      <section className="mt-8">
        <h2 className="display mb-3 text-base text-ink">Утверждение</h2>

        {approvals.length > 0 ? (
          <ul className="mb-3 space-y-2.5">
            {approvals.map((approval) => (
              <li key={approval.id}>
                <Card className="border-done/30 bg-done-soft px-5 py-4">
                  <p className="text-sm font-medium text-done">
                    {approval.actorName}
                  </p>
                  <p className="mt-1 text-xs text-done/80">
                    {formatDateTime(approval.createdAt)}
                    {approval.ip ? ` · IP ${approval.ip}` : ""}
                  </p>
                  <p className="prose-portal mt-2 text-sm text-done">{approval.statement}</p>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-ink-muted">Ответ ещё не утверждён заказчиком.</p>
        )}

        {canAnswer(role) && latestAnswer ? (
          <Card className="px-5 py-4">
            <p className="text-sm text-ink-muted">
              Нажимая «Утверждаю», вы подтверждаете действующую версию ответа. Ваше имя,
              время и текст ответа сохранятся без возможности изменения — это и есть
              основание, по которому мы будем разрабатывать систему.
            </p>
            <ActionForm
              action={approveQuestionAction}
              submitLabel="Утверждаю"
              pendingLabel="Фиксируем…"
              confirm="Подтвердить действующую версию ответа? Запись останется в истории навсегда."
            >
              <input type="hidden" name="questionId" value={question.id} />
              <div className="mt-3">
                <AuthorNameField />
              </div>
            </ActionForm>
          </Card>
        ) : null}
      </section>

      {/* Обсуждение */}
      <section className="mt-8">
        <h2 className="display mb-3 text-base text-ink">Обсуждение</h2>

        {comments.length > 0 ? (
          <ul className="mb-3 space-y-2.5">
            {comments.map((comment) => (
              <li key={comment.id}>
                <Card className="px-5 py-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{comment.authorName}</p>
                    <p className="text-xs text-ink-faint">{formatDateTime(comment.createdAt)}</p>
                  </div>
                  <p className="prose-portal mt-1.5 text-sm text-ink-muted">{comment.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-ink-muted">
            Пока тихо. Если вопрос непонятен — спросите здесь, это быстрее переписки.
          </p>
        )}

        <Card className="px-5 py-4">
          <ActionForm action={addCommentAction} submitLabel="Отправить" variant="secondary">
            <input type="hidden" name="questionId" value={question.id} />
            <textarea
              name="body"
              rows={3}
              required
              placeholder="Уточнить формулировку, задать встречный вопрос…"
              className={inputStyles}
            />
            <div className="mt-3">
              <AuthorNameField />
            </div>
          </ActionForm>
        </Card>
      </section>

      {/* Действия команды проекта */}
      {isTeam ? (
        <section className="mt-10 border-t border-line pt-6">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-faint uppercase">
            Действия команды проекта
          </h2>
          <div className="space-y-4">
            {latestAnswer && question.status !== "accepted" ? (
              <Card className="px-5 py-4">
                <p className="text-sm text-ink-muted">
                  Зафиксировать ответ как основание для требований в ТЗ.
                </p>
                <ActionForm
                  action={acceptAnswerAction}
                  submitLabel="Зафиксировать ответ"
                  variant="secondary"
                >
                  <input type="hidden" name="questionId" value={question.id} />
                </ActionForm>
              </Card>
            ) : null}

            {overdueWithoutAnswer && question.defaultAssumption ? (
              <Card className="border-blocker/30 px-5 py-4">
                <p className="text-sm text-ink-muted">
                  Срок ответа вышел. Можно применить допущение по умолчанию — работа
                  продолжится, а в журнале останется запись, что вариант принят по умолчанию.
                </p>
                <ActionForm
                  action={applyAssumptionAction}
                  submitLabel="Применить допущение"
                  variant="secondary"
                  confirm="Зафиксировать, что ответа не поступило и действует допущение по умолчанию?"
                >
                  <input type="hidden" name="questionId" value={question.id} />
                </ActionForm>
              </Card>
            ) : null}

            {question.status !== "withdrawn" ? (
              <Card className="px-5 py-4">
                <ActionForm
                  action={withdrawQuestionAction}
                  submitLabel="Снять вопрос"
                  variant="quiet"
                  confirm="Снять вопрос? Он останется в истории со статусом «снят»."
                >
                  <input type="hidden" name="questionId" value={question.id} />
                  <input
                    type="text"
                    name="reason"
                    required
                    placeholder="Причина: например, участок вышел из скоупа MVP"
                    className={inputStyles}
                  />
                </ActionForm>
              </Card>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
