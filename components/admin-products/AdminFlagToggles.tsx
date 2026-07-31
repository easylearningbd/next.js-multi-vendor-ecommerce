"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { setProductFeatured, setProductPopular } from "@/app/(admin)/admin/products/actions";
import { Icon } from "@/components/dashboard/Icon";

function Toggle({
  label,
  hint,
  icon,
  initial,
  onSet,
}: {
  label: string;
  hint: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  initial: boolean;
  onSet: (v: boolean) => Promise<{ success: boolean; error?: string; on?: boolean }>;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (pending) return;
    const next = !on;
    setOn(next); // optimistic
    startTransition(async () => {
      const res = await onSet(next);
      if (!res.success) {
        setOn(!next);
        toast.error(res.error ?? "Couldn't update.");
      } else {
        setOn(res.on ?? next);
        toast.success(`${label} ${res.on ?? next ? "on" : "off"}.`);
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line-soft bg-bg-subtle p-3.5">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${on ? "bg-iris-50 text-iris-500" : "bg-field text-muted-soft"}`}>
          <Icon name={icon} size={17} strokeWidth={1.9} />
        </span>
        <div>
          <div className="font-sans text-[13px] font-semibold text-ink">{label}</div>
          <div className="font-sans text-[11.5px] text-muted">{hint}</div>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={toggle}
        disabled={pending}
        className={`relative inline-flex h-[24px] w-[44px] flex-none items-center rounded-full transition-colors disabled:opacity-60 ${on ? "bg-iris-500" : "bg-line"}`}
      >
        <span className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[23px]" : "translate-x-[3px]"}`} />
      </button>
    </div>
  );
}

export function AdminFlagToggles({ id, isFeatured, isPopular }: { id: string; isFeatured: boolean; isPopular: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <Toggle
        label="Mark as Featured"
        hint="Highlight this product on the storefront"
        icon="star"
        initial={isFeatured}
        onSet={async (v) => {
          const r = await setProductFeatured(id, v);
          return { success: r.success, error: r.error, on: r.data?.isFeatured };
        }}
      />
      <Toggle
        label="Mark as Popular"
        hint="Show this product in popular collections"
        icon="trendUp"
        initial={isPopular}
        onSet={async (v) => {
          const r = await setProductPopular(id, v);
          return { success: r.success, error: r.error, on: r.data?.isPopular };
        }}
      />
    </div>
  );
}
