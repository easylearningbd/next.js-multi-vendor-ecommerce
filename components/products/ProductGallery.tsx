"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/Icon";

// Main image + clickable thumbnail strip (thumbnail first, then gallery images).
export function ProductGallery({ thumbnail, gallery, alt }: { thumbnail: string | null; gallery: string[]; alt: string }) {
  const images = [thumbnail, ...gallery].filter(Boolean) as string[];
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-line-soft bg-field text-muted-soft">
        <Icon name="box" size={48} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-line-soft bg-field">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={alt} className="h-full w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2.5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`h-[60px] w-[60px] overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-iris-500" : "border-line-soft hover:border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
