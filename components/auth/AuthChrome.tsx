import Link from "next/link";

/** Slim top bar + header wordmark shared by the customer auth pages. */
export function AuthTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-surface">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center gap-7 px-8">
        <Link
          href="/"
          className="flex-none font-display text-[27px] font-extrabold tracking-[-0.02em] text-ink"
        >
          Covet<span className="text-iris-500">.</span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="flex h-[38px] items-center rounded-lg px-3.5 font-sans text-[13.5px] font-medium text-ink-soft hover:text-iris-500"
          >
            Home
          </Link>
          <Link
            href="/vendor/register"
            className="flex h-[38px] items-center rounded-lg px-3.5 font-sans text-[13.5px] font-medium text-ink-soft hover:text-iris-500"
          >
            Sell on Covet
          </Link>
        </nav>
        <Link
          href="/vendor/login"
          className="ml-auto flex h-11 items-center gap-2 rounded-md bg-iris-500 px-[22px] font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
        >
          Vendor Login
        </Link>
      </div>
    </header>
  );
}

export function AuthFooter() {
  return (
    <footer className="mt-14 bg-ink text-[#b3b0bd]">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-8 py-8 sm:flex-row">
        <div className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-white">
          Covet<span className="text-iris-400">.</span>
        </div>
        <div className="font-sans text-[12.5px] text-[#6c6976]">
          © 2026 Covet Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
