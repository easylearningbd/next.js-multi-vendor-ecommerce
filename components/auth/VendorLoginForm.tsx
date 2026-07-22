"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { login, type FormState } from "@/lib/auth-actions";
import { PasswordField, SubmitButton, TextField } from "./AuthFields";

export function VendorLoginForm() {
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    login,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="w-full" noValidate>
      <div className="mb-[22px]">
        <TextField
          label="Your Email"
          name="email"
          type="email"
          placeholder="email@address.com"
          autoComplete="email"
          error={state?.fieldErrors?.email}
        />
      </div>

      <div className="mb-[22px]">
        <PasswordField
          label="Password"
          name="password"
          placeholder="8+ characters required"
          autoComplete="current-password"
          error={state?.fieldErrors?.password}
        />
      </div>

      <div className="mb-7 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-[9px]">
          <input
            type="checkbox"
            name="remember"
            className="h-[19px] w-[19px] flex-none rounded-[6px] border-[1.5px] border-[#D6D4DD] accent-iris-500"
          />
          <span className="font-sans text-[13px] font-medium text-ink-soft">Remember Me</span>
        </label>
        <Link
          href="/vendor/register"
          className="font-sans text-[13px] font-semibold text-iris-500 hover:text-iris-600"
        >
          Register New Account
        </Link>
      </div>

      <SubmitButton pending={pending} className="h-[54px] text-[15px]">
        {pending ? "Signing in…" : "Sign in"}
      </SubmitButton>
    </form>
  );
}
