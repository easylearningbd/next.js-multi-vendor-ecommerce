import { Icon } from "@/components/dashboard/Icon";

export type CheckoutStep = "cart" | "shipping" | "payment";

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "cart", label: "Cart" },
  { key: "shipping", label: "Shipping & Billing" },
  { key: "payment", label: "Payment" },
];

/** Horizontal 3-step progress indicator (done / active / pending). */
export function CheckoutStepper({ step }: { step: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center justify-center">
      {STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-2.5">
              <span
                className={`flex size-9 items-center justify-center rounded-full font-display text-sm font-bold ${
                  done
                    ? "bg-iris-500 text-white"
                    : active
                      ? "border-2 border-iris-500 bg-iris-50 text-iris-500"
                      : "border-2 border-line bg-surface text-muted-soft"
                }`}
              >
                {done ? <Icon name="delivered" size={18} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`whitespace-nowrap font-sans text-[13px] ${
                  done || active ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-3 mb-6 h-0.5 w-16 rounded-full sm:w-24 ${
                  i < currentIndex ? "bg-iris-500" : "bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
