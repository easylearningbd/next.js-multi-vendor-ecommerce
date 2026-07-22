import type { Metadata } from "next";
import Link from "next/link";
import { VendorLoginForm } from "@/components/auth/VendorLoginForm";

export const metadata: Metadata = { title: "Vendor Login — Covet" };

export default function VendorLoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* LEFT — brand panel */}
      <div className="relative hidden flex-1 flex-col justify-center overflow-hidden bg-bg-dash px-[7%] py-16 lg:flex">
        <div className="mb-[60px] flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-iris-500 text-white">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </span>
          <span className="font-display text-[30px] font-extrabold tracking-[-0.02em] text-ink">
            Covet<span className="text-iris-500">.</span>
          </span>
        </div>
        <h1 className="m-0 max-w-[560px] font-display text-[56px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
          Make Your Business <span className="text-iris-500">Profitable...</span>
        </h1>
        <p className="mb-10 mt-[26px] max-w-[440px] font-sans text-[16px] leading-[1.6] text-muted">
          Reach thousands of shoppers across the Covet marketplace. Set up your store, list
          products, and grow — all from one seller dashboard.
        </p>
        <div className="flex aspect-[16/9] w-full max-w-[520px] items-center justify-center rounded-xl border border-dashed border-[#c9c6d3] bg-[#eae8f0]">
          <span className="px-6 text-center font-mono text-[12px] leading-[1.4] text-muted-soft">
            seller lifestyle image
          </span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex flex-1 items-center justify-center px-[7%] py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
              Covet<span className="text-iris-500">.</span>
            </span>
          </div>
          <h2 className="m-0 font-display text-[30px] font-extrabold tracking-[-0.01em] text-ink">
            Sign in
          </h2>
          <div className="mb-9 mt-4 font-sans text-[15px] font-semibold text-ink">
            Welcome back to Vendor Login
          </div>
          <VendorLoginForm />
          <p className="mt-6 font-sans text-[13px] text-muted">
            New to Covet?{" "}
            <Link
              href="/vendor/register"
              className="font-semibold text-iris-500 hover:text-iris-600"
            >
              Create your store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
