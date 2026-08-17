-- Триггеры на строки не срабатывают при TRUNCATE — таблицу можно было бы
-- очистить целиком в обход защиты из 0001. Закрываем и это.
--
-- Обойти оставшийся путь (DROP TABLE / DROP SCHEMA) можно только правами
-- владельца схемы. В продакшене приложение подключается ролью без права DDL,
-- см. раздел «Роль приложения» в README.

CREATE OR REPLACE FUNCTION portal_block_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    'Таблица "%" хранит историю проекта: очистка запрещена.', TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

CREATE TRIGGER audit_log_no_truncate
  BEFORE TRUNCATE ON "audit_log"
  FOR EACH STATEMENT EXECUTE FUNCTION portal_block_truncate();
--> statement-breakpoint

CREATE TRIGGER answers_no_truncate
  BEFORE TRUNCATE ON "answers"
  FOR EACH STATEMENT EXECUTE FUNCTION portal_block_truncate();
--> statement-breakpoint

CREATE TRIGGER approvals_no_truncate
  BEFORE TRUNCATE ON "approvals"
  FOR EACH STATEMENT EXECUTE FUNCTION portal_block_truncate();
--> statement-breakpoint

CREATE TRIGGER comments_no_truncate
  BEFORE TRUNCATE ON "comments"
  FOR EACH STATEMENT EXECUTE FUNCTION portal_block_truncate();
