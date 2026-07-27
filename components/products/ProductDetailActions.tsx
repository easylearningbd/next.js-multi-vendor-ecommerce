"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { DeleteProductModal } from "./DeleteProductModal";

export function ProductDetailActions({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex items-center gap-2.5">
      <Link
        href={`/vendor/products/${id}/edit`}
        className="flex h-11 items-center gap-2 rounded-md border border-iris-100 bg-iris-50 px-4 font-sans text-[13px] font-semibold text-iris-500 transition-colors hover:bg-iris-100"
      >
        <Icon name="edit" size={16} strokeWidth={2} />
        Edit
      </Link>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex h-11 items-center gap-2 rounded-md border border-error-bg bg-error-bg px-4 font-sans text-[13px] font-semibold text-error transition-[filter] hover:brightness-95"
      >
        <Icon name="trash" size={16} strokeWidth={2} />
        Delete
      </button>
      <DeleteProductModal
        product={confirming ? { id, name } : null}
        onClose={() => setConfirming(false)}
        redirectTo="/vendor/products"
      />
    </div>
  );
}
