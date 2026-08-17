# Образ для развёртывания на своём сервере. На Vercel не используется —
# там сборка идёт из репозитория напрямую.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Сборка не обращается к базе, поэтому реальный DATABASE_URL здесь не нужен,
# но модуль подключения требует непустое значение на этапе импорта.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Сервер работает без прав root: если приложение скомпрометируют,
# злоумышленник не получит контроль над контейнером.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# output: "standalone" собирает сервер вместе с нужными зависимостями,
# поэтому node_modules целиком в образ не попадает.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD node -e "fetch('http://127.0.0.1:3000/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
