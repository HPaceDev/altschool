-- Неизменяемость истории на уровне PostgreSQL.
--
-- Приложение и так никогда не правит эти таблицы, но защита в коде — это
-- обещание, а защита в БД — факт. Даже прямое подключение к базе с правами
-- приложения не сможет задним числом переписать ответ заказчика или стереть
-- строку журнала: сервер отклонит операцию.
--
-- Правка ответа выполняется добавлением новой версии, отмена решения —
-- добавлением решения со статусом superseded. Удаления нет нигде.

CREATE OR REPLACE FUNCTION portal_block_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    'Таблица "%" ведётся только на добавление: операция % запрещена. Внесите новую запись вместо изменения существующей.',
    TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

CREATE TRIGGER audit_log_is_append_only
  BEFORE UPDATE OR DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION portal_block_mutation();
--> statement-breakpoint

CREATE TRIGGER answers_are_append_only
  BEFORE UPDATE OR DELETE ON "answers"
  FOR EACH ROW EXECUTE FUNCTION portal_block_mutation();
--> statement-breakpoint

CREATE TRIGGER approvals_are_append_only
  BEFORE UPDATE OR DELETE ON "approvals"
  FOR EACH ROW EXECUTE FUNCTION portal_block_mutation();
--> statement-breakpoint

CREATE TRIGGER comments_are_append_only
  BEFORE UPDATE OR DELETE ON "comments"
  FOR EACH ROW EXECUTE FUNCTION portal_block_mutation();
--> statement-breakpoint

-- Каскад из questions удалил бы связанные ответы и комментарии в обход
-- замысла, поэтому ссылки переводятся на RESTRICT: вопрос с историей удалить
-- нельзя, его можно только перевести в статус withdrawn.
ALTER TABLE "answers" DROP CONSTRAINT IF EXISTS "answers_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "answers"
  ADD CONSTRAINT "answers_question_id_questions_id_fk"
  FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT;
--> statement-breakpoint

ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "comments"
  ADD CONSTRAINT "comments_question_id_questions_id_fk"
  FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT;
