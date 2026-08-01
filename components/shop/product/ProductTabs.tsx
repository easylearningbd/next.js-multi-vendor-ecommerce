"use client";

import { useState } from "react";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "reviews", label: "Reviews" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/**
 * Overview / Reviews segmented tabs. Content is passed as slots so the server
 * renders the real overview + reviews and this client shell only toggles them.
 */
export function ProductTabs({
  overview,
  reviews,
}: {
  overview: React.ReactNode;
  reviews: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div className="rounded-[20px] border border-line-soft bg-surface p-7 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      <div className="mx-auto mb-[26px] flex w-max gap-1.5 rounded-xl bg-line-soft p-[5px]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`h-9 rounded-lg px-6 font-sans text-[13.5px] font-semibold transition-colors ${
              tab === t.key
                ? "bg-surface text-iris-500 shadow-[0_1px_2px_rgba(20,18,31,0.08)]"
                : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? overview : reviews}
    </div>
  );
}
