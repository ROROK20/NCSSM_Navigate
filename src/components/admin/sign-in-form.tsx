"use client";

import { useActionState } from "react";
import { signIn, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui";

export function SignInForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    signIn,
    null,
  );

  return (
    <form action={action} className="max-w-sm space-y-4">
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Editor password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={state && !state.ok ? "signin-error" : undefined}
          className="mt-2 w-full rounded-[var(--radius)] border border-line bg-surface px-3 py-2.5 text-[15px] text-ink transition-colors hover:border-line-strong focus:border-accent"
        />
      </div>

      {state && !state.ok ? (
        <p
          id="signin-error"
          role="alert"
          className="text-sm text-[color:var(--danger)]"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Checking" : "Sign in"}
      </Button>

      <p className="text-xs leading-relaxed text-faint">
        This is the shared Student Government editor password, not your NCSSM
        account. Navigate never asks for a school password.
      </p>
    </form>
  );
}
