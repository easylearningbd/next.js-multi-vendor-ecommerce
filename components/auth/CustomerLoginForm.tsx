"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { login, type FormState } from "@/lib/auth-actions";
import { PasswordField, SubmitButton, TextField } from "./AuthFields";

export function CustomerLoginForm() {
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
          placeholder="you@example.com"
          autoComplete="email"
          error={state?.fieldErrors?.email}
        />
      </div>
      <div className="mb-4">
        <PasswordField
          label="Password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={state?.fieldErrors?.password}
        />
      </div>
      <label className="mb-[26px] flex cursor-pointer items-center gap-[9px]">
        <input
          type="checkbox"
          name="remember"
          className="h-[19px] w-[19px] flex-none rounded-[6px] border-[1.5px] border-[#D6D4DD] accent-iris-500"
        />
        <span className="font-sans text-[13px] font-medium text-ink-soft">Remember me</span>
      </label>

      <SubmitButton pending={pending}>{pending ? "Signing in…" : "Sign in"}</SubmitButton>

      <p className="mt-7 text-center font-sans text-[13.5px] text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-iris-500 hover:text-iris-600">
          Create one
        </Link>
      </p>
    </form>
  );
}
