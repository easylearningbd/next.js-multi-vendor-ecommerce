import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export const metadata: Metadata = { title: "Admin Sign in — Covet" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dash px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-iris-500 text-white shadow-sm">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <div className="font-display text-[27px] font-extrabold tracking-[-0.02em] text-ink">
            Covet<span className="text-iris-500">.</span>
          </div>
          <p className="mt-1 font-sans text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-soft">
            Admin Console
          </p>
        </div>

        <div className="rounded-2xl border border-line-soft bg-surface p-8 shadow-xs sm:p-[40px_42px]">
          <h1 className="font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">
            Sign in
          </h1>
          <p className="mb-7 mt-2.5 font-sans text-[14px] leading-[1.5] text-muted">
            Restricted access. Administrator credentials required.
          </p>
          <AdminLoginForm />
        </div>

        <p className="mt-6 text-center font-sans text-[12.5px] text-muted-soft">
          Not an administrator?{" "}
          <a href="/login" className="font-semibold text-iris-500 hover:text-iris-600">
            Customer sign in
          </a>
        </p>
      </div>
    </div>
  );
}
