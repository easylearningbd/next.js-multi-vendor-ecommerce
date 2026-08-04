"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { toggleWishlist } from "@/app/(shop)/dashboard/wishlist/actions";

type WishlistContextValue = {
  /** True once the wishlist has hydrated from the server. */
  hydrated: boolean;
  isLoggedIn: boolean;
  has: (productId: string) => boolean;
  /** Add/remove a product; optimistic, with a sign-in prompt for guests. */
  toggle: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}

/**
 * Storefront-wide wishlist state. Hydrates ONCE from /api/wishlist (one query for
 * the whole page — never per card), then every product card reads its heart from
 * the shared set. Toggles are optimistic; the server action is the source of
 * truth for auth (a logged-out toggle is bounced to sign-in, never an error).
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/wishlist")
      .then((r) => (r.ok ? r.json() : { isLoggedIn: false, ids: [] }))
      .then((data: { isLoggedIn: boolean; ids: string[] }) => {
        if (!active) return;
        setIds(new Set(data.ids));
        setIsLoggedIn(data.isLoggedIn);
        setHydrated(true);
      })
      .catch(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const promptSignIn = useCallback(() => {
    toast("Sign in to save items to your wishlist");
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  // Depends on `ids` so consumers re-render when the set changes (hearts update).
  const has = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(
    (productId: string) => {
      // Known-logged-out → prompt immediately (no optimistic flash).
      if (hydrated && !isLoggedIn) {
        promptSignIn();
        return;
      }

      const wasIn = ids.has(productId);
      setIds((prev) => {
        const next = new Set(prev);
        if (wasIn) next.delete(productId);
        else next.add(productId);
        return next;
      });

      const revert = () =>
        setIds((prev) => {
          const next = new Set(prev);
          if (wasIn) next.add(productId);
          else next.delete(productId);
          return next;
        });

      toggleWishlist(productId)
        .then((res) => {
          if (res.ok) {
            toast.success(res.wished ? "Added to wishlist" : "Removed from wishlist");
          } else if (res.code === "AUTH") {
            revert();
            promptSignIn();
          } else {
            revert();
            toast.error(res.error);
          }
        })
        .catch(() => {
          revert();
          toast.error("Couldn't update your wishlist. Please try again.");
        });
    },
    [ids, hydrated, isLoggedIn, promptSignIn],
  );

  const value = useMemo(
    () => ({ hydrated, isLoggedIn, has, toggle }),
    [hydrated, isLoggedIn, has, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
