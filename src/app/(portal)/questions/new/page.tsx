import Link from "next/link";
import { redirect } from "next/navigation";
import { canEditProject, getCurrentRole } from "@/lib/roles";
import { priorityHint, priorityLabel } from "@/lib/labels";
import { Card, Field, PageHeader, inputStyles } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { createQuestionAction } from "@/app/actions/questions";

export const metadata = { title: "Новый вопрос" };

export default async function NewQuestionPage() {
  const role = await getCurrentRole();
  if (!canEditProject(role)) redirect("/questions");

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <Link
        href="/questions"
        className="text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
      >
        ← Все вопросы
      </Link>

      <div className="mt-4">
        <PageHeader
          title="Новый вопрос"
          lead="Формулируйте так, чтобы заказчик мог ответить без созвона. Обязательно заполните допущение по умолчанию: именно оно не даёт проекту встать из-за молчания."
        />
      </div>

      <Card className="px-5 py-5">
        <ActionForm action={createQuestionAction} submitLabel="Создать вопрос">
          <div className="space-y-4">
            <Field label="Заголовок" hint="Одна строка, суть вопроса.">
              <input
                type="text"
                name="title"
                required
                placeholder="Кто может отменять заказ после оплаты?"
                className={inputStyles}
              />
            </Field>

            <Field
              label="Описание"
              hint="Контекст, варианты и почему это важно. Хорошо работает формат: «Есть два пути — A и B. A дешевле, B гибче»."
            >
              <textarea name="body" rows={6} required className={inputStyles} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Раздел" hint="Например: Оплаты, Личный кабинет, Роли.">
                <input type="text" name="area" placeholder="Общее" className={inputStyles} />
              </Field>

              <Field label="Экран прототипа" hint="Код экрана, если вопрос привязан к нему.">
                <input type="text" name="screenRef" placeholder="SCR-012" className={inputStyles} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Важность" hint={priorityHint.blocker}>
                <select name="priority" defaultValue="important" className={inputStyles}>
                  {Object.entries(priorityLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ждём ответ до" hint="После этой даты можно применить допущение.">
                <input type="date" name="answerDueAt" className={inputStyles} />
              </Field>
            </div>

            <Field
              label="Допущение по умолчанию"
              hint="Что мы сделаем, если ответа не будет в срок. Это защищает обе стороны: проект не стоит, а заказчик заранее знает последствия молчания."
            >
              <textarea
                name="defaultAssumption"
                rows={3}
                placeholder="Если ответа не будет до 25.08, реализуем вариант A: отмена доступна только администратору. Изменение после этой даты оценивается отдельно."
                className={inputStyles}
              />
            </Field>
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
