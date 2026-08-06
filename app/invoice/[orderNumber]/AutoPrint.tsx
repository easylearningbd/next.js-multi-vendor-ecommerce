"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/dashboard/Icon";

/**
 * Invoice action bar (hidden when printing). Auto-opens the browser print
 * dialog once on load so "Download invoice" flows straight into Save-as-PDF,
 * and offers a manual re-print plus a way back to the order.
 */
export function InvoiceActions({
  orderNumber,
  backHref,
  backLabel = "Back to order",
}: {
  orderNumber: string;
  /** Where the "Back" link points. Defaults to the customer's order confirmation. */
  backHref?: string;
  backLabel?: string;
}) {
  const printed = useRef(false);

  useEffect(() => {
    if (printed.current) return;
    printed.current = true;
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="no-print mx-auto mb-5 flex max-w-[820px] items-center justify-between px-6">
      <Link
        href={backHref ?? `/order/confirmation/${orderNumber}`}
        className="flex items-center gap-1.5 font-sans text-[13.5px] font-semibold text-iris-500 hover:text-iris-700"
      >
        <Icon name="chevronLeft" size={15} strokeWidth={2} />
        {backLabel}
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex h-11 items-center gap-2 rounded-xl bg-iris-500 px-5 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
      >
        <Icon name="download" size={16} strokeWidth={2} />
        Print / Save as PDF
      </button>
    </div>
  );
}
