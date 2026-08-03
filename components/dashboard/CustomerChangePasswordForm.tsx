"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { changeCustomerPassword } from "@/app/(shop)/dashboard/change-password/actions";
import { changePasswordSchema } from "@/lib/change-password-validation";
import type { ActionResult } from "@/lib/vendor-types";
import { PasswordField, SubmitButton } from "@/components/auth/AuthFields";

function firstErrors(flat: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

/**
 * Customer change-password form. Reuses the shared `changePasswordSchema` for
 * instant client-side mirroring; the server action is the source of truth
 * (verifies the old password with bcrypt). On success the action has already
 * invalidated the session server-side, so we hard-redirect to /login once the
 * toast is visible.
 */
export function CustomerChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    changeCustomerPassword,
    undefined,
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  // Client errors (instant mirror) take precedence; otherwise show server field errors.
  const errors = Object.keys(clientErrors).length ? clientErrors : state?.fieldErrors ?? {};

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Password changed successfully. Please log in again.");
      const t = setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
      return () => clearTimeout(t);
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Mirror the server rules client-side for instant feedback.
    const parsed = changePasswordSchema.safeParse({
      oldPassword: String(fd.get("oldPassword") ?? ""),
      newPassword: String(fd.get("newPassword") ?? ""),
      confirmPassword: String(fd.get("confirmPassword") ?? ""),
    });
    if (!parsed.success) {
      const fe = firstErrors(parsed.error.flatten().fieldErrors);
      setClientErrors(fe);
      toast.error(Object.values(fe)[0] ?? "Please fix the errors below.");
      return;
    }
    setClientErrors({});
    // useActionState's dispatch must run inside a transition (keeps `pending` correct).
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-[840px]">
      <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
        <div className="sm:col-span-2">
          <PasswordField
            label="Old Password"
            name="oldPassword"
            placeholder="Enter current password"
            autoComplete="current-password"
            required
            error={errors.oldPassword}
          />
        </div>
        <PasswordField
          label="New Password"
          name="newPassword"
          placeholder="Minimum 8 characters long"
          autoComplete="new-password"
          required
          error={errors.newPassword}
        />
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Re-enter new password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <SubmitButton pending={pending} className="w-auto px-8">
          {pending ? "Saving…" : "Save Changes"}
        </SubmitButton>
      </div>
    </form>
  );
}
