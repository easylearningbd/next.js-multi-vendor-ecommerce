"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerCustomer, type FormState } from "@/lib/auth-actions";
import { PasswordField, SubmitButton, TextField } from "./AuthFields";

export function CustomerRegisterForm() {
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    registerCustomer,
    undefined,
  );
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col" noValidate>
      <div className="mb-5">
        <TextField
          label="Name"
          name="name"
          placeholder="Your full name"
          autoComplete="name"
          error={state?.fieldErrors?.name}
        />
      </div>
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
      <div className="mb-[22px]">
        <PasswordField
          label="Password"
          name="password"
          placeholder="Minimum 8 characters long"
          autoComplete="new-password"
          error={state?.fieldErrors?.password}
        />
      </div>

      <label className="mb-6 flex cursor-pointer items-start gap-[10px]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-[1px] h-[19px] w-[19px] flex-none rounded-[6px] border-[1.5px] border-iris-500 accent-iris-500"
        />
        <span className="font-sans text-[12.5px] leading-[1.5] text-muted">
          I agree to Covet&apos;s{" "}
          <span className="font-semibold text-iris-500">Terms</span> and{" "}
          <span className="font-semibold text-iris-500">Privacy Policy</span>.
        </span>
      </label>

      <SubmitButton pending={pending || !agreed}>
        {pending ? "Creating account…" : "Create account"}
      </SubmitButton>

      <p className="mt-7 text-center font-sans text-[13.5px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-iris-500 hover:text-iris-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
