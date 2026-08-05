"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionVendorId, canTransition } from "@/lib/vendor/orders";

export type UpdateStatusResult =
  | { ok: true; status: OrderStatus }
  | { ok: false; error: string };

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKAGING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
  "RETURNED",
  "FAILED_TO_DELIVER",
] as const;

const schema = z.object({
  subOrderId: z.string().trim().min(1),
  status: z.enum(STATUSES),
});

/**
 * A vendor updates the status of ONE of THEIR sub-orders. Writes to the shared
 * `SubOrder.status` field — the same field the customer order details, customer
 * tracking, and admin oversight all READ, so those views update automatically.
 * Scoped by (id, vendorId): a vendor can never touch another vendor's slice.
 * Only sane forward/terminal transitions are allowed (no DELIVERED → PENDING).
 */
export async function updateSubOrderStatus(input: {
  subOrderId: string;
  status: OrderStatus;
}): Promise<UpdateStatusResult> {
  const vendorId = await getSessionVendorId();
  if (!vendorId) return { ok: false, error: "You are not authorized to perform this action." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid status." };
  const { subOrderId, status } = parsed.data;

  const sub = await prisma.subOrder.findFirst({
    where: { id: subOrderId, vendorId },
    select: { status: true, order: { select: { orderNumber: true } } },
  });
  if (!sub) return { ok: false, error: "Order not found." };

  if (sub.status === status) return { ok: true, status }; // no change

  if (!canTransition(sub.status, status)) {
    return { ok: false, error: `You can't change this order from ${sub.status} to ${status}.` };
  }

  try {
    await prisma.subOrder.update({ where: { id: subOrderId }, data: { status } });
  } catch {
    return { ok: false, error: "Couldn't update the status. Please try again." };
  }

  // Vendor views + every customer view that READS this shared field.
  revalidatePath(`/vendor/orders/${subOrderId}`);
  revalidatePath("/vendor/orders");
  revalidatePath(`/dashboard/orders/${sub.order.orderNumber}`);
  revalidatePath("/dashboard/track-order");
  return { ok: true, status };
}
