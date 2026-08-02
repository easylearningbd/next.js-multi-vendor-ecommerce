"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";

/**
 * Empties the cart once the confirmation page renders — the order is placed, so
 * the client cart (a convenience mirror of intent) is no longer needed. Runs a
 * single time; clearing is idempotent, so a re-render or refresh is harmless.
 * Renders nothing.
 */
export function ClearCart() {
  const { clear } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    clear();
  }, [clear]);

  return null;
}
