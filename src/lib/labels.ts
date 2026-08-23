/**
 * Единственное место, где значения из БД превращаются в русские подписи.
 * Заказчик не должен видеть слова вроде "assumption_applied".
 */

export type Tone = "neutral" | "accent" | "blocker" | "important" | "later" | "done";

export const priorityLabel = {
  blocker: "Блокер",
  important: "Важно",
  later: "Можно позже",
} as const;

export const priorityTone: Record<keyof typeof priorityLabel, Tone> = {
  blocker: "blocker",
  important: "important",
  later: "later",
};

export const priorityHint = {
  blocker: "Без ответа работа по этому участку стоит",
  important: "Без ответа мы движемся медленнее и рискуем переделкой",
  later: "Можно решить позже, но до конца этапа",
} as const;

export const questionStatusLabel = {
  open: "Ждём ответа",
  answered: "Есть ответ",
  accepted: "Зафиксировано",
  assumption_applied: "Действует допущение",
  withdrawn: "Снят",
} as const;

export const questionStatusTone: Record<keyof typeof questionStatusLabel, Tone> = {
  open: "important",
  answered: "accent",
  accepted: "done",
  assumption_applied: "blocker",
  withdrawn: "later",
};

/* ------------------------------------------------------------------ *
 * Даты
 * ------------------------------------------------------------------ */

const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Moscow",
});

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Moscow",
});

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return `${dateTimeFormat.format(new Date(value))} МСК`;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return dateFormat.format(new Date(value));
}

/** «осталось 3 дня» / «просрочено на 2 дня» — для сроков ответа. */
export function describeDeadline(due: Date | string | null | undefined): {
  text: string;
  overdue: boolean;
} | null {
  if (!due) return null;

  const dueDate = new Date(due);
  const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startOfDay(dueDate) - startOfDay(new Date())) / 86_400_000);

  if (days < 0) return { text: `просрочено на ${plural(-days, "день", "дня", "дней")}`, overdue: true };
  if (days === 0) return { text: "срок сегодня", overdue: false };
  if (days === 1) return { text: "срок завтра", overdue: false };
  return { text: `осталось ${plural(days, "день", "дня", "дней")}`, overdue: false };
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}
