import type { Metadata } from "next";
import Link from "next/link";
import { VendorRegisterForm } from "@/components/auth/VendorRegisterForm";
import { VendorFaq } from "@/components/auth/VendorFaq";

export const metadata: Metadata = { title: "Vendor Registration — Covet" };

const perks = [
  {
    title: "Easy Onboarding",
    desc: "Start selling quickly with our user-friendly onboarding process designed to get you up and running fast.",
    icon: (
      <>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </>
    ),
  },
  {
    title: "24/7 Support",
    desc: "Get round-the-clock support from our dedicated team to resolve any issues and assist you anytime.",
    icon: (
      <>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </>
    ),
  },
  {
    title: "SEO Friendly",
    desc: "Enjoy enhanced search visibility with our SEO-friendly platform, driving more traffic to your listings.",
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  {
    title: "Free Marketing",
    desc: "Benefit from our extensive, no-cost marketing efforts to boost your visibility and sales.",
    icon: (
      <>
        <path d="m3 11 18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </>
    ),
  },
];

const steps = [
  {
    title: "Get Registered",
    desc: "Sign up easily and create your seller account in just a few minutes. It’s fast and simple to get started.",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </>
    ),
  },
  {
    title: "Upload Products",
    desc: "List your products with detailed descriptions and high-quality images to attract more buyers effortlessly.",
    icon: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </>
    ),
  },
  {
    title: "Start Selling",
    desc: "Go live and start reaching millions of potential buyers immediately. Watch your sales grow.",
    icon: (
      <>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </>
    ),
  },
];

function Icon({ children, sw = 1.8 }: { children: React.ReactNode; sw?: number }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export default function VendorRegisterPage() {
  return (
    <div className="bg-bg">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-line-soft bg-surface">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-7 px-8">
          <Link
            href="/"
            className="flex-none font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink"
          >
            Covet<span className="text-iris-500">.</span>
          </Link>
          <nav className="ml-2 hidden items-center gap-1.5 md:flex">
            {["Home", "Brands", "Offers", "All Sellers", "Gift Cards"].map((l) => (
              <Link
                key={l}
                href="/"
                className="flex h-[38px] items-center rounded-lg px-3.5 font-sans text-[13.5px] font-medium text-ink-soft hover:text-iris-500"
              >
                {l}
              </Link>
            ))}
          </nav>
          <Link
            href="/vendor/login"
            className="ml-auto flex h-11 items-center gap-2 rounded-md bg-iris-500 px-[22px] font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
          >
            Vendor Login
          </Link>
        </div>
      </header>

      {/* HERO + FORM */}
      <section className="bg-brand-gradient-soft border-b border-line-soft">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-8 py-12 lg:grid-cols-[340px_1fr]">
          <div>
            <h1 className="m-0 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
              Vendor Registration
            </h1>
            <p className="mb-5 mt-3.5 font-sans text-[14px] leading-[1.5] text-muted">
              Create your own store. Already have a store?{" "}
              <Link href="/vendor/login" className="font-semibold text-iris-500 hover:text-iris-600">
                Login
              </Link>
            </p>
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-[#c9c6d3] bg-[#eae8f0]">
              <span className="font-mono text-[12px] text-muted-soft">seller illustration</span>
            </div>
          </div>
          <div className="rounded-xl border border-line-soft bg-surface p-[30px_32px] shadow-[0_12px_34px_-18px_rgba(20,18,31,0.2)]">
            <VendorRegisterForm />
          </div>
        </div>
      </section>

      {/* WHY SELL */}
      <section className="mx-auto max-w-[1240px] px-8 pt-16 text-center">
        <h2 className="m-0 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
          Why Sell With Us
        </h2>
        <p className="mb-10 mt-3.5 font-sans text-[15px] leading-[1.5] text-muted">
          Boost your sales! Join us for a seamless, profitable selling experience.
        </p>
        <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-line-soft bg-surface p-[26px_24px] shadow-xs transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-md"
            >
              <span className="mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-iris-50 text-iris-500">
                <Icon>{p.icon}</Icon>
              </span>
              <div className="font-display text-[16px] font-bold leading-[1.2] text-ink">
                {p.title}
              </div>
              <div className="mt-2.5 font-sans text-[13px] leading-[1.5] text-muted">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 STEPS */}
      <section className="bg-brand-gradient mt-16">
        <div className="mx-auto max-w-[1240px] px-8 py-14 text-center">
          <h2 className="m-0 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.01em] text-white">
            3 Easy Steps To Start Selling
          </h2>
          <p className="mx-auto mb-11 mt-3.5 max-w-[520px] font-sans text-[15px] leading-[1.5] text-white/75">
            Register, upload your products with detailed info and images, and reach millions of
            buyers instantly.
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="text-center">
                <span className="mx-auto mb-[18px] flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.12] text-white">
                  <Icon>{s.icon}</Icon>
                </span>
                <div className="font-display text-[18px] font-bold leading-[1.2] text-white">
                  {s.title}
                </div>
                <div className="mx-auto mt-2.5 max-w-[280px] font-sans text-[13px] leading-[1.6] text-white/70">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[900px] px-8 pt-16 text-center">
        <h2 className="m-0 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
          Frequently Asked Questions
        </h2>
        <p className="mb-9 mt-3.5 font-sans text-[15px] leading-[1.5] text-muted">
          Got questions about becoming a vendor? Explore our FAQ for answers to common queries
          about joining our platform.
        </p>
        <VendorFaq />
      </section>

      {/* FOOTER */}
      <footer className="mt-16 bg-ink text-[#b3b0bd]">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-8 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="mb-4 font-display text-[24px] font-extrabold tracking-[-0.02em] text-white">
              Covet<span className="text-iris-400">.</span>
            </div>
            <p className="m-0 max-w-[260px] font-sans text-[13px] leading-[1.6] text-[#8b8895]">
              A curated multi-vendor marketplace bringing independent sellers and beloved brands
              under one trusted checkout.
            </p>
          </div>
          <div>
            <div className="mb-4 font-display text-[14px] font-semibold text-white">Quick Links</div>
            <div className="flex flex-col gap-3 font-sans text-[13px]">
              {["Profile Info", "Featured Products", "Best Selling", "Track Order"].map((l) => (
                <Link key={l} href="/" className="text-[#8b8895] hover:text-white">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 font-display text-[14px] font-semibold text-white">Other</div>
            <div className="flex flex-col gap-3 font-sans text-[13px]">
              {["About Us", "Terms & Conditions", "Privacy Policy", "Return Policy"].map((l) => (
                <Link key={l} href="/" className="text-[#8b8895] hover:text-white">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.08] p-[22px_32px] text-center font-sans text-[12.5px] text-[#6c6976]">
          © 2026 Covet Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
