import type { VendorStatus } from "@prisma/client";

// Design system §2 status tokens: Approved→success, Pending→warning, Suspended→error.
const MAP: Record<VendorStatus, { label: string; cls: string; dot: string }> = {
  APPROVED: { label: "Approved", cls: "bg-success-bg text-success", dot: "bg-success" },
  PENDING: { label: "Pending", cls: "bg-warning-bg text-warning", dot: "bg-warning" },
  SUSPENDED: { label: "Suspended", cls: "bg-error-bg text-error", dot: "bg-error" },
};

export function VendorStatusBadge({ status }: { status: VendorStatus }) {
  const s = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
