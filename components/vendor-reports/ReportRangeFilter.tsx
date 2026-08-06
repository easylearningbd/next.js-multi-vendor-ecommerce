"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/dashboard/Icon";
import {
  DEFAULT_REPORT_PRESET,
  isReportPreset,
  REPORT_PRESETS,
} from "@/lib/vendor/report-presets";

/**
 * "Filter Data" card shared by every vendor report. The chosen preset is written
 * to the URL (?range=…) so the report is shareable and refresh-safe; other params
 * (e.g. table search) are preserved.
 */
export function ReportRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = params.get("range") ?? undefined;
  const [value, setValue] = useState<string>(
    isReportPreset(current) ? current : DEFAULT_REPORT_PRESET,
  );

  function apply() {
    const sp = new URLSearchParams(params.toString());
    if (isReportPreset(value) && value !== DEFAULT_REPORT_PRESET) sp.set("range", value);
    else sp.delete("range");
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="mb-[22px] rounded-[18px] border border-line-soft bg-surface p-6 shadow-xs">
      <div className="mb-4 font-display text-[15px] font-bold text-ink">Filter Data</div>
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="relative">
          <select
            aria-label="Date range"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-12 w-[280px] max-w-full appearance-none rounded-[11px] border border-line bg-field px-3.5 pr-10 font-sans text-[13.5px] text-ink outline-none focus:border-iris-500 focus:shadow-[0_0_0_3px_var(--color-iris-100)]"
          >
            {REPORT_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevronDown"
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
        <button
          type="button"
          onClick={apply}
          className="h-12 rounded-[11px] bg-iris-500 px-[30px] font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
        >
          Filter
        </button>
      </div>
    </div>
  );
}
