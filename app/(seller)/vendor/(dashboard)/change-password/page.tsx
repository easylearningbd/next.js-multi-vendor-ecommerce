import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";

export const metadata: Metadata = { title: "Change Password — Covet Seller" };

// Auth (VENDOR + APPROVED) is enforced by the (dashboard) layout; nothing to load here.
export default function VendorChangePasswordPage() {
  return (
    <div>
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-iris-50 text-iris-500">
            <Icon name="lock" size={20} strokeWidth={1.9} />
          </span>
          <h1 className="m-0 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
            Change Password
          </h1>
        </div>
        <Link
          href="/vendor/dashboard"
          className="flex h-11 items-center gap-2 rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="home" size={17} strokeWidth={2} />
          Dashboard
        </Link>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
