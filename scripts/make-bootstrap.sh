#!/usr/bin/env bash
#
# Пересоздаёт drizzle/bootstrap.sql — файл, которым база портала поднимается
# одним куском: через SQL-редактор Supabase или через docker-entrypoint-initdb.d.
#
# Запускать после изменения схемы или стартового наполнения:
#   npm run db:reset && ./scripts/make-bootstrap.sh
#
# Файл собирается из локальной базы, поэтому он всегда соответствует тому,
# что реально проверено миграциями и тестами.

set -euo pipefail

cd "$(dirname "$0")/.."

: "${DATABASE_URL:=postgresql://altschool:altschool@127.0.0.1:5432/altschool}"

OUT=drizzle/bootstrap.sql

{
  cat <<'HEADER'
-- Полная инициализация базы портала согласования: одним файлом.
--
-- Куда вставлять: Supabase -> SQL Editor -> New query -> вставить всё
-- содержимое -> Run. Терминал и Node.js для этого не нужны.
--
-- Файл создаёт таблицы, триггеры неизменяемости истории, отметки о
-- применённых миграциях и стартовое наполнение: 14 вопросов первого круга,
-- словарь процесса и типовые риски.
--
-- После загрузки замените адрес тестового заказчика на реальный:
--   update users set email = 'ivanov@company.ru', name = 'Иван Иванов'
--   where email = 'client@example.com';
--
-- Файл сгенерирован из выверенной локальной базы; вручную его не правьте —
-- пересоздайте: npm run db:reset && ./scripts/make-bootstrap.sh

HEADER

  # Файл должен исполняться любым SQL-клиентом, а не только psql, поэтому из
  # дампа убирается всё, что понимает один лишь psql:
  #
  #   --inserts  — иначе данные выгружаются через «COPY ... FROM stdin» с
  #                построчным блоком, который умеет читать только psql;
  #   grep -v    — свежий pg_dump оборачивает вывод в мета-команды \restrict
  #                и \unrestrict, и редактор Supabase спотыкается на них с
  #                «syntax error at or near "restrict"».
  pg_dump "$DATABASE_URL" --no-owner --no-privileges --no-comments --inserts \
    | sed 's/^CREATE SCHEMA drizzle;/CREATE SCHEMA IF NOT EXISTS drizzle;/' \
    | grep -v '^\\'

  # pg_dump обнуляет search_path на время загрузки и не возвращает его обратно.
  # Сессия клиента остаётся в состоянии, где «select * from questions» не
  # находит таблицу, — возвращаем нормальное значение.
  cat <<'FOOTER'

-- Восстанавливаем search_path: pg_dump обнуляет его в начале файла.
SELECT pg_catalog.set_config('search_path', 'public', false);
FOOTER
} > "$OUT"

if grep -q '^\\' "$OUT"; then
  echo "Ошибка: в $OUT остались мета-команды psql." >&2
  exit 1
fi

echo "Готово: $OUT ($(wc -l < "$OUT") строк)"
