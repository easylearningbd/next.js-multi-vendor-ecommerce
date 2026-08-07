import type { ReviewStatus } from "@prisma/client";

// Moderation status → design-system status token pair (DESIGN_SYSTEM §2).
const META: Record<ReviewStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-warning-bg text-warning" },
  APPROVED: { label: "Approved", cls: "bg-success-bg text-success" },
  REJECTED: { label: "Rejected", cls: "bg-error-bg text-error" },
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const m = META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
