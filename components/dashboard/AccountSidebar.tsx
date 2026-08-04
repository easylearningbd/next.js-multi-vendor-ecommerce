"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/auth-actions";
import { Icon, type IconName } from "./Icon";

// The account rail. Items that map to a built route are real links with a
// pathname-driven active state (iris-50 bg + iris text per DESIGN_SYSTEM §9);
// the rest are placeholders for features not yet built, shown for parity with
// the design but inert (no dead links, no fake counts).
type NavItem = { label: string; icon: IconName; href?: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Profile Info", icon: "user", href: "/dashboard" },
  { label: "Change Password", icon: "lock", href: "/dashboard/change-password" },
  { label: "My Orders", icon: "box", href: "/dashboard/orders" },
  { label: "Restock Requests", icon: "refresh" },
  { label: "Wish List", icon: "heartLine", href: "/dashboard/wishlist" },
  { label: "My Wallet", icon: "wallet" },
  { label: "My Loyalty Point", icon: "award" },
  { label: "Inbox", icon: "mail" },
  { label: "My Address", icon: "pin" },
  { label: "Support Ticket", icon: "life" },
  { label: "Refer & Earn", icon: "share" },
  { label: "Coupons", icon: "ticket" },
  { label: "Track Order", icon: "truck", href: "/dashboard/track-order" },
];

const ROW_BASE =
  "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-left font-sans text-[13.5px] transition-colors";

export function AccountSidebar({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image?: string | null;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside className="sticky top-[96px] rounded-2xl border border-line-soft bg-surface p-3.5 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      <div className="mb-2 flex items-center gap-3 border-b border-line-soft px-3 pb-4 pt-3">
        <span className="flex h-[46px] w-[46px] flex-none items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <Icon name="user" size={24} strokeWidth={1.9} />
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate font-display text-[15px] font-bold leading-[1.1] text-ink">
            {name}
          </div>
          <div className="mt-1.5 truncate font-sans text-[12px] text-muted-soft">{email}</div>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((n) => {
          const on = n.href ? isActive(n.href) : false;
          const rowClass = `${ROW_BASE} ${
            on
              ? "bg-iris-50 font-semibold text-iris-500"
              : "font-medium text-ink-soft hover:bg-field"
          }`;
          const inner = (
            <>
              <span
                className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-md ${
                  on ? "bg-iris-500 text-white" : "bg-field text-muted"
                }`}
              >
                <Icon name={n.icon} size={17} />
              </span>
              <span className="flex-1">{n.label}</span>
            </>
          );

          return n.href ? (
            <Link
              key={n.label}
              href={n.href}
              aria-current={on ? "page" : undefined}
              className={rowClass}
            >
              {inner}
            </Link>
          ) : (
            <span key={n.label} aria-disabled="true" className={`${rowClass} cursor-default`}>
              {inner}
            </span>
          );
        })}
      </div>

      <div className="mt-2.5 border-t border-line-soft pt-3.5">
        <form action={signOutAction.bind(null, "/login")}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 font-sans text-[13.5px] font-semibold text-error transition-colors hover:bg-error-bg"
          >
            <Icon name="logout" size={18} strokeWidth={2} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
