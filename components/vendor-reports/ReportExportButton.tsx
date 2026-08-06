"use client";

import { Icon } from "@/components/dashboard/Icon";

/**
 * Client-side CSV export of the currently-shown report rows. No server round-trip
 * and no new data — it serializes exactly the rows already rendered.
 */
export function ReportExportButton({
  filename,
  headers,
  rows,
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  function download() {
    const esc = (v: string | number) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={rows.length === 0}
      className="flex h-11 items-center gap-2 rounded-[11px] border border-line bg-surface px-4 font-sans text-[13px] font-semibold text-ink-soft transition-colors hover:bg-field disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name="download" size={16} strokeWidth={2} />
      Export
    </button>
  );
}
