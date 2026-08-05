import type { OrderStatus } from "@prisma/client";
import { Icon, type IconName } from "@/components/dashboard/Icon";

const FLOW: { key: OrderStatus; label: string }[] = [
  { key: "PENDING", label: "Order placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKAGING", label: "Packaging" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type StepState = "done" | "current" | "pending" | "canceled" | "returned" | "failed";
type Step = { label: string; state: StepState; time: string };

const DOT: Record<StepState, string> = {
  done: "bg-success text-white",
  current: "bg-iris-500 text-white ring-4 ring-iris-100",
  pending: "bg-line text-transparent",
  canceled: "bg-error text-white",
  returned: "bg-info text-white",
  failed: "bg-error text-white",
};
const DOT_ICON: Partial<Record<StepState, IconName>> = {
  done: "check",
  canceled: "x",
  returned: "refresh",
  failed: "alert",
};

// We don't keep a per-status history, so only "Order placed" has a real time;
// the rest show honest status words rather than invented timestamps.
function buildSteps(status: OrderStatus, createdAt: Date): Step[] {
  const placedTime = DATE_FMT.format(createdAt);

  if (status === "CANCELED") {
    return [
      { label: "Order placed", state: "done", time: placedTime },
      { label: "Order canceled", state: "canceled", time: "This order was canceled" },
    ];
  }

  if (status === "FAILED_TO_DELIVER") {
    return [
      ...FLOW.slice(0, 4).map((s, i) => ({
        label: s.label,
        state: "done" as const,
        time: i === 0 ? placedTime : "Completed",
      })),
      { label: "Delivery failed", state: "failed", time: "The delivery attempt failed" },
    ];
  }

  // `status` marks the furthest completed milestone, so stages up to and
  // including it are done and the NEXT stage is the one in progress. "Order
  // placed" (stage 0) is therefore always done for a live order.
  const idx = FLOW.findIndex((f) => f.key === status);
  const steps: Step[] = FLOW.map((s, i) => {
    let state: StepState;
    if (status === "RETURNED" || i <= idx) state = "done";
    else if (i === idx + 1) state = "current";
    else state = "pending";
    const time =
      i === 0
        ? placedTime
        : state === "current"
          ? "In progress"
          : state === "done"
            ? "Completed"
            : "Pending";
    return { label: s.label, state, time };
  });

  if (status === "RETURNED") {
    steps.push({ label: "Returned", state: "returned", time: "Item returned" });
  }
  return steps;
}

export function OrderTimeline({ status, createdAt }: { status: OrderStatus; createdAt: Date }) {
  const steps = buildSteps(status, createdAt);

  return (
    <div className="rounded-2xl border border-line-soft p-7">
      <div className="flex flex-col">
        {steps.map((s, i) => {
          const icon = DOT_ICON[s.state];
          return (
            <div key={s.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-[26px] flex-none items-center justify-center rounded-full ${DOT[s.state]}`}
                >
                  {icon ? (
                    <Icon name={icon} size={13} strokeWidth={3} />
                  ) : s.state === "current" ? (
                    <span className="size-2 rounded-full bg-white" />
                  ) : null}
                </span>
                {i < steps.length - 1 && (
                  <span
                    className={`min-h-6 w-0.5 flex-1 ${s.state === "done" ? "bg-success" : "bg-line"}`}
                  />
                )}
              </div>
              <div className="pb-6">
                <div
                  className={`font-display text-sm font-semibold ${
                    s.state === "pending" ? "text-muted-soft" : "text-ink"
                  }`}
                >
                  {s.label}
                </div>
                <div className="mt-1.5 font-sans text-[12.5px] text-muted-soft">{s.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
