import { cookies } from "next/headers";

/**
 * Роли прототипа.
 *
 * Авторизации нет намеренно: это макет, а не работающий сервис. Выбор роли —
 * это выбор рабочей области, а не вход в систему. Роль запоминается в cookie,
 * чтобы не спрашивать её на каждом экране.
 *
 * Роли делятся на две группы, и это не косметика: одни живут в будущем
 * сервисе, другие существуют только на время проектирования и в готовый
 * продукт не попадут.
 */

export const ROLE_COOKIE = "portal_role";

export type RoleId = "parent" | "school" | "franchisee" | "network" | "moderator" | "client" | "team";
export type RoleGroup = "product" | "project";

export type Role = {
  id: RoleId;
  group: RoleGroup;
  title: string;
  /** Кто это в жизни — одной строкой. */
  who: string;
  description: string;
  /** Что можно посмотреть в этой рабочей области. */
  highlights: string[];
  entry: string;
  /** Готова ли область или пока только описана. */
  ready: boolean;
};

export const ROLES: Role[] = [
  {
    id: "parent",
    group: "product",
    title: "Родитель",
    who: "Выбирает школу для ребёнка",
    description:
      "Публичный контур: каталог с проверяемыми данными, карта покрытия, карточка школы с источниками и датами, сравнение и заявка.",
    highlights: ["Каталог", "Карта", "Карточка школы", "Сравнение"],
    entry: "/prototype",
    ready: true,
  },
  {
    id: "school",
    group: "product",
    title: "Школа",
    who: "Ведёт карточку и отвечает на заявки",
    description:
      "Саморегистрация работает: карточку можно завести со статусом «заявлено школой». Кабинет с лидами, аналитикой и модерацией — восемь экранов, которые упираются в неотвеченные вопросы.",
    highlights: ["Добавить школу", "Карточка", "Лиды", "Документы"],
    entry: "/school",
    ready: false,
  },
  {
    id: "franchisee",
    group: "product",
    title: "Франчайзи",
    who: "Управляет своей точкой сети",
    description:
      "Закрытый контур: роялти, ученики из AlfaCRM, звонки из Sipuni, отчёт за период, база знаний. По коммерческому предложению именно с него рекомендуется начинать.",
    highlights: ["Роялти", "Ученики", "Лиды и звонки", "Отчёты"],
    entry: "/franchisee",
    ready: false,
  },
  {
    id: "network",
    group: "product",
    title: "Управляющая компания",
    who: "Видит всю сеть",
    description:
      "Обзор точек, роялти по сети, кандидаты во франчайзи, территории и эксклюзивность, аудит стандартов, интеграции.",
    highlights: ["Обзор сети", "Роялти", "Территории", "Аудит"],
    entry: "/network",
    ready: false,
  },
  {
    id: "moderator",
    group: "product",
    title: "Редакция платформы",
    who: "Проверяет данные школ",
    description:
      "Очередь модерации, пополевая проверка с источником и датой, справочники. Именно эта роль превращает справочник в проверяемую карту.",
    highlights: ["Очередь проверки", "Школы", "Контент", "Справочники"],
    entry: "/admin",
    ready: false,
  },
  {
    id: "client",
    group: "project",
    title: "Заказчик",
    who: "Отвечает на вопросы по будущему сервису",
    description:
      "Вопросы, которые нужно закрыть до разработки. Ответы сохраняются с автором и временем, прежние версии остаются в истории.",
    highlights: ["Ответы на вопросы", "История версий", "Утверждение"],
    entry: "/questions",
    ready: true,
  },
  {
    id: "team",
    group: "project",
    title: "Команда проекта",
    who: "Ведёт проектирование",
    description:
      "Наша сторона: заводим вопросы, фиксируем ответы как основание для требований, применяем допущения по умолчанию.",
    highlights: ["Новые вопросы", "Фиксация ответов", "Допущения"],
    entry: "/questions",
    ready: true,
  },
];

export const GROUP_TITLE: Record<RoleGroup, string> = {
  product: "Роли будущего сервиса",
  project: "Работа над проектом",
};

export const GROUP_NOTE: Record<RoleGroup, string> = {
  product: "Публичный контур и закрытая платформа сети",
  project: "Существуют только на время проектирования и в продукт не попадут",
};

export function findRole(id: string | undefined | null): Role | undefined {
  return ROLES.find((role) => role.id === id);
}

export async function getCurrentRole(): Promise<Role | undefined> {
  const jar = await cookies();
  return findRole(jar.get(ROLE_COOKIE)?.value);
}

/** Отвечать и утверждать вправе только заказчик. */
export function canAnswer(role: Role | undefined): boolean {
  return role?.id === "client";
}

/** Заводить вопросы, фиксировать ответы и снимать вопросы — работа команды. */
export function canEditProject(role: Role | undefined): boolean {
  return role?.id === "team";
}
