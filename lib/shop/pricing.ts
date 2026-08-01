import type { Prisma } from "@prisma/client";

/**
 * Storefront price display helpers.
 *
 * Money is handled in INTEGER CENTS internally so we never do floating-point
 * arithmetic on currency. Prisma returns money columns as Decimal; we read them
 * to cents once, compute, and hand back fixed-2 strings for display.
 */

type DecimalLike = Prisma.Decimal | string | number | null | undefined;

/** Read a Decimal money value into integer cents (0 for null/undefined). */
function toCents(value: DecimalLike): number {
  if (value == null) return 0;
  // Number() on a 2-dp Decimal string is exact for realistic magnitudes;
  // rounding to the nearest cent removes any binary-float dust.
  return Math.round(Number(value) * 100);
}

/** Format integer cents as a "$1,299.00" display string. */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format a Decimal/string money value as a "$1,299.00" display string. */
export function formatMoney(value: DecimalLike): string {
  return formatCents(toCents(value));
}

export type CardPricing = {
  /** Final selling price the customer pays, as a "$…" display string. */
  price: string;
  /** Strikethrough "was" price, or null when the item is not on sale. */
  compareAt: string | null;
  /** Whole-percent discount for the badge (e.g. 18 → "−18%"), or null. */
  discountPercent: number | null;
};

/**
 * Resolve a product's storefront pricing to the shape the ProductCard needs.
 *
 * `price` is the vendor's selling price; `compareAtPrice` (when set) is the
 * higher original shown struck through; `discount`/`discountType` is an extra
 * reduction applied on top of `price`. We fold all of that into a single final
 * price + optional strikethrough + badge percent.
 */
export function computeCardPricing(p: {
  price: DecimalLike;
  compareAtPrice: DecimalLike;
  discount: DecimalLike;
  discountType: "AMOUNT" | "PERCENT";
}): CardPricing {
  const baseCents = toCents(p.price);

  // Apply the explicit discount (if any) to the base price.
  let finalCents = baseCents;
  if (p.discount != null) {
    const reduction =
      p.discountType === "PERCENT"
        ? Math.round((baseCents * Number(p.discount)) / 100)
        : toCents(p.discount);
    finalCents = Math.max(0, baseCents - reduction);
  }

  // Strikethrough: prefer an explicit compare-at price; otherwise, if a discount
  // pulled the price below base, show the base price struck through.
  const compareAtCents = toCents(p.compareAtPrice);
  let strikeCents: number | null = null;
  if (compareAtCents > finalCents) strikeCents = compareAtCents;
  else if (finalCents < baseCents) strikeCents = baseCents;

  const discountPercent =
    strikeCents != null && strikeCents > finalCents
      ? Math.round(((strikeCents - finalCents) / strikeCents) * 100)
      : null;

  return {
    price: formatCents(finalCents),
    compareAt: strikeCents != null ? formatCents(strikeCents) : null,
    discountPercent: discountPercent && discountPercent > 0 ? discountPercent : null,
  };
}
