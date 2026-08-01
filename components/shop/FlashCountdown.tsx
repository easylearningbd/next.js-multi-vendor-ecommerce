"use client";

import { Fragment, useEffect, useState } from "react";

type Remaining = { d: string; h: string; m: string; s: string };

const pad = (n: number) => String(n).padStart(2, "0");

function computeRemaining(target: number): Remaining {
  const totalSec = Math.max(0, Math.floor((target - Date.now()) / 1000));
  return {
    d: pad(Math.floor(totalSec / 86400)),
    h: pad(Math.floor((totalSec % 86400) / 3600)),
    m: pad(Math.floor((totalSec % 3600) / 60)),
    s: pad(totalSec % 60),
  };
}

/**
 * Live flash-deal countdown. Renders placeholders until mounted (so SSR and the
 * first client render agree — no hydration mismatch), then ticks each second.
 *
 * TODO(promotions): count down to the real flash-sale end time once a promotion
 * model exists. For now it targets local midnight and naturally resets daily.
 */
export function FlashCountdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const target = end.getTime();
    const tick = () => setRemaining(computeRemaining(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cells: { label: string; value: string | undefined; accent: boolean }[] = [
    { label: "Days", value: remaining?.d, accent: false },
    { label: "Hrs", value: remaining?.h, accent: false },
    { label: "Min", value: remaining?.m, accent: false },
    { label: "Sec", value: remaining?.s, accent: true },
  ];

  return (
    <div className="flex items-center gap-3.5">
      <span className="font-sans text-[13px] text-muted">Ends in</span>
      <div className="flex items-center gap-[7px]">
        {cells.map((c, i) => (
          <Fragment key={c.label}>
            {i > 0 && (
              <span className="mb-4 font-display text-[20px] font-bold text-iris-300">
                :
              </span>
            )}
            <div className="flex flex-col items-center gap-[5px]">
              <span
                className={`flex h-12 min-w-[48px] items-center justify-center rounded-xl font-display text-[20px] font-bold text-white ${
                  c.accent ? "bg-iris-500" : "bg-ink"
                }`}
              >
                {c.value ?? "––"}
              </span>
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-muted-soft">
                {c.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
