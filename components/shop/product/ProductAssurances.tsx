import { Icon, type IconName } from "@/components/dashboard/Icon";

const ASSURANCES: { icon: IconName; label: string }[] = [
  { icon: "truck", label: "Free delivery on orders over $50" },
  { icon: "lock", label: "Secure checkout with Stripe" },
  { icon: "refresh", label: "7-day easy returns" },
  { icon: "award", label: "Authentic products from verified sellers" },
];

/** Static marketplace assurances shown in the product detail sidebar. */
export function ProductAssurances() {
  return (
    <div className="rounded-[18px] border border-line-soft bg-surface px-5 py-2 shadow-[0_1px_2px_rgba(20,18,31,0.05)]">
      {ASSURANCES.map((a) => (
        <div
          key={a.label}
          className="flex items-center gap-3.5 border-b border-bg-dash py-3.5 last:border-b-0"
        >
          <span className="flex size-[38px] flex-none items-center justify-center rounded-[10px] bg-iris-50 text-iris-500">
            <Icon name={a.icon} size={18} strokeWidth={1.9} />
          </span>
          <span className="font-sans text-[13.5px] leading-[1.3] text-ink-soft">
            {a.label}
          </span>
        </div>
      ))}
    </div>
  );
}
