import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StateProvider, StateTabs, StateView } from "@/components/dashboard/PreviewPanel";
import { VendorProfileForm } from "@/components/dashboard/VendorProfileForm";
import { Icon } from "@/components/dashboard/Icon";

export const metadata: Metadata = { title: "Profile Information — Covet Seller" };

export default async function VendorProfilePage() {
  const session = await auth();
  const user = session!.user;
  // `phone` isn't carried on the session token — read it from the DB.
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true },
  });
  const fullName = record?.name ?? user.name ?? "";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  const loading = (
    <div className="rounded-[18px] border border-line-soft bg-surface p-[28px_30px] shadow-xs">
      <div className="mb-6 h-40 animate-pulse rounded-2xl bg-line-soft" />
      <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="mb-2.5 h-3.5 w-2/5 animate-pulse rounded bg-line-soft" />
            <div className="h-[50px] animate-pulse rounded-xl bg-line-soft" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <StateProvider>
      {/* Page header */}
      <div className="mb-[22px] flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-iris-50 text-iris-500">
            <Icon name="user" size={20} strokeWidth={1.9} />
          </span>
          <h1 className="m-0 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
            Profile Information
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden font-sans text-[12px] text-muted-soft sm:inline">Preview state</span>
          <StateTabs trackClass="bg-[#EDECF1]" />
          <Link
            href="/vendor/dashboard"
            className="flex h-11 items-center gap-2 rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
          >
            <Icon name="home" size={17} strokeWidth={2} />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Sub-tabs: Basic Information (active) / Password */}
      <div className="mb-[22px] flex items-center gap-3">
        <span className="flex h-[46px] items-center gap-2.5 rounded-xl bg-iris-500 px-[22px] font-sans text-[14px] font-semibold text-white">
          <Icon name="user" size={18} strokeWidth={2} />
          Basic Information
        </span>
        <span
          title="Coming soon"
          className="flex h-[46px] cursor-default items-center gap-2.5 rounded-xl px-[22px] font-sans text-[14px] font-medium text-muted"
        >
          <Icon name="lock" size={18} strokeWidth={2} />
          Password
        </span>
      </div>

      <StateView
        loading={loading}
        empty={{
          title: "Profile not available",
          text: "Your details couldn't be found. Refresh to load your profile.",
        }}
        error={{
          title: "Couldn't load your profile",
          text: "Something went wrong. Please try again.",
        }}
      >
        <VendorProfileForm
          firstName={firstName}
          lastName={lastName}
          email={record?.email ?? user.email ?? ""}
          phone={record?.phone ?? ""}
        />
      </StateView>
    </StateProvider>
  );
}
