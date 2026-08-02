/**
 * Order totals — computed in INTEGER CENTS (never float). Shared by the client
 * checkout summary (a preview) and the server placeOrder action (the authority).
 * Tax follows the design: 15% of the subtotal; discount is subtracted from the
 * total; shipping is added.
 */

export const TAX_RATE = 0.15;

export type OrderTotals = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  grandTotalCents: number;
};

export function computeTotals(
  subtotalCents: number,
  opts: { shippingCents?: number; discountCents?: number } = {},
): OrderTotals {
  const discountCents = Math.min(Math.max(0, opts.discountCents ?? 0), subtotalCents);
  const shippingCents = Math.max(0, opts.shippingCents ?? 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const grandTotalCents = Math.max(
    0,
    subtotalCents - discountCents + taxCents + shippingCents,
  );
  return { subtotalCents, discountCents, taxCents, shippingCents, grandTotalCents };
}
