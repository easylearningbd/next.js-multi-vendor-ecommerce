"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { changeVendorPassword } from "@/app/(seller)/vendor/(dashboard)/change-password/actions";
import { changePasswordSchema } from "@/lib/change-password-validation";
import type { ActionResult } from "@/lib/vendor-types";
import { Icon } from "./Icon";

function firstErrors(flat: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) if (v?.[0]) out[k] = v[0];
  return out;
}

function PasswordInput({
  name,
  label,
  placeholder,
  autoComplete,
  hint,
  error,
}: {
  name: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  hint?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={name} className="mb-2.5 flex items-center gap-1.5 font-sans text-[13px] font-semibold text-ink-soft">
        {label} <span className="text-error">*</span>
      </label>
      <div
        className={`flex h-[50px] items-center overflow-hidden rounded-xl border bg-bg-subtle transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-iris-500 focus-within:bg-surface focus-within:shadow-[0_0_0_3px_var(--color-iris-100)] ${
          error ? "border-error" : "border-line"
        }`}
      >
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className="min-w-0 flex-1 border-none bg-transparent px-[15px] font-sans text-[14px] text-ink outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="flex h-full items-center px-3.5 text-muted-soft transition-colors hover:text-muted"
        >
          <Icon name={show ? "eyeOff" : "eye"} size={18} strokeWidth={2} />
        </button>
      </div>
      {error ? (
        <p className="mt-2.5 font-sans text-[12.5px] text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2.5 font-sans text-[12.5px] text-muted-soft">{hint}</p>
      ) : null}
    </div>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    changeVendorPassword,
    undefined,
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  // Client errors (instant mirror) take precedence; otherwise show server field errors.
  const errors = Object.keys(clientErrors).length ? clientErrors : state?.fieldErrors ?? {};

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Password changed successfully. Please log in again.");
      // The action already invalidated the session server-side; hard-redirect once the
      // toast is visible so the cleared cookie fully takes effect.
      const t = setTimeout(() => {
        window.location.href = "/vendor/login";
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
    <form onSubmit={onSubmit} noValidate>
      <div className="overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-line-soft px-[30px] py-[22px]">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-iris-50 text-iris-500">
            <Icon name="lock" size={17} strokeWidth={2} />
          </span>
          <span className="font-display text-[17px] font-bold text-ink">Change Password</span>
        </div>

        <div className="p-[30px]">
          <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
            <div className="sm:col-span-2">
              <PasswordInput
                name="oldPassword"
                label="Old Password"
                placeholder="Enter current password"
                autoComplete="current-password"
                error={errors.oldPassword}
              />
            </div>
            <PasswordInput
              name="newPassword"
              label="New Password"
              placeholder="Enter new password"
              autoComplete="new-password"
              hint="At least 8 characters."
              error={errors.newPassword}
            />
            <PasswordInput
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Enter confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-iris-500 px-[30px] font-display text-[14px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending && (
                <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {pending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
