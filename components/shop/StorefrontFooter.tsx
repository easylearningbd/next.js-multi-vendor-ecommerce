import Link from "next/link";
import { Icon, type IconName } from "@/components/dashboard/Icon";

const QUICK_LINKS = [
  { label: "Profile Info", href: "/dashboard" },
  { label: "Featured Products", href: "/featured" },
  { label: "Best Selling", href: "/best-selling" },
  { label: "Latest Products", href: "/latest" },
  { label: "Track Order", href: "/dashboard/orders" },
];

const OTHER_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Return Policy", href: "/return-policy" },
];

const SOCIALS: { label: string; href: string; icon: IconName }[] = [
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "X", href: "#", icon: "xTwitter" },
];

export function StorefrontFooter() {
  return (
    <footer className="mt-14 bg-ink text-white/70">
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 gap-10 px-[var(--cpad)] pt-15 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
        {/* Brand + socials */}
        <div>
          <div className="mb-4 font-display text-[26px] font-extrabold tracking-[-0.02em] text-white">
            Covet<span className="text-iris-400">.</span>
          </div>
          <p className="mb-5 max-w-[280px] font-sans text-[13.5px] leading-relaxed text-white/55">
            A curated multi-vendor marketplace bringing independent sellers and
            beloved brands under one trusted checkout.
          </p>
          <div className="flex gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex size-[38px] items-center justify-center rounded-[10px] bg-white/[0.06] text-white/70 transition-colors hover:bg-iris-500 hover:text-white"
              >
                <Icon name={s.icon} size={17} strokeWidth={2} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="mb-[18px] font-display text-sm font-semibold text-white">
            Quick Links
          </div>
          <div className="flex flex-col gap-3 font-sans text-[13.5px]">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-white/55 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Other */}
        <div>
          <div className="mb-[18px] font-display text-sm font-semibold text-white">
            Other
          </div>
          <div className="flex flex-col gap-3 font-sans text-[13.5px]">
            {OTHER_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-white/55 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <div className="mb-[18px] font-display text-sm font-semibold text-white">
            Newsletter
          </div>
          <p className="mb-3.5 font-sans text-[13px] leading-relaxed text-white/55">
            Subscribe to get the latest updates and members-only deals.
          </p>
          <form className="flex h-[46px] overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.06]">
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Your email address"
              className="min-w-0 flex-1 bg-transparent px-3.5 font-sans text-[13.5px] text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="bg-iris-500 px-[18px] font-sans text-[13px] font-semibold text-white transition-colors hover:bg-iris-600"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-11 flex max-w-[var(--container-max)] flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] px-[var(--cpad)] pb-[34px] pt-7">
        <div className="flex items-center gap-2 font-sans text-[13px] text-white/55">
          <Icon name="pin" size={15} strokeWidth={2} className="text-iris-400" />
          Kingston, New York 12401, United States
        </div>
        <div className="font-sans text-[12.5px] text-white/45">
          © 2026 Covet Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
