"use client";

import { useState } from "react";
import type { BrandListItem } from "@/lib/brand-types";
import { Icon } from "@/components/dashboard/Icon";
import { BrandFormModal } from "./BrandFormModal";
import { DeleteBrandDialog } from "./DeleteBrandDialog";

export function BrandDetailActions({ brand }: { brand: BrandListItem }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <div className="flex flex-none items-center gap-2.5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex h-[44px] items-center gap-2 rounded-md border border-iris-100 bg-iris-50 px-4 font-sans text-[13px] font-semibold text-iris-500 transition-colors hover:bg-iris-100"
        >
          <Icon name="edit" size={16} strokeWidth={2} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setDeleting(true)}
          className="flex h-[44px] items-center gap-2 rounded-md border border-[#f6d9da] bg-error-bg px-4 font-sans text-[13px] font-semibold text-error transition-[filter] hover:brightness-95"
        >
          <Icon name="trash" size={16} strokeWidth={2} />
          Delete
        </button>
      </div>

      {editing && <BrandFormModal open onClose={() => setEditing(false)} brand={brand} />}
      {deleting && (
        <DeleteBrandDialog
          open
          onClose={() => setDeleting(false)}
          brand={brand}
          redirectTo="/admin/brands"
        />
      )}
    </>
  );
}
