#!/usr/bin/env bash
#
# Отправляет ответы заказчика с сервера в git.
#
# Замыкает петлю: вопросы едут из репозитория на сервер патчем, ответы
# возвращаются обратно сами. Пересылать файлы руками больше не нужно.
#
# Работает так: выгружает ответы из базы, кладёт их в отдельный клон
# (не в рабочую копию портала, чтобы не мешать обновлениям) и коммитит,
# только если что-то изменилось. Если ответов не прибавилось, прогон
# молчит и ничего не отправляет.
#
# Настройки берутся из /etc/portal-answers.env — его создаёт
# scripts/install-answers-sync.sh.
set -euo pipefail

CONFIG="${PORTAL_ANSWERS_CONFIG:-/etc/portal-answers.env}"
# set -a: значения из конфига должны дойти и до scripts/export-answers.sh,
# который запускается отдельным процессом.
if [ -f "$CONFIG" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$CONFIG"
  set +a
fi

PORTAL_DIR="${PORTAL_DIR:-/opt/portal}"
ANSWERS_DIR="${ANSWERS_DIR:-/var/lib/portal-answers}"
# Отдельная ветка только под выгрузку: кода в ней нет, с main она не
# пересекается и сливать её с ним не нужно.
ANSWERS_BRANCH="${ANSWERS_BRANCH:-answers}"
ANSWERS_PATH="${ANSWERS_PATH:-answers}"
SSH_KEY="${ANSWERS_SSH_KEY:-}"

[ -n "${ANSWERS_REPO:-}" ] || {
  echo "Не задан ANSWERS_REPO — куда складывать ответы. См. $CONFIG" >&2
  exit 1
}

# Ключ выдан только на этот репозиторий, поэтому системный ssh-конфиг
# трогать не нужно: подставляем ключ только своим вызовам git.
if [ -n "$SSH_KEY" ]; then
  export GIT_SSH_COMMAND="ssh -i $SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
fi

git_answers() { git -C "$ANSWERS_DIR" "$@"; }

# --- 1. Выгружаем ------------------------------------------------------
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cd "$PORTAL_DIR"
bash scripts/export-answers.sh > "$TMP/otvety.md"
bash scripts/export-answers.sh --json > "$TMP/otvety.json"

# Пустая выгрузка — почти наверняка недоступная база, а не «ответов нет».
# Затирать ею прежнюю историю нельзя.
if [ ! -s "$TMP/otvety.json" ]; then
  echo "Выгрузка пустая — база недоступна? Ничего не отправляю." >&2
  exit 1
fi

# --- 2. Готовим клон ---------------------------------------------------
if [ ! -d "$ANSWERS_DIR/.git" ]; then
  mkdir -p "$ANSWERS_DIR"
  git_answers init -q
  git_answers remote add origin "$ANSWERS_REPO"
  git_answers config user.name "Портал согласования"
  git_answers config user.email "portal@localhost"
fi

git_answers remote set-url origin "$ANSWERS_REPO"

# Сервер — единственный, кто пишет эти файлы, поэтому расхождений быть не
# может: просто встаём на состояние ветки, если она уже есть.
REMOTE_HEAD=""
if git_answers fetch -q origin "$ANSWERS_BRANCH" 2>/dev/null; then
  REMOTE_HEAD="$(git_answers rev-parse FETCH_HEAD)"
  git_answers checkout -q -B "$ANSWERS_BRANCH" FETCH_HEAD
else
  git_answers checkout -q -B "$ANSWERS_BRANCH"
fi

# --- 3. Кладём файлы и коммитим, если есть что --------------------------
mkdir -p "$ANSWERS_DIR/$ANSWERS_PATH"
cp "$TMP/otvety.md" "$ANSWERS_DIR/$ANSWERS_PATH/otvety.md"
cp "$TMP/otvety.json" "$ANSWERS_DIR/$ANSWERS_PATH/otvety.json"

git_answers add -A "$ANSWERS_PATH"

ANSWERED="$(grep -o '"answered": *[0-9]*' "$TMP/otvety.json" | head -1 | tr -dc '0-9')"
TOTAL="$(grep -o '"questionsTotal": *[0-9]*' "$TMP/otvety.json" | head -1 | tr -dc '0-9')"

if git_answers diff --cached --quiet; then
  NEW_ANSWERS=0
else
  NEW_ANSWERS=1
  git_answers commit -q \
    -m "Ответы заказчика: ${ANSWERED:-0} из ${TOTAL:-?} вопросов" \
    -m "Выгружено автоматически $(date '+%d.%m.%Y %H:%M %Z')."
fi

# --- 4. Отправляем ------------------------------------------------------
# Отправку решаем по состоянию ветки, а не по изменениям в файлах. Прошлый
# прогон мог закоммитить локально и не суметь отправить — например, ключ
# ещё не был добавлен. Тогда выгрузка навсегда осталась бы на сервере,
# а каждый следующий прогон бодро сообщал бы, что новых ответов нет.
LOCAL_HEAD="$(git_answers rev-parse HEAD 2>/dev/null || echo '')"

if [ -z "$LOCAL_HEAD" ]; then
  echo "Отправлять пока нечего: ответов в базе нет."
  exit 0
fi

if [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then
  echo "Новых ответов нет, всё отправлено ранее: отвечено ${ANSWERED:-0} из ${TOTAL:-?}."
  exit 0
fi

if git_answers push -q -u origin "$ANSWERS_BRANCH"; then
  if [ "$NEW_ANSWERS" = "1" ]; then
    echo "Отправлено: отвечено ${ANSWERED:-0} из ${TOTAL:-?}."
  else
    echo "Новых ответов нет, но прошлая выгрузка не была отправлена — отправил сейчас."
  fi
else
  echo >&2
  echo "Отправить не удалось. Ключ сервера должен быть добавлен в репозиторий" >&2
  echo "как deploy key именно с правом записи: галочку «Allow write access»" >&2
  echo "задним числом не поставить — ключ нужно удалить и добавить заново." >&2
  echo "Выгрузка сохранена, следующий прогон отправит её сам." >&2
  exit 1
fi
