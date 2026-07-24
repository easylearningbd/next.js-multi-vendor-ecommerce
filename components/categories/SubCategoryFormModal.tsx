"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSubCategory, updateSubCategory } from "@/app/(admin)/admin/categories/actions";
import type { ActionResult, CategoryOption, SubCategoryListItem } from "@/lib/category-types";
import { Dialog } from "@/components/brands/Dialog";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 font-sans text-[12px] text-error" role="alert">
      {message}
    </p>
  );
}

const fieldClass =
  "h-[48px] w-full rounded-md border bg-bg-subtle px-[15px] font-sans text-[14px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]";

export function SubCategoryFormModal({
  open,
  onClose,
  subCategory,
  categoryOptions,
}: {
  open: boolean;
  onClose: () => void;
  subCategory?: SubCategoryListItem | null;
  categoryOptions: CategoryOption[];
}) {
  const isEdit = !!subCategory;
  const router = useRouter();
  const action = isEdit ? updateSubCategory.bind(null, subCategory!.id) : createSubCategory;
  const [state, formAction, pending] = useActionState<ActionResult<SubCategoryListItem> | undefined, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? "Sub-category updated" : "Sub-category created");
      router.refresh();
      onClose();
    }
  }, [state, isEdit, onClose, router]);

  const generalError =
    state && !state.success && state.error && !state.fieldErrors ? state.error : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Sub-Category" : "Add Sub-Category"}
      subtitle={isEdit ? "Update this sub-category's details." : "Create a sub-category under a category."}
    >
      <form action={formAction} className="flex flex-col gap-5">
        {generalError && (
          <div className="rounded-md border border-[#f6d9da] bg-error-bg px-4 py-3 font-sans text-[13px] text-error">
            {generalError}
          </div>
        )}

        {/* Parent category */}
        <div>
          <label htmlFor="sub-category-parent" className="mb-2 block font-sans text-[13px] font-semibold text-ink-soft">
            Parent category <span className="text-danger">*</span>
          </label>
          <select
            id="sub-category-parent"
            name="categoryId"
            defaultValue={subCategory?.categoryId ?? ""}
            aria-invalid={!!state?.fieldErrors?.categoryId}
            className={`${fieldClass} cursor-pointer ${state?.fieldErrors?.categoryId ? "border-error" : "border-line"}`}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError message={state?.fieldErrors?.categoryId} />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="sub-category-name" className="mb-2 block font-sans text-[13px] font-semibold text-ink-soft">
            Sub-category name <span className="text-danger">*</span>
          </label>
          <input
            id="sub-category-name"
            name="name"
            defaultValue={subCategory?.name ?? ""}
            placeholder="e.g. Phones"
            autoComplete="off"
            aria-invalid={!!state?.fieldErrors?.name}
            className={`${fieldClass} ${state?.fieldErrors?.name ? "border-error" : "border-line"}`}
          />
          <FieldError message={state?.fieldErrors?.name} />
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
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create sub-category"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
