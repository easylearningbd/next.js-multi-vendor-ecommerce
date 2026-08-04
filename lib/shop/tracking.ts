import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/* Status lifecycle → progress steps                                   */
/* ------------------------------------------------------------------ */

/**
 * The ordered fulfillment lifecycle (the "happy path"). A sub-order's `status`
 * marks the furthest milestone reached; the terminal states CANCELED and
 * RETURNED sit OUTSIDE this flow and are rendered distinctly (never as a stuck
 * mid-stepper).
 */
export const TRACKING_FLOW: { key: OrderStatus; label: string }[] = [
  { key: "PENDING", label: "Order placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKAGING", label: "Packaging" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export type TrackStepState = "done" | "current" | "pending" | "canceled" | "returned";
export type TrackStep = { key: string; label: string; state: TrackStepState };

/** Coarse kind of a sub-order's tracking state — drives the header/badge. */
export type TrackKind = "in-progress" | "delivered" | "canceled" | "returned";

export function trackingKind(status: OrderStatus): TrackKind {
  if (status === "CANCELED") return "canceled";
  if (status === "RETURNED") return "returned";
  if (status === "DELIVERED") return "delivered";
  return "in-progress";
}

/**
 * Build the stepper for one sub-order from its current status. Stages up to and
 * including the current status are `done`, the next is `current`, the rest are
 * `pending`. DELIVERED = every stage done. CANCELED collapses to placed → a
 * distinct "Canceled" terminal; RETURNED shows the full flow done + a "Returned"
 * terminal — neither is ever shown as an in-progress step.
 */
export function buildTrackingSteps(status: OrderStatus): TrackStep[] {
  if (status === "CANCELED") {
    return [
      { key: "PENDING", label: "Order placed", state: "done" },
      { key: "CANCELED", label: "Canceled", state: "canceled" },
    ];
  }

  const idx = TRACKING_FLOW.findIndex((s) => s.key === status); // -1 for RETURNED
  const steps: TrackStep[] = TRACKING_FLOW.map((s, i) => {
    let state: TrackStepState;
    if (status === "RETURNED" || i <= idx) state = "done";
    else if (i === idx + 1) state = "current";
    else state = "pending";
    return { key: s.key, label: s.label, state };
  });

  if (status === "RETURNED") {
    steps.push({ key: "RETURNED", label: "Returned", state: "returned" });
  }
  return steps;
}

/* ------------------------------------------------------------------ */
/* Lookup — SCOPED to the signed-in customer (privacy)                 */
/* ------------------------------------------------------------------ */

/**
 * Look up an order for tracking, scoped to the customer who owns it. Filtering
 * by BOTH orderNumber AND customerId means a customer can only ever track their
 * OWN orders; anything else returns `null`, which the caller renders as a plain
 * "Order not found" — never revealing whether the id exists (order ids are
 * guessable and hold a real person's name/address/purchases).
 *
 * Progress is tracked PER SUB-ORDER (per vendor): a single order can hold items
 * from multiple vendors at different stages, so each sub-order carries its own
 * `status` + timestamps.
 */
export async function getTrackedOrder(orderNumber: string, customerId: string) {
  return prisma.order.findFirst({
    where: { orderNumber, customerId },
    select: {
      orderNumber: true,
      status: true,
      createdAt: true,
      // Shipping address snapshot (for the order summary).
      shipName: true,
      shipPhone: true,
      shipEmail: true,
      shipCountry: true,
      shipCity: true,
      shipZip: true,
      shipAddress: true,
      subOrders: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true, // best proxy for "last status change"
          vendor: { select: { storeName: true, slug: true, logo: true } },
          items: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              productName: true,
              variantLabel: true,
              qty: true,
              unitPrice: true,
              lineTotal: true,
              product: { select: { slug: true, thumbnail: true } },
            },
          },
        },
      },
    },
  });
}

export type TrackedOrder = NonNullable<Awaited<ReturnType<typeof getTrackedOrder>>>;
export type TrackedSubOrder = TrackedOrder["subOrders"][number];
