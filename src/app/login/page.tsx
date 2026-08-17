import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Вход" };

const errorMessages: Record<string, string> = {
  missing: "В ссылке не оказалось кода входа. Запросите новую.",
  expired: "Ссылка уже использована или истекла. Запросите новую — это займёт минуту.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-7">
          <h1 className="text-xl font-semibold tracking-tight text-ink">Портал согласования</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Здесь лежит кликабельный прототип, вопросы по будущей системе и все принятые
            решения. Доступ только по приглашению.
          </p>
        </div>

        <LoginForm initialError={error ? errorMessages[error] : undefined} />

        <p className="mt-6 text-xs leading-relaxed text-ink-faint">
          Вход по ссылке нужен, чтобы у каждого ответа был автор и точное время. Это
          защищает обе стороны: видно, кто и что согласовал.
        </p>
      </div>
    </div>
  );
}
