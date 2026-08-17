"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/actions/questions";
import { buttonStyles } from "./ui";

type ServerAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

function Submit({
  label,
  pendingLabel,
  variant,
  confirm,
}: {
  label: string;
  pendingLabel: string;
  variant: keyof typeof buttonStyles;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonStyles[variant]}
      onClick={
        confirm
          ? (event) => {
              if (!window.confirm(confirm)) event.preventDefault();
            }
          : undefined
      }
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * Все действия портала возвращают {ok, message}, поэтому форму, состояние
 * отправки и показ результата достаточно описать один раз.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Сохраняем…",
  variant = "primary",
  confirm,
  children,
  footer,
  className = "",
}: {
  action: ServerAction;
  submitLabel: string;
  pendingLabel?: string;
  variant?: keyof typeof buttonStyles;
  confirm?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Submit
          label={submitLabel}
          pendingLabel={pendingLabel}
          variant={variant}
          confirm={confirm}
        />
        {footer}
        {state ? (
          <p className={`text-sm ${state.ok ? "text-done" : "text-blocker"}`}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
