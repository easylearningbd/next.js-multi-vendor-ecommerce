"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { login, type FormState } from "@/lib/auth-actions";
import { PasswordField, SubmitButton, TextField } from "./AuthFields";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    login,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col" noValidate>
      <div className="mb-5">
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="admin@covet.com"
          autoComplete="email"
          error={state?.fieldErrors?.email}
        />
      </div>
      <div className="mb-[26px]">
        <PasswordField
          label="Password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={state?.fieldErrors?.password}
        />
      </div>

      <SubmitButton pending={pending}>
        {pending ? "Signing in…" : "Sign in to Admin"}
      </SubmitButton>
    </form>
  );
}
