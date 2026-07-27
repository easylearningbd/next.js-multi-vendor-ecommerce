"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductListItem } from "@/lib/product-types";
import { Icon } from "@/components/dashboard/Icon";
import { BrandsPagination } from "@/components/brands/BrandsPagination";
import { ProductApprovalBadge } from "./ProductApprovalBadge";
import { ProductActiveToggle } from "./ProductActiveToggle";
import { ProductsToolbar } from "./ProductsToolbar";
import { DeleteProductModal } from "./DeleteProductModal";

const GRID =
  "grid-cols-[46px_minmax(220px,1.6fr)_minmax(120px,1fr)_100px_84px_116px_72px_120px]";

export function ProductsListManager({
  products,
  total,
  page,
  pageSize,
  totalPages,
  hasFilters,
  errored,
}: {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasFilters: boolean;
  errored: boolean;
}) {
  const router = useRouter();
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
            <Icon name="box" size={20} strokeWidth={1.9} />
          </span>
          <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">
            Product List
          </h1>
          <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[13px] font-bold text-ink-soft">
            {total}
          </span>
        </div>
        <Link
          href="/vendor/products/add"
          className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="plus" size={17} strokeWidth={2.2} />
          Add new product
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
        <ProductsToolbar />

        {errored ? (
          <StateBlock
            tone="error"
            icon="alert"
            title="Couldn't load products"
            text="Something went wrong while loading your product list. Please try again."
            action={
              <button
                type="button"
                onClick={() => router.refresh()}
                className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
              >
                <Icon name="refresh" size={16} strokeWidth={2} />
                Try again
              </button>
            }
          />
        ) : products.length === 0 ? (
          hasFilters ? (
            <StateBlock
              tone="empty"
              icon="search"
              title="No products match your filters"
              text="Try a different search or clear the status filter."
            />
          ) : (
            <StateBlock
              tone="empty"
              icon="box"
              title="No products yet"
              text="You haven't listed any products. Add your first product to start selling."
              action={
                <Link
                  href="/vendor/products/add"
                  className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
                >
                  <Icon name="plus" size={16} strokeWidth={2.2} />
                  Add new product
                </Link>
              }
            />
          )
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[900px] overflow-hidden rounded-xl border border-line-soft">
                <div
                  className={`grid ${GRID} gap-3.5 bg-field p-[14px_18px] font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}
                >
                  <span>#</span>
                  <span>Product</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Stock</span>
                  <span>Approval</span>
                  <span>Active</span>
                  <span className="text-right">Action</span>
                </div>

                {products.map((p, i) => (
                  <div
                    key={p.id}
                    className={`grid ${GRID} items-center gap-3.5 border-t border-line-soft p-[12px_18px] transition-colors hover:bg-bg-subtle`}
                  >
                    <span className="font-sans text-[13px] text-muted">
                      {(page - 1) * pageSize + i + 1}
                    </span>

                    {/* Product: thumbnail + name + id/sku */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-[46px] w-[46px] flex-none overflow-hidden rounded-lg border border-line-soft bg-field">
                        {p.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-muted-soft">
                            <Icon name="box" size={18} strokeWidth={1.8} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-sans text-[13.5px] font-semibold text-ink">
                          {p.name}
                        </div>
                        <div className="mt-1 truncate font-sans text-[11px] text-muted-soft">
                          {p.sku ? `SKU ${p.sku}` : `Id #${p.id.slice(-6)}`}
                        </div>
                      </div>
                    </div>

                    <span className="truncate font-sans text-[13px] text-ink-soft">{p.categoryName}</span>
                    <span className="font-display text-[13.5px] font-bold text-ink">{p.price}</span>
                    <span className="font-sans text-[13px] text-ink-soft">
                      {p.stock}
                      {p.hasVariations && (
                        <span className="ml-1 text-[10.5px] text-muted-soft">(variants)</span>
                      )}
                    </span>
                    <span>
                      <ProductApprovalBadge status={p.approvalStatus} />
                    </span>
                    <span>
                      <ProductActiveToggle id={p.id} initial={p.isActive} name={p.name} />
                    </span>

                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/vendor/products/${p.id}`}
                        aria-label={`View ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-success-bg bg-success-bg text-success transition-[filter] hover:brightness-95"
                      >
                        <Icon name="eye" size={15} strokeWidth={2} />
                      </Link>
                      <Link
                        href={`/vendor/products/${p.id}/edit`}
                        aria-label={`Edit ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-iris-100 bg-iris-50 text-iris-500 transition-colors hover:bg-iris-100"
                      >
                        <Icon name="edit" size={15} strokeWidth={2} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete({ id: p.id, name: p.name })}
                        aria-label={`Delete ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-error-bg bg-error-bg text-error transition-[filter] hover:brightness-95"
                      >
                        <Icon name="trash" size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BrandsPagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
          </>
        )}
      </div>

      <DeleteProductModal product={toDelete} onClose={() => setToDelete(null)} />
    </>
  );
}

function StateBlock({
  tone,
  icon,
  title,
  text,
  action,
}: {
  tone: "empty" | "error";
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <span
        className={`mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl ${
          tone === "error" ? "bg-error-bg text-error" : "bg-iris-50 text-iris-400"
        }`}
      >
        <Icon name={icon} size={34} strokeWidth={1.7} />
      </span>
      <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">{title}</div>
      <p className="mx-auto mb-6 mt-3 max-w-[340px] font-sans text-[14px] leading-[1.5] text-muted">{text}</p>
      {action}
    </div>
  );
}
