"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/auth-actions";
import { Icon, type IconName } from "./Icon";
import { vendorNav, type SellerNavSection } from "./navConfig";

const RAIL: IconName[] = ["home", "box", "bag", "send", "speaker", "chart", "users", "sliders"];

export type Crumb = { label: string; href?: string };

export function SellerShell({
  variant,
  userName,
  userEmail,
  signOutTo,
  setupPercent,
  showSearch = false,
  notifCount,
  breadcrumb = [{ label: "Home", href: "/" }, { label: "Dashboard" }],
  nav = vendorNav,
  children,
}: {
  variant: "vendor" | "admin";
  userName: string;
  userEmail: string;
  signOutTo: string;
  setupPercent: number;
  showSearch?: boolean;
  notifCount: number;
  breadcrumb?: Crumb[];
  nav?: SellerNavSection[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="flex min-h-screen bg-bg-dash">
      {/* ICON RAIL */}
      {open && (
        <div className="sticky top-0 flex h-screen w-16 flex-none flex-col items-center gap-2 bg-ink py-4">
          <div className="mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-md bg-iris-500 text-white">
            <Icon name="cart" size={20} strokeWidth={2} />
          </div>
          {RAIL.map((name, i) => (
            <button
              key={name}
              type="button"
              aria-label={name}
              className={`flex h-10 w-10 items-center justify-center rounded-md transition-all ${
                i === 0 ? "bg-iris-500 text-white" : "text-[#8b8895] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon name={name} size={20} />
            </button>
          ))}
        </div>
      )}

      {/* SIDEBAR */}
      {open && (
        <aside className="sticky top-0 h-screen w-[236px] flex-none overflow-y-auto border-r border-line bg-surface p-[20px_16px]">
          <div className="mb-4 flex items-center gap-2.5 border-b border-line-soft px-2 pb-5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-md bg-iris-50 text-iris-500">
              <Icon name="house" size={18} strokeWidth={2} />
            </span>
            <span className="font-display text-[16px] font-bold text-ink">Home</span>
          </div>
          {nav.map((section) => (
            <div key={section.label} className="mb-4 last:mb-0">
              <div className="mb-2.5 px-2 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-soft">
                {section.label}
              </div>
              <div className="flex flex-col gap-[3px]">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 font-sans text-[13.5px] transition-colors ${
                        active
                          ? "bg-iris-50 font-semibold text-iris-500"
                          : "font-medium text-ink-soft hover:bg-field"
                      }`}
                    >
                      <Icon name={item.icon} size={17} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-[22px] rounded-lg bg-[linear-gradient(135deg,var(--color-iris-500),var(--color-iris-700))] p-4 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-md bg-white/[0.16]">
                <Icon name="check" size={18} strokeWidth={2} />
              </span>
              <div>
                <div className="font-display text-[13px] font-semibold">Setup Guide</div>
                <div className="mt-1 font-sans text-[11px] text-white/75">{setupPercent}% Complete</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${setupPercent}%` }} />
            </div>
          </div>
        </aside>
      )}

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-surface px-[26px]">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle sidebar"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-field"
          >
            <Icon name={open ? "chevronLeft" : "menu"} size={15} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2 font-sans text-[13px] font-medium">
            {breadcrumb.map((c, i) => {
              const last = i === breadcrumb.length - 1;
              return (
                <span key={`${c.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 && (
                    <Icon name="chevronRight" size={14} strokeWidth={2} className="text-[#c6c4ce]" />
                  )}
                  {c.href && !last ? (
                    <Link href={c.href} className="text-iris-500 hover:text-iris-600">
                      {c.label}
                    </Link>
                  ) : (
                    <span className={last ? "text-muted" : "text-iris-500"}>{c.label}</span>
                  )}
                </span>
              );
            })}
          </div>

          {showSearch && (
            <div className="ml-3.5 hidden h-10 max-w-[420px] flex-1 items-center overflow-hidden rounded-md border border-line bg-field focus-within:border-iris-500 md:flex">
              <span className="px-3 text-muted-soft">
                <Icon name="search" size={16} strokeWidth={2} />
              </span>
              <input
                placeholder="Search Menu..."
                className="min-w-0 flex-1 border-none bg-transparent px-1 font-sans text-[13px] text-ink outline-none"
              />
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {variant === "vendor" && (
              <button
                type="button"
                aria-label="Visit store"
                className="flex h-[38px] w-[38px] items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-field hover:text-iris-500"
              >
                <Icon name="globe" size={18} />
              </button>
            )}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-[38px] w-[38px] items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-field hover:text-iris-500"
            >
              <Icon name="bell" size={18} />
              <span className="absolute -right-[5px] -top-[5px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-1 font-sans text-[10px] font-semibold text-white">
                {notifCount}
              </span>
            </button>
            <button
              type="button"
              aria-label="Messages"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-field hover:text-iris-500"
            >
              <Icon name="message" size={18} />
            </button>
            <button
              type="button"
              aria-label="Fullscreen"
              className="hidden h-[38px] w-[38px] items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:bg-field hover:text-iris-500 sm:flex"
            >
              <Icon name="maximize" size={17} strokeWidth={2} />
            </button>

            {/* profile */}
            <div className="relative ml-1.5" onMouseLeave={() => setProfileOpen(false)}>
              <button
                type="button"
                onClick={() => setProfileOpen((p) => !p)}
                className="flex h-11 items-center gap-2.5 rounded-full border border-line bg-surface py-0 pl-1.5 pr-2 transition-colors hover:bg-field"
              >
                <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
                  <Icon name="user" size={18} strokeWidth={2} />
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block font-display text-[13px] font-semibold text-ink">
                    {userName.split(" ")[0]}
                  </span>
                  <span className="mt-1 block font-sans text-[11px] text-muted-soft">
                    {variant === "admin" ? "Master Admin" : userEmail}
                  </span>
                </span>
                <Icon name="chevronDown" size={15} strokeWidth={2} className="text-muted" />
              </button>

              <div
                className={`absolute right-0 top-full z-[60] w-[236px] pt-2.5 transition ${
                  profileOpen
                    ? "visible translate-y-0 opacity-100"
                    : "pointer-events-none invisible -translate-y-1.5 opacity-0"
                }`}
              >
                <div className="rounded-lg border border-line-soft bg-surface p-1.5 shadow-lg">
                  <div className="mb-1.5 flex items-center gap-3 border-b border-line-soft px-3.5 py-3">
                    <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
                      <Icon name="user" size={19} strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-display text-[13.5px] font-bold text-ink">{userName}</div>
                      <div className="mt-1 truncate font-sans text-[11px] text-muted-soft">{userEmail}</div>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-md px-3.5 py-2.5 font-sans text-[13.5px] font-medium text-ink-soft hover:bg-iris-50 hover:text-iris-500"
                  >
                    <Icon name="user" size={17} />
                    Profile Setting
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-md px-3.5 py-2.5 font-sans text-[13.5px] font-medium text-ink-soft hover:bg-iris-50 hover:text-iris-500"
                  >
                    <Icon name={variant === "admin" ? "settings" : "lock"} size={17} />
                    {variant === "admin" ? "Settings" : "Change Password"}
                  </a>
                  <form action={signOutAction.bind(null, signOutTo)} className="mt-0.5 border-t border-line-soft pt-1.5">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 font-sans text-[13.5px] font-semibold text-danger hover:bg-error-bg"
                    >
                      <Icon name="logout" size={17} />
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="mx-auto w-full max-w-[1280px] p-[26px]">{children}</div>
      </div>
    </div>
  );
}
