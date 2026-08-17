"use server";

import { redirect } from "next/navigation";
import { endSession, getCurrentUser, requestLoginLink } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export type LoginFormState = {
  status: "idle" | "sent" | "error";
  message: string;
  /** Показывается только когда почта не настроена — чтобы можно было войти вручную. */
  devLink?: string;
};

export async function requestLoginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Похоже, в адресе опечатка. Проверьте почту." };
  }

  const result = await requestLoginLink(email);

  if (!result.ok) {
    const message =
      result.reason === "disabled"
        ? "Доступ для этого адреса приостановлен. Напишите менеджеру проекта."
        : "Этот адрес не в списке участников проекта. Попросите менеджера добавить вас.";
    return { status: "error", message };
  }

  await recordAudit({
    actor: null,
    action: "auth.link_requested",
    entityType: "user",
    entityCode: email,
    summary: `Запрошена ссылка для входа: ${email}`,
  });

  if (!result.delivered) {
    return {
      status: "sent",
      message: "Почтовый сервис пока не подключён — воспользуйтесь ссылкой ниже.",
      devLink: result.magicUrl,
    };
  }

  return {
    status: "sent",
    message: `Ссылка отправлена на ${email}. Она действует 30 минут и сработает один раз.`,
  };
}

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await recordAudit({
      actor: user,
      action: "auth.logout",
      entityType: "user",
      entityId: user.id,
      entityCode: user.email,
      summary: `${user.name} вышел из портала`,
    });
  }
  await endSession();
  redirect("/login");
}
