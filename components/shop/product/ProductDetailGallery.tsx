"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/Icon";

/**
 * Product detail gallery — main image + thumbnail strip, discount badge, share
 * (copy link), and a local wishlist toggle. The active/main image is CONTROLLED
 * by the parent (ProductBuyBox) so selecting a variation can swap it.
 */
export function ProductDetailGallery({
  images,
  activeImage,
  onSelectImage,
  productName,
  discountPercent,
}: {
  images: string[];
  activeImage: string | null;
  onSelectImage: (src: string) => void;
  productName: string;
  discountPercent: number | null;
}) {
  const [wished, setWished] = useState(false);
  const [copied, setCopied] = useState(false);

  const main = activeImage ?? images[0] ?? null;

  function share() {
    try {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-line-soft bg-field">
        {main ? (
          <img src={main} alt={productName} className="h-full w-full object-contain" />
        ) : (
          <span className="px-6 text-center font-sans text-[12px] text-muted-soft">
            {productName}
          </span>
        )}

        {discountPercent != null && (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-iris-100 px-2.5 py-1.5 font-sans text-[12px] font-semibold text-iris-700">
            −{discountPercent}%
          </span>
        )}

        <div className="absolute right-3.5 top-3.5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={share}
            aria-label="Share product"
            className="flex size-10 items-center justify-center rounded-full border border-line-soft bg-surface text-iris-500 shadow-[0_4px_12px_-4px_rgba(20,18,31,0.2)] transition-colors hover:bg-iris-50"
          >
            <Icon name={copied ? "check" : "share"} size={18} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setWished((w) => !w)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="flex size-10 items-center justify-center rounded-full border border-line-soft bg-surface shadow-[0_4px_12px_-4px_rgba(20,18,31,0.2)] transition-colors hover:bg-iris-50"
          >
            <Icon
              name={wished ? "heart" : "heartLine"}
              size={18}
              strokeWidth={1.8}
              className={wished ? "text-error" : "text-iris-500"}
            />
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onSelectImage(src)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={src === main}
              className={`size-[70px] flex-none overflow-hidden rounded-xl border bg-field ${
                src === main ? "border-iris-500" : "border-line-soft hover:border-iris-200"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
