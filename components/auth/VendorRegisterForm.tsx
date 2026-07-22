"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { registerVendor, type FormState } from "@/lib/auth-actions";
import { PasswordField, SubmitButton, TextField } from "./AuthFields";

export function VendorRegisterForm() {
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    registerVendor,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} noValidate>
      <div className="mb-[22px] font-display text-[19px] font-bold text-ink">
        Create An Account
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <TextField
          label="Store Name"
          name="storeName"
          placeholder="Ex: Hanover Electronics"
          autoComplete="organization"
          required
          error={state?.fieldErrors?.storeName}
        />
        <TextField
          label="Your Name"
          name="name"
          placeholder="Ex: Jane Doe"
          autoComplete="name"
          required
          error={state?.fieldErrors?.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="Ex: example@gmail.com"
          autoComplete="email"
          required
          error={state?.fieldErrors?.email}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          placeholder="Enter phone number"
          autoComplete="tel"
          error={state?.fieldErrors?.phone}
        />
        <PasswordField
          label="Password"
          name="password"
          placeholder="Minimum 8 characters long"
          autoComplete="new-password"
          required
          error={state?.fieldErrors?.password}
        />
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm password"
          autoComplete="new-password"
          required
          error={state?.fieldErrors?.confirmPassword}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton pending={pending} className="w-auto px-8">
          {pending ? "Creating store…" : "Create store"}
        </SubmitButton>
      </div>
    </form>
  );
}
