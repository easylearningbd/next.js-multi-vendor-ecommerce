import type { OrderStatus, PaymentStatus } from "@prisma/client";

// Tone → design-system status token pair (DESIGN_SYSTEM §2).
const TONE: Record<"success" | "warning" | "error" | "info", string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-error-bg text-error",
  info: "bg-info-bg text-info",
};

const ORDER_META: Record<OrderStatus, { label: string; tone: keyof typeof TONE }> = {
  PENDING: { label: "Pending", tone: "warning" },
  CONFIRMED: { label: "Confirmed", tone: "info" },
  PACKAGING: { label: "Packaging", tone: "warning" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", tone: "warning" },
  DELIVERED: { label: "Delivered", tone: "success" },
  CANCELED: { label: "Canceled", tone: "error" },
  RETURNED: { label: "Returned", tone: "info" },
  FAILED_TO_DELIVER: { label: "Failed to deliver", tone: "error" },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; tone: keyof typeof TONE }> = {
  PAID: { label: "Paid", tone: "success" },
  UNPAID: { label: "Unpaid", tone: "error" },
  REFUNDED: { label: "Refunded", tone: "info" },
};

const PILL =
  "inline-flex items-center rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const m = ORDER_META[status];
  return <span className={`${PILL} ${TONE[m.tone]}`}>{m.label}</span>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const m = PAYMENT_META[status];
  return <span className={`${PILL} ${TONE[m.tone]}`}>{m.label}</span>;
}
