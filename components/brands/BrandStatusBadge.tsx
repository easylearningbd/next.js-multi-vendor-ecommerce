import type { BrandStatus } from "@prisma/client";

/** Status pill — ACTIVE→success tokens, INACTIVE→muted (design system §2). */
export function BrandStatusBadge({ status }: { status: BrandStatus }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${
        active ? "bg-success-bg text-success" : "bg-line-soft text-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-muted-soft"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
