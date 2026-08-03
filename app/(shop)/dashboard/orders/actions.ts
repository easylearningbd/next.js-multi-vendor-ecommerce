"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCancellable } from "@/lib/shop/customer-orders";

export type OrderActionResult = { ok: true } | { ok: false; error: string };

const schema = z.object({ orderNumber: z.string().trim().min(1) });

/** Resolve the signed-in customer id, or null. */
async function customerId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") return null;
  return session.user.id;
}

/**
 * Cancel one of the customer's OWN orders — allowed only while it is still
 * cancellable (PENDING/CONFIRMED). Flips the parent Order and every SubOrder to
 * CANCELED in one transaction. Never hard-deletes; the record stays for history.
 */
export async function cancelOrder(input: { orderNumber: string }): Promise<OrderActionResult> {
  const uid = await customerId();
  if (!uid) return { ok: false, error: "Please sign in to manage your orders." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  // Ownership is enforced by scoping the lookup to this customer.
  const order = await prisma.order.findFirst({
    where: { orderNumber: parsed.data.orderNumber, customerId: uid },
    select: { id: true, status: true },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (!isCancellable(order.status)) {
    return { ok: false, error: "This order can no longer be canceled." };
  }

  try {
    await prisma.$transaction([
      prisma.subOrder.updateMany({ where: { orderId: order.id }, data: { status: "CANCELED" } }),
      prisma.order.update({ where: { id: order.id }, data: { status: "CANCELED" } }),
    ]);
  } catch {
    return { ok: false, error: "Couldn't cancel the order. Please try again." };
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${parsed.data.orderNumber}`);
  return { ok: true };
}

/**
 * Soft-hide one of the customer's OWN orders from their list. Sets `hiddenAt`;
 * the order record stays fully intact for sales/vendor/reporting.
 */
export async function hideOrder(input: { orderNumber: string }): Promise<OrderActionResult> {
  const uid = await customerId();
  if (!uid) return { ok: false, error: "Please sign in to manage your orders." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const result = await prisma.order.updateMany({
    where: { orderNumber: parsed.data.orderNumber, customerId: uid, hiddenAt: null },
    data: { hiddenAt: new Date() },
  });
  if (result.count === 0) return { ok: false, error: "Order not found." };

  revalidatePath("/dashboard/orders");
  return { ok: true };
}
