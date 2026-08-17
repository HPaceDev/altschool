"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestLoginAction, type LoginFormState } from "@/app/actions/auth";
import { buttonStyles, Field, inputStyles } from "@/components/ui";

const initialState: LoginFormState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
      {pending ? "Отправляем…" : "Получить ссылку для входа"}
    </button>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction] = useActionState(requestLoginAction, initialState);

  const error = state.status === "error" ? state.message : initialError;

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Рабочая почта"
        hint="Мы пришлём одноразовую ссылку. Пароль придумывать не нужно."
      >
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="name@company.ru"
          className={inputStyles}
        />
      </Field>

      <SubmitButton />

      {error ? (
        <p className="rounded-lg border border-blocker/25 bg-blocker-soft px-3 py-2 text-sm text-blocker">
          {error}
        </p>
      ) : null}

      {state.status === "sent" ? (
        <div className="rounded-lg border border-done/25 bg-done-soft px-3 py-2 text-sm text-done">
          <p>{state.message}</p>
          {state.devLink ? (
            <a
              href={state.devLink}
              className="mt-2 block break-all font-mono text-xs underline underline-offset-2"
            >
              {state.devLink}
            </a>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
