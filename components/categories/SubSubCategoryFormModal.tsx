"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  createSubSubCategory,
  updateSubSubCategory,
  getSubCategoriesByCategory,
} from "@/app/(admin)/admin/categories/actions";
import type {
  ActionResult,
  CategoryOption,
  SubCategoryOption,
  SubSubCategoryListItem,
} from "@/lib/category-types";
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

export function SubSubCategoryFormModal({
  open,
  onClose,
  subSubCategory,
  categoryOptions,
}: {
  open: boolean;
  onClose: () => void;
  subSubCategory?: SubSubCategoryListItem | null;
  categoryOptions: CategoryOption[];
}) {
  const isEdit = !!subSubCategory;
  const router = useRouter();
  const action = isEdit ? updateSubSubCategory.bind(null, subSubCategory!.id) : createSubSubCategory;
  const [state, formAction, pending] = useActionState<ActionResult<SubSubCategoryListItem> | undefined, FormData>(
    action,
    undefined,
  );

  // Dependent dropdown state
  const [categoryId, setCategoryId] = useState(subSubCategory?.categoryId ?? "");
  const [subCategoryId, setSubCategoryId] = useState(subSubCategory?.subCategoryId ?? "");
  const [subOptions, setSubOptions] = useState<SubCategoryOption[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const reqId = useRef(0);

  // Fetch a category's sub-categories from the server (never ship them all client-side).
  async function loadSubs(catId: string, preselect: string) {
    const id = ++reqId.current;
    setSubLoading(true);
    const res = await getSubCategoriesByCategory(catId);
    if (id !== reqId.current) return; // a newer request superseded this one
    setSubOptions(res.success ? res.data ?? [] : []);
    setSubCategoryId(preselect);
    setSubLoading(false);
  }

  // On edit: pre-load the chosen category's sub-categories and pre-select the sub.
  useEffect(() => {
    if (subSubCategory?.categoryId) {
      void loadSubs(subSubCategory.categoryId, subSubCategory.subCategoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? "Sub-sub-category updated" : "Sub-sub-category created");
      router.refresh();
      onClose();
    }
  }, [state, isEdit, onClose, router]);

  function onCategoryChange(newCatId: string) {
    setCategoryId(newCatId);
    setSubCategoryId(""); // selecting a new category clears the old sub-category
    if (newCatId) {
      void loadSubs(newCatId, "");
    } else {
      reqId.current++; // cancel any in-flight load
      setSubOptions([]);
      setSubLoading(false);
    }
  }

  const generalError =
    state && !state.success && state.error && !state.fieldErrors ? state.error : undefined;

  const subDisabled = !categoryId || subLoading;
  const subPlaceholder = !categoryId
    ? "Select a category first"
    : subLoading
      ? "Loading sub-categories…"
      : subOptions.length === 0
        ? "No sub-categories — add one first"
        : "Select a sub-category";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Sub-Sub-Category" : "Add Sub-Sub-Category"}
      subtitle={
        isEdit
          ? "Update this sub-sub-category's details."
          : "Pick a category, then one of its sub-categories."
      }
    >
      <form action={formAction} className="flex flex-col gap-5">
        {generalError && (
          <div className="rounded-md border border-[#f6d9da] bg-error-bg px-4 py-3 font-sans text-[13px] text-error">
            {generalError}
          </div>
        )}

        {/* Category (first dropdown) */}
        <div>
          <label htmlFor="ss-category" className="mb-2 block font-sans text-[13px] font-semibold text-ink-soft">
            Category <span className="text-danger">*</span>
          </label>
          <select
            id="ss-category"
            name="categoryId"
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
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

        {/* Sub-Category (dependent second dropdown) */}
        <div>
          <label htmlFor="ss-subcategory" className="mb-2 flex items-center gap-2 font-sans text-[13px] font-semibold text-ink-soft">
            Sub-category <span className="text-danger">*</span>
            {subLoading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-iris-200 border-t-iris-500" />
            )}
          </label>
          <select
            id="ss-subcategory"
            name="subCategoryId"
            value={subCategoryId}
            onChange={(e) => setSubCategoryId(e.target.value)}
            disabled={subDisabled}
            aria-invalid={!!state?.fieldErrors?.subCategoryId}
            className={`${fieldClass} cursor-pointer disabled:cursor-not-allowed disabled:bg-field disabled:text-muted-soft ${
              state?.fieldErrors?.subCategoryId ? "border-error" : "border-line"
            }`}
          >
            <option value="" disabled>
              {subPlaceholder}
            </option>
            {subOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <FieldError message={state?.fieldErrors?.subCategoryId} />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="ss-name" className="mb-2 block font-sans text-[13px] font-semibold text-ink-soft">
            Sub-sub-category name <span className="text-danger">*</span>
          </label>
          <input
            id="ss-name"
            name="name"
            defaultValue={subSubCategory?.name ?? ""}
            placeholder="e.g. iPhone"
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
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create sub-sub-category"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
