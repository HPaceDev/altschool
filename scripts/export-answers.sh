#!/usr/bin/env bash
#
# Выгружает ответы заказчика из базы портала.
#
# Зачем: вопросы едут из репозитория на сервер патчем, а ответы живут только
# в базе на сервере. Чтобы учесть их в прототипе и в ТЗ, ответы нужно вернуть.
#
# Два формата:
#   md   — читаемый текст, чтобы просмотреть глазами (по умолчанию)
#   json — точная выгрузка со всеми версиями, для разбора
#
# Запуск на сервере:
#   cd /opt/portal && bash scripts/export-answers.sh > otvety.md
#   cd /opt/portal && bash scripts/export-answers.sh --json > otvety.json
#
# Локально: DATABASE_URL='postgres://…' bash scripts/export-answers.sh
#
# Времени выгрузки в файлах намеренно нет: иначе они менялись бы при каждом
# прогоне, и автосинхронизация коммитила бы пустые изменения. Когда сделана
# выгрузка, видно по коммиту.
set -euo pipefail

FORMAT="md"
[ "${1:-}" = "--json" ] && FORMAT="json"

# На сервере база живёт в контейнере, локально — в переменной окружения.
psql_run() {
  if [ -n "${DATABASE_URL:-}" ]; then
    psql "$DATABASE_URL" -At -f -
  else
    docker compose exec -T db psql -U portal -d portal -At -f -
  fi
}

if [ "$FORMAT" = "json" ]; then
  psql_run <<'SQL'
select jsonb_pretty(jsonb_build_object(
  'questionsTotal', (select count(*) from questions),
  'answered', (select count(distinct question_id) from answers),
  'questions', coalesce((
    select jsonb_agg(x order by x.code) from (
      select q.code, q.title, q.area, q.priority, q.status,
        coalesce((select jsonb_agg(jsonb_build_object(
            'version', a.version, 'author', a.author_name, 'role', a.author_role,
            'createdAt', a.created_at, 'body', a.body) order by a.version)
          from answers a where a.question_id = q.id), '[]'::jsonb) as answers,
        coalesce((select jsonb_agg(jsonb_build_object(
            'author', ap.actor_name, 'createdAt', ap.created_at,
            'statement', ap.statement) order by ap.created_at)
          from approvals ap where ap.entity_id = q.id), '[]'::jsonb) as approvals,
        coalesce((select jsonb_agg(jsonb_build_object(
            'author', c.author_name, 'role', c.author_role,
            'createdAt', c.created_at, 'body', c.body) order by c.created_at)
          from comments c where c.question_id = q.id), '[]'::jsonb) as comments
      from questions q
      where exists (select 1 from answers a where a.question_id = q.id)
         or exists (select 1 from comments c where c.question_id = q.id)
    ) x
  ), '[]'::jsonb)
));
SQL
  exit 0
fi

echo "# Ответы заказчика"
echo
echo "Выгружено с портала автоматически. Правки здесь бессмысленны: файл"
echo "перезаписывается целиком. Источник правды — база на сервере."
echo

psql_run <<'SQL'
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
SQL
