import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import type { CategoryNode } from "@/lib/shop/queries";
import { SearchBar } from "@/components/shop/SearchBar";
import { CategoryMegaMenu } from "@/components/shop/CategoryMegaMenu";
import { HeaderCart } from "@/components/shop/HeaderCart";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Brands", href: "/brands" },
  { label: "Offers", href: "/offers" },
  { label: "All Sellers", href: "/sellers" },
  { label: "Gift Cards", href: "/gift-cards" },
];

const UTILITY_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/categories" },
  { label: "Sell on Covet", href: "/vendor" },
  { label: "Help Center", href: "/help" },
];

export function StorefrontHeader({
  categories,
}: {
  categories: CategoryNode[];
}) {
  return (
    <>
      {/* ===================== UTILITY BAR ===================== */}
      <div className="bg-ink text-white/75">
        <div className="mx-auto flex h-9 max-w-[var(--container-max)] items-center justify-between px-[var(--cpad)] font-sans text-[12.5px]">
          <div className="flex items-center gap-2">
            <Icon name="truck" size={14} strokeWidth={2} className="text-iris-400" />
            <span>
              Free delivery on orders over{" "}
              <span className="font-semibold text-white">$50</span>
            </span>
          </div>
          <nav className="hidden items-center gap-[26px] sm:flex">
            {UTILITY_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-white/75 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ===================== HEADER ===================== */}
      <header className="sticky top-0 z-40 border-b border-line-soft bg-surface">
        <div className="mx-auto flex h-20 max-w-[var(--container-max)] items-center gap-7 px-[var(--cpad)]">
          <Link
            href="/"
            className="flex-none font-display text-[27px] font-extrabold tracking-[-0.02em] text-ink"
          >
            Covet<span className="text-iris-500">.</span>
          </Link>

          <SearchBar />

          <div className="flex flex-none items-center gap-2">
            <Link
              href="/wishlist"
              className="relative flex flex-col items-center gap-[3px] rounded-[10px] px-2.5 py-1.5 text-ink-soft transition-colors hover:bg-field"
            >
              <Icon name="heartLine" size={21} strokeWidth={2} />
              <span className="font-sans text-[11px] text-muted">Wishlist</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-[3px] rounded-[10px] px-2.5 py-1.5 text-ink-soft transition-colors hover:bg-field"
            >
              <Icon name="user" size={21} strokeWidth={2} />
              <span className="font-sans text-[11px] text-muted">Account</span>
            </Link>
            <HeaderCart />
          </div>
        </div>
      </header>

      {/* ===================== NAV BAR ===================== */}
      <nav className="border-b border-line-soft bg-surface">
        <div className="mx-auto flex h-[54px] max-w-[var(--container-max)] items-center gap-2 px-[var(--cpad)]">
          <div className="mr-3.5">
            <CategoryMegaMenu categories={categories} />
          </div>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex h-[38px] items-center rounded-lg px-3.5 font-sans text-[13.5px] font-medium text-ink-soft transition-colors hover:text-iris-500"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/vendor"
            className="ml-auto flex items-center gap-2 font-sans text-[13px] font-medium text-success transition-opacity hover:opacity-80"
          >
            <Icon name="layers" size={16} strokeWidth={2} />
            Sell on Covet — open a store free
          </Link>
        </div>
      </nav>
    </>
  );
}
