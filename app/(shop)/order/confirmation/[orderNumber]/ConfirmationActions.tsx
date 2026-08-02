"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/Icon";

/**
 * The order-number pill (with copy-to-clipboard) and the invoice download link.
 * The invoice is a standalone print-optimized page (`/invoice/[orderNumber]`);
 * opening it and using the browser's "Save as PDF" produces the PDF invoice.
 */
export function ConfirmationActions({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-[52px] w-full max-w-[360px] items-center justify-between gap-3 rounded-full border border-line py-0 pl-[18px] pr-2">
        <span className="font-sans text-sm font-semibold text-ink">
          Order&nbsp;{orderNumber}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex h-[38px] items-center gap-1.5 rounded-full bg-iris-500 px-5 font-sans text-[13px] font-semibold text-white transition-colors hover:bg-iris-600"
        >
          <Icon name={copied ? "check" : "copy"} size={14} strokeWidth={2.2} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <a
        href={`/invoice/${orderNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 font-sans text-sm font-semibold text-iris-500 transition-colors hover:text-iris-700"
      >
        <Icon name="download" size={17} strokeWidth={2} />
        Download invoice
      </a>
    </div>
  );
}
