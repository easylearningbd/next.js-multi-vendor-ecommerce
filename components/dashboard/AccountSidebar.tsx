"use client";

import { useState } from "react";
import { signOutAction } from "@/lib/auth-actions";
import { Icon, type IconName } from "./Icon";

const navDefs: { k: string; label: string; icon: IconName; badge?: string }[] = [
  { k: "profile", label: "Profile Info", icon: "user" },
  { k: "orders", label: "My Orders", icon: "box", badge: "8" },
  { k: "restock", label: "Restock Requests", icon: "refresh" },
  { k: "wishlist", label: "Wish List", icon: "heartLine", badge: "5" },
  { k: "wallet", label: "My Wallet", icon: "wallet" },
  { k: "loyalty", label: "My Loyalty Point", icon: "award" },
  { k: "inbox", label: "Inbox", icon: "mail", badge: "3" },
  { k: "address", label: "My Address", icon: "pin" },
  { k: "support", label: "Support Ticket", icon: "life" },
  { k: "refer", label: "Refer & Earn", icon: "share" },
  { k: "coupons", label: "Coupons", icon: "ticket" },
  { k: "track", label: "Track Order", icon: "truck" },
];

export function AccountSidebar({ name, email }: { name: string; email: string }) {
  const [active, setActive] = useState("profile");

  return (
    <aside className="sticky top-[96px] rounded-2xl border border-line-soft bg-surface p-3.5 shadow-xs">
      <div className="mb-2 flex items-center gap-3 border-b border-line-soft px-3 pb-4 pt-3">
        <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
          <Icon name="user" size={24} strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="font-display text-[15px] font-bold leading-[1.1] text-ink">{name}</div>
          <div className="mt-1.5 truncate font-sans text-[12px] text-muted-soft">{email}</div>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {navDefs.map((n) => {
          const on = active === n.k;
          return (
            <button
              key={n.k}
              type="button"
              onClick={() => setActive(n.k)}
              className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-left font-sans text-[13.5px] transition-colors ${
                on ? "bg-iris-50 font-semibold text-iris-500" : "font-medium text-ink-soft hover:bg-field"
              }`}
            >
              <span
                className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-md ${
                  on ? "bg-iris-500 text-white" : "bg-[#f3f2f6] text-[#6e6a7c]"
                }`}
              >
                <Icon name={n.icon} size={17} />
              </span>
              <span className="flex-1">{n.label}</span>
              {n.badge && (
                <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-iris-100 px-1.5 font-sans text-[11px] font-semibold text-accent-fg">
                  {n.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 border-t border-line-soft pt-3.5">
        <form action={signOutAction.bind(null, "/login")}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 font-sans text-[13.5px] font-semibold text-danger transition-colors hover:bg-error-bg"
          >
            <Icon name="logout" size={18} strokeWidth={2} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
