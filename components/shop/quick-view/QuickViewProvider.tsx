"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { fetchQuickView } from "@/app/(shop)/actions";
import type { QuickViewProduct } from "@/lib/shop/queries";
import { QuickViewModal, type QuickViewStatus } from "./QuickViewModal";

type QuickViewContextValue = { open: (productId: string) => void };

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

/** Opener for the storefront quick-view modal. Returns null outside the provider. */
export function useQuickView(): QuickViewContextValue | null {
  return useContext(QuickViewContext);
}

/**
 * Storefront-wide quick-view host. Mounted once in the shop layout; any
 * ProductCard under it can call `useQuickView().open(id)` to load a product's
 * detail via a server action and show it in the modal. A request counter guards
 * against races when the shopper opens cards in quick succession.
 */
export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<QuickViewStatus>("loading");
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const requestRef = useRef(0);

  const open = useCallback((productId: string) => {
    const reqId = ++requestRef.current;
    setIsOpen(true);
    setStatus("loading");
    setProduct(null);
    fetchQuickView(productId)
      .then((p) => {
        if (requestRef.current !== reqId) return; // superseded by a newer open()
        if (p) {
          setProduct(p);
          setStatus("loaded");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (requestRef.current === reqId) setStatus("error");
      });
  }, []);

  const close = useCallback(() => {
    requestRef.current++; // ignore any in-flight response
    setIsOpen(false);
  }, []);

  return (
    <QuickViewContext.Provider value={{ open }}>
      {children}
      <QuickViewModal
        open={isOpen}
        status={status}
        product={product}
        onClose={close}
      />
    </QuickViewContext.Provider>
  );
}
