import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

const categories = [
  "Women's Fashion",
  "Men's Fashion",
  "Phones & Gadgets",
  "Electronics",
  "Health & Beauty",
  "Home & Kitchen",
];

export function StoreHeader({ name }: { name: string }) {
  const firstName = name.split(" ")[0] || "there";
  return (
    <>
      {/* utility bar */}
      <div className="bg-ink text-[#c9c7d1]">
        <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-between px-6 font-sans text-[12.5px] lg:px-10">
          <div className="flex items-center gap-2">
            <Icon name="truck" size={14} strokeWidth={2} className="text-iris-400" />
            <span>
              Free delivery on orders over <span className="font-semibold text-white">$50</span>
            </span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            {["Home", "All Sellers", "Sell on Covet", "Help Center"].map((l) => (
              <Link key={l} href="/" className="text-[#c9c7d1] hover:text-white">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-line-soft bg-surface">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center gap-7 px-6 lg:px-10">
          <Link href="/" className="flex-none font-display text-[27px] font-extrabold tracking-[-0.02em] text-ink">
            Covet<span className="text-iris-500">.</span>
          </Link>
          <div className="hidden h-12 flex-1 items-center rounded-lg border border-line bg-field md:flex">
            <div className="flex h-full items-center gap-1.5 border-r border-[#e6e4ec] px-4 font-sans text-[13px] font-medium text-ink-soft">
              All Categories
              <Icon name="chevronDown" size={15} strokeWidth={2} className="text-muted" />
            </div>
            <input
              placeholder="Search for items…"
              className="min-w-0 flex-1 border-none bg-transparent px-4 font-sans text-[14px] text-ink outline-none"
            />
            <button
              aria-label="Search"
              className="flex h-full items-center justify-center rounded-r-lg bg-iris-500 px-5 text-white transition-colors hover:bg-iris-600"
            >
              <Icon name="search" size={19} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-none items-center gap-2">
            <button className="flex flex-col items-center gap-0.5 rounded-md px-2.5 py-1.5 text-ink-soft transition-colors hover:bg-field">
              <Icon name="heartLine" size={21} strokeWidth={2} />
              <span className="font-sans text-[11px] font-medium text-muted">Wishlist</span>
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-field"
            >
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
                <Icon name="user" size={20} strokeWidth={2} />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block font-sans text-[11px] text-muted">Hello, {firstName}</span>
                <span className="flex items-center gap-1 font-display text-[13px] font-semibold text-ink">
                  Dashboard
                  <Icon name="chevronDown" size={14} strokeWidth={2} className="text-muted" />
                </span>
              </span>
            </Link>
            <button className="ml-1.5 flex items-center gap-3 rounded-lg border border-iris-100 bg-iris-50 py-2 pl-3 pr-3.5 transition-colors hover:bg-iris-100">
              <span className="relative text-iris-500">
                <Icon name="cart" size={23} strokeWidth={2} />
                <span className="absolute -right-2 -top-[7px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-iris-500 px-1 font-sans text-[10px] font-semibold text-white">
                  1
                </span>
              </span>
              <span className="hidden text-left sm:block">
                <span className="block font-sans text-[11px] text-muted">My cart</span>
                <span className="font-display text-[14px] font-bold text-ink">$249.00</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* mega nav */}
      <nav className="border-b border-line-soft bg-surface">
        <div className="mx-auto flex h-[54px] max-w-[1600px] items-center gap-2 px-6 lg:px-10">
          <button className="flex h-[38px] items-center gap-2.5 rounded-md bg-ink px-4.5 font-sans text-[13.5px] font-semibold text-white">
            <Icon name="dash" size={17} strokeWidth={2} />
            All Categories
            <Icon name="chevronDown" size={15} strokeWidth={2} />
          </button>
          <div className="hidden items-center gap-1 lg:flex">
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c}
                href="/"
                className="flex h-[38px] items-center rounded-md px-3.5 font-sans text-[13.5px] font-medium text-ink-soft hover:text-iris-500"
              >
                {c}
              </Link>
            ))}
          </div>
          <div className="ml-auto hidden items-center gap-2 font-sans text-[13px] font-medium text-success md:flex">
            <Icon name="box" size={16} strokeWidth={2} />
            Sell on Covet — open a store free
          </div>
        </div>
      </nav>
    </>
  );
}

export function StoreFooter() {
  const cols = [
    { title: "Quick Links", items: ["Profile Info", "Wish List", "Featured Products", "Best Selling", "Track Order"] },
    { title: "Other", items: ["About Us", "Terms & Conditions", "Privacy Policy", "Refund Policy", "Return Policy"] },
  ];
  return (
    <footer className="mt-14 bg-ink text-[#b3b0bd]">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:px-10">
        <div>
          <div className="mb-4 font-display text-[26px] font-extrabold tracking-[-0.02em] text-white">
            Covet<span className="text-iris-400">.</span>
          </div>
          <p className="m-0 max-w-[280px] font-sans text-[13.5px] leading-[1.6] text-[#8b8895]">
            A curated multi-vendor marketplace bringing independent sellers and beloved brands under one
            trusted checkout.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <div className="mb-4.5 font-display text-[14px] font-semibold text-white">{col.title}</div>
            <div className="flex flex-col gap-3 font-sans text-[13.5px]">
              {col.items.map((it) => (
                <Link key={it} href="/" className="text-[#8b8895] hover:text-white">
                  {it}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="mb-4.5 font-display text-[14px] font-semibold text-white">Newsletter</div>
          <p className="m-0 mb-3.5 font-sans text-[13px] leading-[1.5] text-[#8b8895]">
            Subscribe to get the latest updates and members-only deals.
          </p>
          <div className="flex h-[46px] overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <input
              placeholder="Your email address"
              className="min-w-0 flex-1 border-none bg-transparent px-3.5 font-sans text-[13.5px] text-white outline-none"
            />
            <button className="bg-iris-500 px-4.5 font-sans text-[13px] font-semibold text-white transition-colors hover:bg-iris-600">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-7 lg:px-10">
        <div className="flex items-center gap-2 font-sans text-[13px] text-[#8b8895]">
          <Icon name="pin" size={15} strokeWidth={2} className="text-iris-400" />
          Kingston, New York 12401, United States
        </div>
        <div className="font-sans text-[12.5px] text-[#6c6976]">
          © 2026 Covet Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
