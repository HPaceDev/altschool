#!/usr/bin/env bash
#
# Установка портала согласования на чистый сервер с Ubuntu.
#
# Запуск от root:
#   bash <(curl -fsSL https://raw.githubusercontent.com/HPaceDev/altschool/claude/large-system-design-76o4o7/scripts/install-server.sh)
#
# Скрипт ставит Docker, забирает исходники, генерирует пароли, поднимает
# приложение с базой и выпускает сертификат HTTPS. Повторный запуск безопасен:
# уже готовое переиспользуется, пароли не перегенерируются.

set -euo pipefail

REPO_URL="https://github.com/HPaceDev/altschool.git"
BRANCH="claude/large-system-design-76o4o7"
APP_DIR="/opt/portal"

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m! \033[0m %s\n' "$*" >&2; }
die() { printf '\n\033[1;31mОшибка:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" = "0" ] || die "Запустите от root: sudo bash …"

# --------------------------------------------------------------------------
# Что нужно спросить
# --------------------------------------------------------------------------

DOMAIN="${DOMAIN:-}"
OWNER_EMAIL="${OWNER_EMAIL:-}"

SERVER_IP="$(curl -fsS --max-time 10 https://api.ipify.org 2>/dev/null || echo '')"

if [ -z "$DOMAIN" ]; then
  echo
  echo "Домен нужен только для сертификата HTTPS. Без него портал тоже работает."
  read -rp "Домен портала (Enter — открыть по IP): " DOMAIN
fi

# CADDY_SITE — то, что попадёт в конфиг Caddy: имя домена или «:80» для
# работы по IP без сертификата. APP_URL — адрес, который портал подставляет
# в ссылки для входа.
if [ -n "$DOMAIN" ]; then
  CADDY_SITE="$DOMAIN"
  APP_URL="https://$DOMAIN"
else
  [ -n "$SERVER_IP" ] || die "Не удалось определить адрес сервера. Укажите домен: DOMAIN=… bash …"

  echo
  echo "Есть два способа открыть портал без своего домена:"
  echo
  echo "  1. https://$SERVER_IP.sslip.io — настоящий сертификат, ничего покупать"
  echo "     не нужно. sslip.io — публичный сервис, который отдаёт адрес прямо"
  echo "     из имени. Трафик шифруется, браузер не ругается."
  echo
  echo "  2. http://$SERVER_IP — просто по адресу, без шифрования. Ссылки для"
  echo "     входа и cookie идут открытым текстом: годится посмотреть самому,"
  echo "     но не для показа заказчику."
  echo
  read -rp "Использовать вариант 1 с сертификатом? [Y/n] " use_sslip

  if [ "$use_sslip" = "n" ] || [ "$use_sslip" = "N" ]; then
    CADDY_SITE=":80"
    APP_URL="http://$SERVER_IP"
    warn "Портал будет работать по http без шифрования. Добавьте домен, прежде чем давать доступ заказчику."
  else
    DOMAIN="$SERVER_IP.sslip.io"
    CADDY_SITE="$DOMAIN"
    APP_URL="https://$DOMAIN"
  fi
fi

if [ -z "$OWNER_EMAIL" ]; then
  read -rp "Ваша рабочая почта (под ней вы войдёте владельцем): " OWNER_EMAIL
fi
[ -n "$OWNER_EMAIL" ] || die "Почта не указана."

# Сертификат выдаётся только на домен, который уже указывает на этот сервер.
if [ -n "$DOMAIN" ]; then
  DOMAIN_IP="$(getent hosts "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || echo '')"

  if [ -n "$SERVER_IP" ] && [ -n "$DOMAIN_IP" ] && [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    warn "Домен $DOMAIN сейчас указывает на $DOMAIN_IP, а сервер имеет адрес $SERVER_IP."
    warn "Пока A-запись не обновится, Let's Encrypt не выдаст сертификат."
    read -rp "Продолжить всё равно? [y/N] " answer
    [ "$answer" = "y" ] || [ "$answer" = "Y" ] || die "Остановлено. Поправьте DNS и запустите скрипт снова."
  elif [ -z "$DOMAIN_IP" ]; then
    warn "Домен $DOMAIN пока не разрешается в адрес. Сертификат будет выдан после настройки DNS."
  fi
fi

# --------------------------------------------------------------------------
# Подкачка: сборка Next.js требовательна к памяти
# --------------------------------------------------------------------------

MEM_MB="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)"
if [ "$MEM_MB" -lt 3000 ] && [ ! -f /swapfile ]; then
  say "Памяти ${MEM_MB} МБ — добавляю файл подкачки, иначе сборка может прерваться"
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --------------------------------------------------------------------------
# Docker и git
# --------------------------------------------------------------------------

if ! command -v docker >/dev/null 2>&1; then
  say "Устанавливаю Docker"
  curl -fsSL https://get.docker.com | sh
else
  say "Docker уже установлен"
fi

command -v git >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq git; }

docker compose version >/dev/null 2>&1 || die "Нет плагина docker compose. Обновите Docker."

# --------------------------------------------------------------------------
# Исходники
# --------------------------------------------------------------------------

if [ -d "$APP_DIR/.git" ]; then
  say "Обновляю исходники в $APP_DIR"
  git -C "$APP_DIR" fetch --quiet origin "$BRANCH"
  git -C "$APP_DIR" checkout --quiet "$BRANCH"
  git -C "$APP_DIR" reset --hard --quiet "origin/$BRANCH"
else
  say "Забираю исходники в $APP_DIR"
  git clone --quiet --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# --------------------------------------------------------------------------
# Настройки
# --------------------------------------------------------------------------

if [ -f .env ]; then
  # Пароли не трогаем, а адрес обновляем: именно ради смены IP на домен
  # скрипт чаще всего и запускают повторно.
  say "Файл .env уже есть — пароли сохраняю, адрес обновляю"
  sed -i "s|^DOMAIN=.*|DOMAIN=$CADDY_SITE|" .env
  sed -i "s|^APP_URL=.*|APP_URL=$APP_URL|" .env
  grep -q '^DOMAIN=' .env || echo "DOMAIN=$CADDY_SITE" >> .env
  grep -q '^APP_URL=' .env || echo "APP_URL=$APP_URL" >> .env
else
  say "Создаю .env со случайными паролями"
  umask 077
  cat > .env <<ENV
# Создано автоматически $(date '+%Y-%m-%d %H:%M'). Пароли сгенерированы случайно.
POSTGRES_PASSWORD=$(openssl rand -hex 24)
AUTH_SECRET=$(openssl rand -hex 32)
DOMAIN=$CADDY_SITE
APP_URL=$APP_URL
OWNER_EMAIL=$OWNER_EMAIL

# Отправка писем со ссылками для входа. Пока не заполнено, ссылка
# показывается прямо на странице входа — её можно переслать вручную.
RESEND_API_KEY=
MAIL_FROM=
ENV
  umask 022
fi

# --------------------------------------------------------------------------
# Файрвол
# --------------------------------------------------------------------------

if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  say "Открываю порты 80 и 443"
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
fi

# --------------------------------------------------------------------------
# Запуск
# --------------------------------------------------------------------------

if [ -n "$DOMAIN" ]; then
  CERT_NOTE="
Сертификат выпускается при первом обращении. Если браузер ругается,
подождите минуту и обновите страницу."
else
  CERT_NOTE="
Портал работает по http без шифрования. Прежде чем давать доступ
заказчику, добавьте домен и перезапустите скрипт."
fi

say "Собираю и запускаю (первая сборка занимает 3–7 минут)"
docker compose --profile tls up -d --build

say "Жду готовности портала"
for i in $(seq 1 60); do
  code="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:3000/login 2>/dev/null || echo 000)"
  if [ "$code" = "200" ]; then
    printf '\033[1;32mПортал отвечает.\033[0m\n'
    break
  fi
  [ "$i" = "60" ] && { docker compose logs --tail 40 app; die "Портал не поднялся за минуту. Логи выше."; }
  sleep 1
done

cat <<FINAL

────────────────────────────────────────────────────────────
Готово.

  Адрес:    $APP_URL
  Владелец: $OWNER_EMAIL

Откройте адрес и введите почту владельца. Почтовый сервис пока не
подключён, поэтому ссылка для входа появится прямо на странице.
$CERT_NOTE
Дальше пригодится:

  Заменить тестового заказчика на реального:
    cd $APP_DIR
    docker compose exec db psql -U portal -d portal -c \\
      "update users set email='ivanov@company.ru', name='Иван Иванов' \\
       where email='client@example.com';"

  Обновить портал после изменений в коде:
    cd $APP_DIR && git pull && docker compose --profile tls up -d --build

  Резервная копия базы:
    cd $APP_DIR && docker compose exec db pg_dump -U portal portal | gzip > backup-\$(date +%F).sql.gz

  Логи:
    cd $APP_DIR && docker compose logs -f app
────────────────────────────────────────────────────────────
FINAL
