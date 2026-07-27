"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { toggleProductActive } from "@/app/(seller)/vendor/(dashboard)/products/actions";

// Inline vendor show/hide switch. Optimistic flip; reverts + toasts on failure.
export function ProductActiveToggle({
  id,
  initial,
  name,
}: {
  id: string;
  initial: boolean;
  name: string;
}) {
  const [active, setActive] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onToggle() {
    if (pending) return;
    const next = !active;
    setActive(next); // optimistic
    startTransition(async () => {
      const res = await toggleProductActive(id);
      if (!res.success) {
        setActive(!next); // revert
        toast.error(res.error ?? "Couldn't update the product.");
      } else {
        setActive(res.data!.isActive);
        toast.success(res.data!.isActive ? `"${name}" is now visible` : `"${name}" is hidden`);
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Deactivate product" : "Activate product"}
      onClick={onToggle}
      disabled={pending}
      className={`relative inline-flex h-[24px] w-[44px] flex-none items-center rounded-full transition-colors disabled:opacity-60 ${
        active ? "bg-iris-500" : "bg-line"
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform ${
          active ? "translate-x-[23px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
