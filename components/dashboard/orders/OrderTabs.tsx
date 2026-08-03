"use client";

import { useState, type ReactNode } from "react";

/**
 * Client tab switcher for the order details page. The panels are server-rendered
 * and passed in as nodes, so all the order data stays on the server — only the
 * active-tab selection is client state.
 */
export function OrderTabs({
  tabs,
  panels,
}: {
  tabs: { key: string; label: string }[];
  panels: Record<string, ReactNode>;
}) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-line-soft">
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`whitespace-nowrap border-b-2 px-4 pb-3.5 pt-3 font-sans text-sm transition-colors ${
                on
                  ? "border-iris-500 font-semibold text-iris-500"
                  : "border-transparent font-medium text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div>{panels[active]}</div>
    </div>
  );
}
