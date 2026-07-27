"use client";

import { useState } from "react";
import {
  getSubcategoryOptions,
  getSubSubcategoryOptions,
} from "@/app/(seller)/vendor/(dashboard)/products/actions";
import type { Option } from "@/lib/product-types";

const labelClass = "mb-2 flex items-center gap-1.5 font-sans text-[12.5px] font-semibold text-ink-soft";
const selectClass =
  "h-[46px] w-full rounded-xl border bg-bg-subtle px-3.5 font-sans text-[13.5px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)] disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 font-sans text-[12px] text-error">{message}</p>;
}

// Category → Sub → Sub-Sub. Each child is fetched from the server ON DEMAND when its
// parent changes (we never ship the whole tree). Changing a parent clears its children.
export function DependentCategorySelects({
  categories,
  errors,
  initial,
  initialSubs = [],
  initialSubSubs = [],
}: {
  categories: Option[];
  errors?: Record<string, string>;
  initial?: { categoryId: string; subCategoryId: string; subSubCategoryId: string };
  initialSubs?: Option[];
  initialSubSubs?: Option[];
}) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [subId, setSubId] = useState(initial?.subCategoryId ?? "");
  const [subSubId, setSubSubId] = useState(initial?.subSubCategoryId ?? "");
  const [subs, setSubs] = useState<Option[]>(initialSubs);
  const [subSubs, setSubSubs] = useState<Option[]>(initialSubSubs);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingSubSubs, setLoadingSubSubs] = useState(false);

  async function onCategory(id: string) {
    setCategoryId(id);
    setSubId("");
    setSubSubId("");
    setSubs([]);
    setSubSubs([]);
    if (!id) return;
    setLoadingSubs(true);
    const r = await getSubcategoryOptions(id);
    setSubs(r.success ? r.data! : []);
    setLoadingSubs(false);
  }

  async function onSub(id: string) {
    setSubId(id);
    setSubSubId("");
    setSubSubs([]);
    if (!id) return;
    setLoadingSubSubs(true);
    const r = await getSubSubcategoryOptions(id);
    setSubSubs(r.success ? r.data! : []);
    setLoadingSubSubs(false);
  }

  return (
    <>
      <div>
        <label className={labelClass}>
          Category <span className="text-error">*</span>
        </label>
        <select
          name="categoryId"
          value={categoryId}
          onChange={(e) => onCategory(e.target.value)}
          aria-invalid={!!errors?.categoryId}
          className={`${selectClass} ${errors?.categoryId ? "border-error" : "border-line"}`}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError message={errors?.categoryId} />
      </div>

      <div>
        <label className={labelClass}>
          Sub Category
          {loadingSubs && <span className="text-[11px] font-normal text-muted-soft">loading…</span>}
        </label>
        <select
          name="subCategoryId"
          value={subId}
          onChange={(e) => onSub(e.target.value)}
          disabled={!categoryId || loadingSubs}
          aria-invalid={!!errors?.subCategoryId}
          className={`${selectClass} ${errors?.subCategoryId ? "border-error" : "border-line"}`}
        >
          <option value="">
            {!categoryId ? "Choose a category first" : subs.length ? "Select sub category" : "No sub-categories"}
          </option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <FieldError message={errors?.subCategoryId} />
      </div>

      <div>
        <label className={labelClass}>
          Sub Sub Category
          {loadingSubSubs && <span className="text-[11px] font-normal text-muted-soft">loading…</span>}
        </label>
        <select
          name="subSubCategoryId"
          value={subSubId}
          onChange={(e) => setSubSubId(e.target.value)}
          disabled={!subId || loadingSubSubs}
          aria-invalid={!!errors?.subSubCategoryId}
          className={`${selectClass} ${errors?.subSubCategoryId ? "border-error" : "border-line"}`}
        >
          <option value="">
            {!subId ? "Choose a sub category first" : subSubs.length ? "Select sub sub category" : "No sub-sub-categories"}
          </option>
          {subSubs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <FieldError message={errors?.subSubCategoryId} />
      </div>
    </>
  );
}
