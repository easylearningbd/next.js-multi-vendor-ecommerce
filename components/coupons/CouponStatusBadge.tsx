import type { CouponDerivedStatus } from "@/lib/coupon-types";

// Design system §2 tokens: Active→success, Scheduled→info, Expired→error, Inactive→muted.
const MAP: Record<CouponDerivedStatus, { label: string; cls: string; dot: string }> = {
  ACTIVE: { label: "Active", cls: "bg-success-bg text-success", dot: "bg-success" },
  SCHEDULED: { label: "Scheduled", cls: "bg-info-bg text-info", dot: "bg-info" },
  EXPIRED: { label: "Expired", cls: "bg-error-bg text-error", dot: "bg-error" },
  INACTIVE: { label: "Inactive", cls: "bg-field text-muted", dot: "bg-muted-soft" },
};

export function CouponStatusBadge({ status }: { status: CouponDerivedStatus }) {
  const s = MAP[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
