#!/usr/bin/env bash
#
# Настраивает автоматическую отправку ответов заказчика с сервера в git.
#
# После установки сервер сам раз в десять минут проверяет базу и, если
# появились новые ответы, отправляет выгрузку в отдельную ветку репозитория.
# Пересылать файлы руками больше не нужно.
#
# Запуск от root на сервере:
#   cd /opt/portal && bash scripts/install-answers-sync.sh
#
# Повторный запуск безопасен: ключ не перевыпускается, настройки
# переписываются теми же значениями.
set -euo pipefail

PORTAL_DIR="${PORTAL_DIR:-/opt/portal}"
CONFIG="/etc/portal-answers.env"
KEY="/root/.ssh/portal_answers"
INTERVAL="${INTERVAL:-10min}"

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mОшибка:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" = "0" ] || die "Запустите от root: sudo bash scripts/install-answers-sync.sh"
[ -d "$PORTAL_DIR" ] || die "Портал не найден в $PORTAL_DIR"

# --------------------------------------------------------------------------
# Куда складывать ответы
# --------------------------------------------------------------------------

ANSWERS_REPO="${ANSWERS_REPO:-}"
ANSWERS_BRANCH="${ANSWERS_BRANCH:-answers}"

# По умолчанию складываем в тот же репозиторий, откуда развёрнут портал,
# в отдельную ветку. Адрес берём из origin и переводим в формат SSH:
# по HTTPS пуш потребовал бы пароль, а ключ работает молча.
if [ -z "$ANSWERS_REPO" ]; then
  ORIGIN="$(git -C "$PORTAL_DIR" remote get-url origin 2>/dev/null || echo '')"
  case "$ORIGIN" in
    https://github.com/*)
      ANSWERS_REPO="git@github.com:${ORIGIN#https://github.com/}"
      case "$ANSWERS_REPO" in *.git) ;; *) ANSWERS_REPO="$ANSWERS_REPO.git" ;; esac
      ;;
    *) ANSWERS_REPO="$ORIGIN" ;;
  esac
fi

[ -n "$ANSWERS_REPO" ] || die "Не удалось определить репозиторий. Укажите его: ANSWERS_REPO=… bash …"

echo
echo "Ответы будут уходить сюда:"
echo "  репозиторий: $ANSWERS_REPO"
echo "  ветка:       $ANSWERS_BRANCH"
echo
echo "Ветка отдельная, кода в ней нет — только выгрузка ответов."

# --------------------------------------------------------------------------
# Ключ доступа
# --------------------------------------------------------------------------

# Отдельный ключ на один репозиторий: если сервер когда-нибудь окажется в
# чужих руках, отзывается он одной кнопкой и ничего больше не открывает.
NEED_KEY=0
case "$ANSWERS_REPO" in
  *@*:*|ssh://*) NEED_KEY=1 ;;
esac

if [ "$NEED_KEY" = "1" ] && [ ! -f "$KEY" ]; then
  say "Выпускаю ключ доступа для этого сервера"
  mkdir -p /root/.ssh
  chmod 700 /root/.ssh
  ssh-keygen -t ed25519 -N "" -C "portal-answers@$(hostname)" -f "$KEY" -q
fi

# --------------------------------------------------------------------------
# Настройки
# --------------------------------------------------------------------------

say "Записываю настройки в $CONFIG"
cat > "$CONFIG" <<EOF
# Откуда и куда синхронизируются ответы заказчика.
# Создан scripts/install-answers-sync.sh
PORTAL_DIR=$PORTAL_DIR
ANSWERS_REPO=$ANSWERS_REPO
ANSWERS_BRANCH=$ANSWERS_BRANCH
ANSWERS_DIR=${ANSWERS_DIR:-/var/lib/portal-answers}
ANSWERS_PATH=${ANSWERS_PATH:-answers}
EOF

[ "$NEED_KEY" = "1" ] && echo "ANSWERS_SSH_KEY=$KEY" >> "$CONFIG"
chmod 600 "$CONFIG"

# --------------------------------------------------------------------------
# Расписание
# --------------------------------------------------------------------------

if command -v systemctl >/dev/null 2>&1; then
  say "Ставлю таймер systemd: проверка раз в $INTERVAL"

  cat > /etc/systemd/system/portal-answers.service <<EOF
[Unit]
Description=Отправка ответов заказчика в git
After=network-online.target docker.service

[Service]
Type=oneshot
WorkingDirectory=$PORTAL_DIR
ExecStart=/bin/bash $PORTAL_DIR/scripts/sync-answers.sh
EOF

  cat > /etc/systemd/system/portal-answers.timer <<EOF
[Unit]
Description=Проверять новые ответы заказчика

[Timer]
OnBootSec=5min
OnUnitActiveSec=$INTERVAL
Persistent=true

[Install]
WantedBy=timers.target
EOF

  systemctl daemon-reload
  systemctl enable --now portal-answers.timer >/dev/null
  SCHEDULER="systemctl list-timers portal-answers.timer"
else
  say "systemd не найден, ставлю задание в cron: проверка каждые 10 минут"
  CRON_LINE="*/10 * * * * cd $PORTAL_DIR && /bin/bash scripts/sync-answers.sh >/dev/null 2>&1"
  ( crontab -l 2>/dev/null | grep -v 'sync-answers.sh' ; echo "$CRON_LINE" ) | crontab -
  SCHEDULER="crontab -l"
fi

# --------------------------------------------------------------------------
# Что осталось сделать руками
# --------------------------------------------------------------------------

if [ "$NEED_KEY" = "1" ]; then
  echo
  echo "──────────────────────────────────────────────────────────────"
  echo "Остался один шаг. Добавьте этот ключ в репозиторий:"
  echo
  echo "  GitHub → Settings → Deploy keys → Add deploy key"
  echo "  Обязательно отметьте «Allow write access»."
  echo
  echo "  Ключ выпущен для этого сервера и отзывается той же кнопкой."
  echo
  cat "$KEY.pub"
  echo
  echo "──────────────────────────────────────────────────────────────"
  echo
  read -rp "Добавили? Нажмите Enter, чтобы проверить. " _
fi

say "Пробный прогон"
if bash "$PORTAL_DIR/scripts/sync-answers.sh"; then
  echo
  say "Готово. Дальше сервер справится сам."
  echo "Расписание:      $SCHEDULER"
  echo "Прогон вручную:  bash $PORTAL_DIR/scripts/sync-answers.sh"
  echo "Что случилось:   journalctl -u portal-answers --no-pager -n 30"
else
  die "Прогон не удался. Чаще всего это значит, что ключ ещё не добавлен
  в репозиторий или добавлен без права записи. Исправьте и повторите:
  bash $PORTAL_DIR/scripts/sync-answers.sh"
fi
