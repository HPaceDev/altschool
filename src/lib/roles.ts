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

export type RoleId = "parent" | "school" | "moderator" | "client" | "team";
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
    who: "Ищет школу для ребёнка",
    description:
      "Главный пользователь сервиса. Подбирает школу по городу, формату и бюджету, сравнивает варианты и записывается на встречу.",
    highlights: ["Каталог с фильтрами", "Карточка школы", "Сравнение", "Заявка"],
    entry: "/prototype",
    ready: true,
  },
  {
    id: "school",
    group: "product",
    title: "Школа",
    who: "Ведёт свой профиль в каталоге",
    description:
      "Кабинет школы: описание, цены, свободные места и входящие заявки. Нужен ли он вообще — открытый вопрос.",
    highlights: ["Профиль школы", "Входящие заявки", "Свободные места"],
    entry: "/school",
    ready: false,
  },
  {
    id: "moderator",
    group: "product",
    title: "Администратор сервиса",
    who: "Наполняет каталог и следит за качеством",
    description:
      "Внутренняя область: добавление школ, модерация отзывов, разбор заявок. Объём зависит от того, откуда берётся база школ.",
    highlights: ["База школ", "Модерация отзывов", "Разбор заявок"],
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
      "Наша сторона: заводим вопросы, фиксируем ответы как основание для требований, снимаем отпавшее.",
    highlights: ["Новые вопросы", "Фиксация ответов", "Допущения по умолчанию"],
    entry: "/questions",
    ready: true,
  },
];

export const GROUP_TITLE: Record<RoleGroup, string> = {
  product: "Роли будущего сервиса",
  project: "Работа над проектом",
};

export const GROUP_NOTE: Record<RoleGroup, string> = {
  product: "Так сервисом будут пользоваться, когда он заработает",
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
