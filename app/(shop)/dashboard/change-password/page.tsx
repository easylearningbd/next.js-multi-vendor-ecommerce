import type { Metadata } from "next";
import { CustomerChangePasswordForm } from "@/components/dashboard/CustomerChangePasswordForm";

export const metadata: Metadata = { title: "Change Password" };

export default function ChangePasswordPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
          Change Password
        </h1>
        <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
      </div>

      <p className="mx-auto mb-7 max-w-[840px] font-sans text-sm text-muted">
        For your security, enter your current password to confirm it&apos;s you. You&apos;ll be
        signed out and asked to log in again with your new password.
      </p>

      <CustomerChangePasswordForm />
    </div>
  );
}
