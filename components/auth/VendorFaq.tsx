"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How do I register as a seller?",
    a: "Fill in the Create An Account form above with your store name, email and a password, then follow the guided onboarding steps to set up your store.",
  },
  {
    q: "How do I upload products?",
    a: "Once your store is approved, use Add New Product in your seller dashboard to add product details, images, pricing and inventory.",
  },
  {
    q: "What are the fees for selling?",
    a: "Covet charges a small per-order commission that varies by category. There are no listing or monthly subscription fees.",
  },
  {
    q: "How do I handle customer inquiries?",
    a: "Customer questions come through the Covet AI support agent and your seller inbox, so you can respond quickly from one place.",
  },
  {
    q: "When and how do I get paid?",
    a: "Completed order earnings accumulate in your Vendor Wallet and can be withdrawn to your connected Stripe account on your payout schedule.",
  },
];

export function VendorFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3 text-left">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="overflow-hidden rounded-lg border border-line-soft bg-surface">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-[18px_22px] text-left"
            >
              <span className="font-sans text-[14.5px] font-semibold leading-[1.3] text-ink">
                {f.q}
              </span>
              <span
                className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-md ${
                  isOpen ? "bg-iris-500 text-white" : "bg-[#f3f2f6] text-muted"
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  {!isOpen && <line x1="12" y1="5" x2="12" y2="19" />}
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="p-[0_22px_20px] font-sans text-[13.5px] leading-[1.6] text-muted">
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
