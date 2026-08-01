"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { StorefrontProduct } from "@/lib/shop/queries";

/**
 * Client-side cart shared across the whole storefront.
 *
 * - Money is stored/summed in INTEGER CENTS (priceCents) — never float.
 * - Persisted to localStorage as a guest cart, read via useSyncExternalStore so
 *   SSR and the first client render agree (no hydration flicker, no setState-in-effect).
 * - Grouped by seller for display (marketplace rule).
 *
 * Server/DB cart extension point: today this is guest-only in localStorage. When
 * a logged-in cart lands, back the store below with the server (load in the store
 * init, mirror `dispatch` to a server action) — the CartContext API that the rest
 * of the storefront depends on stays the same. See TODO(server-cart) markers.
 */

const STORAGE_KEY = "covet-cart-v1";

export type CartItem = {
  productId: string;
  variationId: string | null;
  name: string;
  slug: string;
  sellerStoreName: string;
  sellerSlug: string;
  priceCents: number;
  image: string | null;
  qty: number;
};

export type CartSellerGroup = {
  sellerSlug: string;
  sellerStoreName: string;
  items: CartItem[];
  subtotalCents: number;
};

/** Stable line key: one line per (product, variation). */
export function lineKey(i: { productId: string; variationId: string | null }): string {
  return `${i.productId}:${i.variationId ?? ""}`;
}

/** Build a cart line (minus qty) from any storefront product shape. */
export function toCartItem(
  product: Pick<
    StorefrontProduct,
    "id" | "name" | "slug" | "priceCents" | "thumbnail" | "seller"
  >,
  variationId: string | null = null,
): Omit<CartItem, "qty"> {
  return {
    productId: product.id,
    variationId,
    name: product.name,
    slug: product.slug,
    sellerStoreName: product.seller.storeName,
    sellerSlug: product.seller.slug,
    priceCents: product.priceCents,
    image: product.thumbnail,
  };
}

type Action =
  | { type: "ADD"; item: Omit<CartItem, "qty">; qty: number }
  | { type: "INCREMENT"; key: string }
  | { type: "DECREMENT"; key: string }
  | { type: "REMOVE"; key: string }
  | { type: "CLEAR" };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const key = lineKey(action.item);
      const existing = state.find((i) => lineKey(i) === key);
      if (existing) {
        return state.map((i) =>
          lineKey(i) === key ? { ...i, qty: i.qty + action.qty } : i,
        );
      }
      return [...state, { ...action.item, qty: action.qty }];
    }
    case "INCREMENT":
      return state.map((i) =>
        lineKey(i) === action.key ? { ...i, qty: i.qty + 1 } : i,
      );
    case "DECREMENT":
      return state
        .map((i) => (lineKey(i) === action.key ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
    case "REMOVE":
      return state.filter((i) => lineKey(i) !== action.key);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

/** Drop anything malformed from a persisted cart before trusting it. */
function sanitize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (i): i is CartItem =>
      i != null &&
      typeof i.productId === "string" &&
      typeof i.priceCents === "number" &&
      Number.isFinite(i.priceCents) &&
      typeof i.qty === "number" &&
      i.qty > 0,
  );
}

const EMPTY: CartItem[] = [];

type CartStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CartItem[];
  getServerSnapshot: () => CartItem[];
  dispatch: (action: Action) => void;
};

/**
 * External store backing the cart. localStorage is read lazily on first
 * subscription (client only) — the initial snapshot is empty so it matches the
 * server render, then useSyncExternalStore re-renders once the guest cart loads.
 */
function createCartStore(): CartStore {
  let items: CartItem[] = EMPTY;
  let initialized = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (initialized) return;
    initialized = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = sanitize(JSON.parse(raw));
        if (parsed.length) items = parsed;
      }
    } catch {
      /* ignore corrupted / unavailable storage */
    }
  };

  return {
    subscribe(listener) {
      load();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => items,
    getServerSnapshot: () => EMPTY,
    dispatch(action) {
      const next = reducer(items, action);
      if (next === items) return;
      items = next;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* ignore quota / privacy-mode errors */
      }
      // TODO(server-cart): mirror mutations to a server action for logged-in users.
      listeners.forEach((l) => l());
    },
  };
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  groups: CartSellerGroup[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(createCartStore);
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => store.dispatch({ type: "ADD", item, qty }),
    [store],
  );
  const increment = useCallback((key: string) => store.dispatch({ type: "INCREMENT", key }), [store]);
  const decrement = useCallback((key: string) => store.dispatch({ type: "DECREMENT", key }), [store]);
  const removeItem = useCallback((key: string) => store.dispatch({ type: "REMOVE", key }), [store]);
  const clear = useCallback(() => store.dispatch({ type: "CLEAR" }), [store]);

  const { count, subtotalCents, groups } = useMemo(() => {
    let count = 0;
    let subtotalCents = 0;
    const bySeller = new Map<string, CartSellerGroup>();
    for (const item of items) {
      count += item.qty;
      subtotalCents += item.priceCents * item.qty;
      const g = bySeller.get(item.sellerSlug);
      if (g) {
        g.items.push(item);
        g.subtotalCents += item.priceCents * item.qty;
      } else {
        bySeller.set(item.sellerSlug, {
          sellerSlug: item.sellerSlug,
          sellerStoreName: item.sellerStoreName,
          items: [item],
          subtotalCents: item.priceCents * item.qty,
        });
      }
    }
    return { count, subtotalCents, groups: [...bySeller.values()] };
  }, [items]);

  const value: CartContextValue = {
    items,
    count,
    subtotalCents,
    groups,
    addItem,
    increment,
    decrement,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
