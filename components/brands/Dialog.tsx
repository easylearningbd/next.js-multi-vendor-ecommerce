"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/dashboard/Icon";

/** Modal shell matching design system §8 (surface panel, --shadow-xl, blurred backdrop). */
export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-[520px]",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[rgba(20,18,31,0.55)] p-4 py-[6vh] backdrop-blur-[3px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${maxWidth} rounded-2xl border border-line-soft bg-surface shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft p-[22px_26px]">
          <div>
            <h2 className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
            {subtitle && <p className="mt-1.5 font-sans text-[13px] text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-muted transition-colors hover:bg-field hover:text-ink"
          >
            <Icon name="x" size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="p-[22px_26px_26px]">{children}</div>
      </div>
    </div>
  );
}
