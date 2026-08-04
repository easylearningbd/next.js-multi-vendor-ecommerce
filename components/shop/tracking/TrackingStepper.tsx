import type { OrderStatus } from "@prisma/client";
import { Icon, type IconName } from "@/components/dashboard/Icon";
import { buildTrackingSteps, type TrackStepState } from "@/lib/shop/tracking";

const DOT: Record<TrackStepState, string> = {
  done: "bg-success text-white",
  current: "bg-iris-500 text-white ring-4 ring-iris-100",
  pending: "bg-line text-transparent",
  canceled: "bg-error text-white",
  returned: "bg-info text-white",
};
const DOT_ICON: Partial<Record<TrackStepState, IconName>> = {
  done: "check",
  canceled: "x",
  returned: "refresh",
};
const DESC: Record<TrackStepState, string> = {
  done: "Completed",
  current: "In progress",
  pending: "Pending",
  canceled: "This part of the order was canceled",
  returned: "This part of the order was returned",
};

/**
 * Vertical shipment-progress stepper for ONE sub-order, driven by its current
 * status. Terminal CANCELED/RETURNED render as their own distinct final step
 * (never a stuck mid-stepper).
 */
export function TrackingStepper({ status }: { status: OrderStatus }) {
  const steps = buildTrackingSteps(status);

  return (
    <div className="flex flex-col">
      {steps.map((s, i) => {
        const icon = DOT_ICON[s.state];
        return (
          <div key={s.key} className="flex gap-4">
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
              <div className="mt-1 font-sans text-[12.5px] text-muted-soft">{DESC[s.state]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
