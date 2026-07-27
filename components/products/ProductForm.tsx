"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createProduct, updateProduct } from "@/app/(seller)/vendor/(dashboard)/products/actions";
import { IMAGE_ACCEPT_ATTR } from "@/lib/product-validation";
import type { ActionResult, ProductFormInitial, ProductFormOptions } from "@/lib/product-types";
import { Icon } from "@/components/dashboard/Icon";
import { DependentCategorySelects } from "./DependentCategorySelects";
import { VariationBuilder, variationKey, type VariationRow } from "./VariationBuilder";

const inputBase =
  "h-[46px] w-full rounded-xl border bg-bg-subtle px-3.5 font-sans text-[13.5px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]";
const labelClass = "mb-2 flex items-center gap-1.5 font-sans text-[12.5px] font-semibold text-ink-soft";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 font-sans text-[12px] text-error">{message}</p>;
}
function Req() {
  return <span className="text-error">*</span>;
}
function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-line-soft bg-surface p-[26px_28px] shadow-xs">
      <div className="mb-5">
        <div className="font-display text-[18px] font-bold text-ink">{title}</div>
        <div className="mt-2 font-sans text-[13px] text-muted">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

type State = ActionResult<{ id: string; approvalReset?: boolean }> | undefined;

export function ProductForm({
  options,
  mode,
  productId,
  initial,
}: {
  options: ProductFormOptions;
  mode: "create" | "edit";
  productId?: string;
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const action = (
    mode === "edit" && productId ? updateProduct.bind(null, productId) : createProduct
  ) as (prev: State, fd: FormData) => Promise<State>;
  const [state, formAction, pending] = useActionState<State, FormData>(action, undefined);
  const errors = state?.fieldErrors;

  const [price, setPrice] = useState(initial?.price ?? "");
  const [hasVariations, setHasVariations] = useState(initial?.hasVariations ?? false);
  const [rows, setRows] = useState<VariationRow[]>(
    () =>
      initial?.variations.map((v) => ({
        key: variationKey(v.attributes),
        id: v.id,
        name: v.name,
        attributes: v.attributes,
        price: v.price,
        stock: v.stock,
        sku: v.sku,
        image: null,
        preview: v.image,
        existingImage: v.image,
      })) ?? [],
  );
  const [existingGallery, setExistingGallery] = useState<string[]>(initial?.gallery ?? []);
  const [gallery, setGallery] = useState<{ file: File; preview: string }[]>([]);
  const [thumbPreview, setThumbPreview] = useState<string | null>(initial?.thumbnail ?? null);
  const [thumbIsNew, setThumbIsNew] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);
  const thumbUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state.success && state.data?.id) {
      if (mode === "edit") {
        toast.success(
          state.data.approvalReset
            ? "Product updated — sent back for admin review."
            : "Product updated.",
        );
      } else {
        toast.success("Product created — pending admin approval.");
      }
      router.push("/vendor/products");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, mode]);

  function pickThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (thumbUrl.current) URL.revokeObjectURL(thumbUrl.current);
    thumbUrl.current = URL.createObjectURL(f);
    setThumbPreview(thumbUrl.current);
    setThumbIsNew(true);
  }
  function removeThumb() {
    if (thumbUrl.current) URL.revokeObjectURL(thumbUrl.current);
    thumbUrl.current = null;
    if (thumbRef.current) thumbRef.current.value = "";
    // In edit, "removing" a freshly-picked file reverts to the existing thumbnail.
    if (mode === "edit" && initial?.thumbnail) {
      setThumbPreview(initial.thumbnail);
      setThumbIsNew(false);
    } else {
      setThumbPreview(null);
      setThumbIsNew(false);
    }
  }
  function addGallery(files: FileList | null) {
    if (!files) return;
    setGallery((g) => [...g, ...Array.from(files).map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  }
  function removeGallery(idx: number) {
    setGallery((g) => {
      URL.revokeObjectURL(g[idx].preview);
      return g.filter((_, i) => i !== idx);
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (mode === "create") {
      const t = fd.get("thumbnail");
      if (!(t instanceof File) || t.size === 0) {
        toast.error("Please upload a product thumbnail.");
        return;
      }
    }
    if (!fd.get("categoryId")) {
      toast.error("Please choose a category.");
      return;
    }
    if (hasVariations && rows.length === 0) {
      toast.error("Add at least one variation, or turn variations off.");
      return;
    }

    fd.set("keptGallery", JSON.stringify(existingGallery));
    gallery.forEach((g) => fd.append("gallery", g.file));

    fd.set("hasVariations", hasVariations ? "true" : "false");
    fd.set(
      "variations",
      JSON.stringify(
        rows.map((r, i) => ({
          id: r.id ?? null,
          name: r.name,
          attributes: r.attributes,
          price: r.price,
          stock: r.stock,
          sku: r.sku,
          imageIndex: r.image ? i : -1,
          keepImage: !r.image && !!r.existingImage,
        })),
      ),
    );
    rows.forEach((r, i) => {
      if (r.image) fd.append(`varImage_${i}`, r.image);
    });

    formAction(fd);
  }

  const dropZone =
    "flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#d6d4dd] bg-bg-subtle p-5 text-center transition-colors hover:border-iris-500";
  const showThumbRemove = mode === "create" ? !!thumbPreview : thumbIsNew;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[22px]">
      {/* Basic Setup */}
      <Card title="Basic Setup" subtitle="Set up the core product information shown on the website.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                Product Name <Req />
              </label>
              <input
                id="name"
                name="name"
                defaultValue={initial?.name}
                placeholder="New product"
                aria-invalid={!!errors?.name}
                className={`${inputBase} ${errors?.name ? "border-error" : "border-line"}`}
              />
              <FieldError message={errors?.name} />
            </div>
            <div>
              <label htmlFor="shortDescription" className={labelClass}>
                Short Description
              </label>
              <input
                id="shortDescription"
                name="shortDescription"
                defaultValue={initial?.shortDescription}
                placeholder="One-line summary (optional)"
                className={`${inputBase} border-line`}
              />
              <FieldError message={errors?.shortDescription} />
            </div>
            <div>
              <label htmlFor="description" className={labelClass}>
                Description <Req />
              </label>
              <textarea
                id="description"
                name="description"
                defaultValue={initial?.description}
                placeholder="Describe your product…"
                aria-invalid={!!errors?.description}
                className={`min-h-[150px] w-full resize-y rounded-xl border bg-bg-subtle px-3.5 py-3 font-sans text-[13.5px] leading-[1.5] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)] ${
                  errors?.description ? "border-error" : "border-line"
                }`}
              />
              <FieldError message={errors?.description} />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="rounded-xl border border-line-soft p-5 text-center">
            <div className="font-display text-[14px] font-bold text-ink">
              Product Thumbnail <Req />
            </div>
            <div className="mb-4 mt-2 font-sans text-[12px] text-muted">Upload image</div>
            <input ref={thumbRef} type="file" name="thumbnail" accept={IMAGE_ACCEPT_ATTR} onChange={pickThumb} className="hidden" />
            {thumbPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbPreview} alt="Thumbnail" className="h-[150px] w-full object-contain" />
                <div className="absolute right-2 top-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => thumbRef.current?.click()}
                    className="rounded-md border border-line bg-surface px-2.5 py-1 font-sans text-[11px] font-semibold text-ink-soft shadow-xs"
                  >
                    Replace
                  </button>
                  {showThumbRemove && (
                    <button
                      type="button"
                      onClick={removeThumb}
                      className="rounded-md border border-error-bg bg-error-bg px-2.5 py-1 font-sans text-[11px] font-semibold text-error"
                    >
                      {mode === "edit" ? "Undo" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => thumbRef.current?.click()} className={dropZone}>
                <Icon name="image" size={26} strokeWidth={1.7} className="text-muted-soft" />
                <span className="font-sans text-[11px] font-medium text-iris-500">Click to upload or drag & drop</span>
              </button>
            )}
            <div className="mt-3 font-sans text-[11px] text-muted-soft">JPEG, PNG or WebP · Max 2MB</div>
            <FieldError message={errors?.thumbnail} />
          </div>
        </div>
      </Card>

      {/* General Setup */}
      <Card title="General Setup" subtitle="Foundational details required for product creation.">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <DependentCategorySelects
            categories={options.categories}
            errors={errors}
            initial={
              initial
                ? {
                    categoryId: initial.categoryId,
                    subCategoryId: initial.subCategoryId,
                    subSubCategoryId: initial.subSubCategoryId,
                  }
                : undefined
            }
            initialSubs={initial?.subOptions}
            initialSubSubs={initial?.subSubOptions}
          />
          <div>
            <label htmlFor="brandId" className={labelClass}>
              Brand
            </label>
            <select id="brandId" name="brandId" defaultValue={initial?.brandId ?? ""} className={`${inputBase} border-line`}>
              <option value="">Select brand</option>
              {options.brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <FieldError message={errors?.brandId} />
          </div>
          <div>
            <label htmlFor="sku" className={labelClass}>
              Product SKU
            </label>
            <input id="sku" name="sku" defaultValue={initial?.sku} placeholder="e.g. ABC-123" className={`${inputBase} border-line`} />
            <FieldError message={errors?.sku} />
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card title="Pricing & Stock" subtitle="Set the price and stock information for the product.">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="price" className={labelClass}>
              Unit Price ($) <Req />
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              aria-invalid={!!errors?.price}
              className={`${inputBase} ${errors?.price ? "border-error" : "border-line"}`}
            />
            <FieldError message={errors?.price} />
          </div>
          <div>
            <label htmlFor="compareAtPrice" className={labelClass}>
              Compare-at Price ($)
            </label>
            <input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initial?.compareAtPrice}
              placeholder="0.00"
              aria-invalid={!!errors?.compareAtPrice}
              className={`${inputBase} ${errors?.compareAtPrice ? "border-error" : "border-line"}`}
            />
            <FieldError message={errors?.compareAtPrice} />
          </div>
          <div>
            <label htmlFor="discount" className={labelClass}>
              Discount
            </label>
            <div className="flex gap-2.5">
              <input
                id="discount"
                name="discount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initial?.discount}
                placeholder="0"
                className={`${inputBase} border-line`}
              />
              <select name="discountType" defaultValue={initial?.discountType ?? "AMOUNT"} className={`${inputBase} w-[120px] border-line`}>
                <option value="AMOUNT">Flat</option>
                <option value="PERCENT">Percent</option>
              </select>
            </div>
            <FieldError message={errors?.discount} />
          </div>
          <div>
            <label htmlFor="taxRate" className={labelClass}>
              Tax Rate (%)
            </label>
            <input
              id="taxRate"
              name="taxRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={initial?.taxRate}
              placeholder="0"
              aria-invalid={!!errors?.taxRate}
              className={`${inputBase} ${errors?.taxRate ? "border-error" : "border-line"}`}
            />
            <FieldError message={errors?.taxRate} />
          </div>
          {!hasVariations ? (
            <div>
              <label htmlFor="stock" className={labelClass}>
                Current Stock Qty <Req />
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                step="1"
                min="0"
                defaultValue={initial?.stock ?? "0"}
                aria-invalid={!!errors?.stock}
                className={`${inputBase} ${errors?.stock ? "border-error" : "border-line"}`}
              />
              <FieldError message={errors?.stock} />
            </div>
          ) : (
            <div className="flex items-end">
              <p className="rounded-xl border border-iris-100 bg-iris-50 px-4 py-3 font-sans text-[12px] leading-[1.5] text-accent-fg">
                Stock is managed per variation below.
              </p>
              <input type="hidden" name="stock" value="0" />
            </div>
          )}
        </div>
      </Card>

      {/* Variation Setup */}
      <Card title="Product Variation Setup" subtitle="Enable and manage different variations of a product.">
        <VariationBuilder
          enabled={hasVariations}
          setEnabled={setHasVariations}
          rows={rows}
          setRows={setRows}
          defaultPrice={price}
          error={errors?.variations}
        />
      </Card>

      {/* Gallery */}
      <Card title="Product Additional Images" subtitle="Upload extra images for this product (optional).">
        <div className="flex flex-wrap gap-3.5">
          {existingGallery.map((url, i) => (
            <div key={url} className="relative h-[110px] w-[110px] overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setExistingGallery((g) => g.filter((_, idx) => idx !== i))}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-error-bg text-error"
              >
                <Icon name="x" size={12} strokeWidth={2.4} />
              </button>
            </div>
          ))}
          {gallery.map((g, i) => (
            <div key={i} className="relative h-[110px] w-[110px] overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeGallery(i)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-error-bg text-error"
              >
                <Icon name="x" size={12} strokeWidth={2.4} />
              </button>
            </div>
          ))}
          <label className="flex h-[110px] w-[110px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[#d6d4dd] bg-bg-subtle text-center transition-colors hover:border-iris-500">
            <Icon name="plus" size={20} strokeWidth={2} className="text-muted-soft" />
            <span className="font-sans text-[10.5px] font-medium text-iris-500">Add image</span>
            <input type="file" accept={IMAGE_ACCEPT_ATTR} multiple onChange={(e) => addGallery(e.target.files)} className="hidden" />
          </label>
        </div>
      </Card>

      {/* SEO */}
      <Card title="SEO Section" subtitle="Help people find this product on search engines.">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="metaTitle" className={labelClass}>
              Meta Title
            </label>
            <input id="metaTitle" name="metaTitle" defaultValue={initial?.metaTitle} placeholder="Meta title" className={`${inputBase} border-line`} />
            <FieldError message={errors?.metaTitle} />
          </div>
          <div>
            <label htmlFor="metaDescription" className={labelClass}>
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              defaultValue={initial?.metaDescription}
              placeholder="Meta description"
              className="min-h-[100px] w-full resize-y rounded-xl border border-line bg-bg-subtle px-3.5 py-3 font-sans text-[13.5px] leading-[1.5] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]"
            />
            <FieldError message={errors?.metaDescription} />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/vendor/products")}
          className="h-12 rounded-xl border border-line bg-surface px-7 font-sans text-[14px] font-semibold text-ink-soft transition-colors hover:bg-field"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-iris-500 px-9 font-display text-[14px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending && <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Submit product"}
        </button>
      </div>
    </form>
  );
}
