"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createBrand, updateBrand } from "@/app/(admin)/admin/brands/actions";
import { IMAGE_ACCEPT_ATTR } from "@/lib/brand-validation";
import type { ActionResult, BrandListItem } from "@/lib/brand-types";
import { Icon } from "@/components/dashboard/Icon";
import { Dialog } from "./Dialog";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 font-sans text-[12px] text-error" role="alert">
      {message}
    </p>
  );
}

export function BrandFormModal({
  open,
  onClose,
  brand,
}: {
  open: boolean;
  onClose: () => void;
  brand?: BrandListItem | null;
}) {
  const isEdit = !!brand;
  const router = useRouter();
  const action = isEdit ? updateBrand.bind(null, brand!.id) : createBrand;
  const [state, formAction, pending] = useActionState<ActionResult<BrandListItem> | undefined, FormData>(
    action,
    undefined,
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(brand?.image ?? null);
  const [hasNewFile, setHasNewFile] = useState(false);
  const [active, setActive] = useState(brand ? brand.status === "ACTIVE" : true);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? "Brand updated" : "Brand created");
      router.refresh();
      onClose();
    }
  }, [state, isEdit, onClose, router]);

  // Revoke any object URL we created for previews.
  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setPreview(objectUrl.current);
    setHasNewFile(true);
  }

  function removeImage() {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    if (fileRef.current) fileRef.current.value = "";
    setHasNewFile(false);
    // On edit, revert to the existing image; on create, clear entirely.
    setPreview(brand?.image ?? null);
  }

  const generalError =
    state && !state.success && state.error && !state.fieldErrors ? state.error : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Brand" : "Add Brand"}
      subtitle={isEdit ? "Update this brand's details." : "Create a new brand for the catalog."}
    >
      <form action={formAction} className="flex flex-col gap-5">
        {generalError && (
          <div className="rounded-md border border-[#f6d9da] bg-error-bg px-4 py-3 font-sans text-[13px] text-error">
            {generalError}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="brand-name" className="mb-2 block font-sans text-[13px] font-semibold text-ink-soft">
            Brand name <span className="text-danger">*</span>
          </label>
          <input
            id="brand-name"
            name="name"
            defaultValue={brand?.name ?? ""}
            placeholder="e.g. Sony"
            autoComplete="off"
            aria-invalid={!!state?.fieldErrors?.name}
            className={`h-[48px] w-full rounded-md border bg-bg-subtle px-[15px] font-sans text-[14px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)] ${
              state?.fieldErrors?.name ? "border-error" : "border-line"
            }`}
          />
          <FieldError message={state?.fieldErrors?.name} />
        </div>

        {/* Image */}
        <div>
          <label className="mb-2 block font-sans text-[13px] font-semibold text-ink-soft">
            Brand image {isEdit ? <span className="font-normal text-muted-soft">(optional)</span> : <span className="text-danger">*</span>}
          </label>
          <input
            ref={fileRef}
            type="file"
            name="image"
            accept={IMAGE_ACCEPT_ATTR}
            onChange={onPickFile}
            className="hidden"
          />
          {preview ? (
            <div className="flex items-center gap-4 rounded-lg border border-line bg-bg-subtle p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Brand preview" className="h-[72px] w-[72px] flex-none rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[13px] font-medium text-ink">
                  {hasNewFile ? "New image selected" : "Current image"}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-md border border-line bg-surface px-3 py-1.5 font-sans text-[12px] font-semibold text-ink-soft transition-colors hover:bg-field"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="rounded-md border border-[#f6d9da] bg-error-bg px-3 py-1.5 font-sans text-[12px] font-semibold text-error transition-colors hover:brightness-95"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-bg-subtle px-4 py-7 text-center transition-colors hover:border-iris-300 hover:bg-iris-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-iris-50 text-iris-500">
                <Icon name="upload" size={20} strokeWidth={2} />
              </span>
              <span className="font-sans text-[13px] font-semibold text-ink">Click to upload</span>
              <span className="font-sans text-[12px] text-muted-soft">JPG, PNG or WebP · max 2MB</span>
            </button>
          )}
          <FieldError message={state?.fieldErrors?.image} />
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block font-sans text-[13px] font-semibold text-ink-soft">Status</label>
          <input type="hidden" name="status" value={active ? "ACTIVE" : "INACTIVE"} />
          <div className="flex items-center justify-between rounded-md border border-line bg-bg-subtle px-4 py-3">
            <div>
              <div className="font-sans text-[13.5px] font-medium text-ink">
                {active ? "Active" : "Inactive"}
              </div>
              <div className="font-sans text-[12px] text-muted">
                {active ? "Visible and usable across the catalog." : "Hidden from storefront filtering."}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              aria-label="Toggle status"
              onClick={() => setActive((a) => !a)}
              className={`relative h-[24px] w-[42px] flex-none rounded-full transition-colors ${
                active ? "bg-iris-500" : "bg-[#e4e2e9]"
              }`}
            >
              <span
                className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all ${
                  active ? "left-[21px]" : "left-[3px]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-1 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[46px] rounded-md border border-line bg-surface px-5 font-sans text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-field"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-6 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create brand"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
