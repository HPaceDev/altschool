#!/usr/bin/env bash
# Выгружает ответы заказчика с работающего сервера в читаемый текст.
#
# Зачем: код и вопросы живут в репозитории, а ответы — только в базе на
# сервере. Чтобы учесть их в прототипе и в ТЗ, ответы нужно донести обратно.
#
# Запуск на сервере:
#   cd /opt/portal && bash scripts/export-answers.sh > otvety.md
# Дальше файл можно просто прислать.
set -euo pipefail

psql_run() {
  if [ -n "${DATABASE_URL:-}" ]; then
    psql "$DATABASE_URL" -At -c "$1"
  else
    docker compose exec -T db psql -U portal -d portal -At -c "$1"
  fi
}

echo "# Ответы заказчика"
echo
echo "Выгружено: $(date '+%d.%m.%Y %H:%M')"
echo

psql_run "
select
  '## ' || q.code || ' — ' || q.title || E'\n\n' ||
  '- статус: ' || q.status || E'\n' ||
  '- область: ' || q.area || E'\n\n' ||
  coalesce(
    (select string_agg(
       '### Версия ' || a.version || ' · ' || a.author_name || ' · ' ||
       to_char(a.created_at, 'DD.MM.YYYY HH24:MI') || E'\n\n' || a.body,
       E'\n\n' order by a.version)
     from answers a where a.question_id = q.id),
    '_Ответа пока нет._'
  ) || E'\n' ||
  coalesce(
    (select E'\n**Утверждено:** ' || string_agg(
       ap.actor_name || ' · ' || to_char(ap.created_at, 'DD.MM.YYYY HH24:MI'), '; ')
     from approvals ap where ap.entity_id = q.id),
    ''
  ) || E'\n' ||
  coalesce(
    (select E'\n**Комментарии:**' || string_agg(
       E'\n- ' || c.author_name || ': ' || c.body, '')
     from comments c where c.question_id = q.id),
    ''
  )
from questions q
where exists (select 1 from answers a where a.question_id = q.id)
   or exists (select 1 from comments c where c.question_id = q.id)
order by q.code;
"
