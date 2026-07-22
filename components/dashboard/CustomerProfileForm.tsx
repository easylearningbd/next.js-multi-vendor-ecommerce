"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateProfile, type FormState } from "@/lib/auth-actions";
import { PasswordField, SubmitButton, TextField, labelClass } from "@/components/auth/AuthFields";
import { Icon } from "./Icon";

export function CustomerProfileForm({
  firstName,
  lastName,
  email,
  phone,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}) {
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    updateProfile,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state && !state.fieldErrors && !state.error) toast.success("Profile updated");
  }, [state]);

  return (
    <form action={formAction} noValidate>
      <div className="mb-8 flex flex-col items-center">
        <div className="relative">
          <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border border-iris-100 bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-400">
            <Icon name="user" size={56} strokeWidth={1.6} />
          </div>
          <span className="absolute bottom-1 right-1 flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-surface bg-iris-500 text-white">
            <Icon name="camera" size={16} strokeWidth={2} />
          </span>
        </div>
        <div className="mt-4 font-display text-[18px] font-bold text-ink">
          {[firstName, lastName].filter(Boolean).join(" ") || "Your profile"}
        </div>
      </div>

      <div className="mx-auto grid max-w-[840px] grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
        <TextField label="First Name" name="firstName" defaultValue={firstName} error={state?.fieldErrors?.firstName} />
        <TextField label="Last Name" name="lastName" defaultValue={lastName} error={state?.fieldErrors?.lastName} />
        <TextField label="Phone Number" name="phone" type="tel" defaultValue={phone} placeholder="Add a phone number" error={state?.fieldErrors?.phone} />
        <div>
          <label className={labelClass}>Email</label>
          <input
            value={email}
            disabled
            className="h-[50px] w-full cursor-not-allowed rounded-md border border-line bg-field px-[15px] font-sans text-[14px] text-muted outline-none"
          />
        </div>
        <PasswordField
          label="New Password"
          name="newPassword"
          placeholder="Minimum 8 characters long"
          autoComplete="new-password"
          error={state?.fieldErrors?.newPassword}
        />
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Re-enter new password"
          autoComplete="new-password"
          error={state?.fieldErrors?.confirmPassword}
        />
      </div>

      <div className="mx-auto mt-8 flex max-w-[840px] justify-end">
        <SubmitButton pending={pending} className="w-auto px-8">
          {pending ? "Updating…" : "Update Profile"}
        </SubmitButton>
      </div>
    </form>
  );
}
