import type { ProductApprovalStatus } from "@prisma/client";

// Design system §2 status tokens: Approved→success, Pending→warning, Rejected→error.
const MAP: Record<ProductApprovalStatus, { label: string; cls: string; dot: string }> = {
  APPROVED: { label: "Approved", cls: "bg-success-bg text-success", dot: "bg-success" },
  PENDING: { label: "Pending", cls: "bg-warning-bg text-warning", dot: "bg-warning" },
  REJECTED: { label: "Rejected", cls: "bg-error-bg text-error", dot: "bg-error" },
};

export function ProductApprovalBadge({ status }: { status: ProductApprovalStatus }) {
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
