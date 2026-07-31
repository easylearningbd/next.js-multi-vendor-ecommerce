"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminProductFilter, AdminProductListItem, Option } from "@/lib/admin-product-types";
import { Icon } from "@/components/dashboard/Icon";
import { BrandsPagination } from "@/components/brands/BrandsPagination";
import { AdminProductStatusBadge } from "./AdminProductStatusBadge";
import { AdminProductsToolbar } from "./AdminProductsToolbar";

type Config = {
  title: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  emptyTitle: string;
  emptyText: string;
};

// One place that maps each filter to its heading + empty-state copy — so the same
// component powers all five admin product lists (Part 4 just passes a different filter).
const CONFIG: Record<AdminProductFilter, Config> = {
  PENDING: { title: "Pending Products", icon: "pending", emptyTitle: "No pending products", emptyText: "There are no products awaiting review right now." },
  APPROVED: { title: "Approved Products", icon: "check", emptyTitle: "No approved products", emptyText: "No products have been approved yet." },
  REJECTED: { title: "Denied Products", icon: "canceled", emptyTitle: "No denied products", emptyText: "No products have been denied." },
  FEATURED: { title: "Featured Products", icon: "star", emptyTitle: "No featured products", emptyText: "Mark products as Featured from their details page." },
  POPULAR: { title: "Popular Products", icon: "trendUp", emptyTitle: "No popular products", emptyText: "Mark products as Popular from their details page." },
};

const GRID =
  "grid-cols-[44px_minmax(190px,1.7fr)_minmax(120px,1fr)_minmax(110px,1fr)_92px_112px_92px_84px]";

export function AdminProductsList({
  filter,
  products,
  total,
  page,
  pageSize,
  totalPages,
  hasFilters,
  errored,
  categories,
}: {
  filter: AdminProductFilter;
  products: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasFilters: boolean;
  errored: boolean;
  categories: Option[];
}) {
  const router = useRouter();
  const cfg = CONFIG[filter];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
          <Icon name={cfg.icon} size={20} strokeWidth={1.9} />
        </span>
        <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">{cfg.title}</h1>
        <span className="flex h-[26px] min-w-[30px] items-center justify-center rounded-full bg-line-soft px-2.5 font-display text-[13px] font-bold text-ink-soft">
          {total}
        </span>
      </div>

      <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
        <AdminProductsToolbar categories={categories} />

        {errored ? (
          <StateBlock
            tone="error"
            icon="alert"
            title="Couldn't load products"
            text="Something went wrong while loading products. Please try again."
            action={
              <button type="button" onClick={() => router.refresh()} className="flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600">
                <Icon name="refresh" size={16} strokeWidth={2} />
                Try again
              </button>
            }
          />
        ) : products.length === 0 ? (
          hasFilters ? (
            <StateBlock tone="empty" icon="search" title="No products match your filters" text="Try a different search or clear the category filter." />
          ) : (
            <StateBlock tone="empty" icon={cfg.icon} title={cfg.emptyTitle} text={cfg.emptyText} />
          )
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[920px] overflow-hidden rounded-xl border border-line-soft">
                <div className={`grid ${GRID} gap-3.5 bg-field p-[14px_18px] font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted`}>
                  <span>#</span>
                  <span>Product</span>
                  <span>Vendor</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Submitted</span>
                  <span>Status</span>
                  <span className="text-right">Details</span>
                </div>

                {products.map((p, i) => (
                  <div key={p.id} className={`grid ${GRID} items-center gap-3.5 border-t border-line-soft p-[12px_18px] transition-colors hover:bg-bg-subtle`}>
                    <span className="font-sans text-[13px] text-muted">{(page - 1) * pageSize + i + 1}</span>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-[44px] w-[44px] flex-none overflow-hidden rounded-lg border border-line-soft bg-field">
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
                        <div className="truncate font-sans text-[13.5px] font-semibold text-ink">{p.name}</div>
                        <div className="mt-1 flex items-center gap-1.5 truncate font-sans text-[11px] text-muted-soft">
                          {p.sku ? `SKU ${p.sku}` : `Id #${p.id.slice(-6)}`}
                          {p.isFeatured && <span className="rounded bg-iris-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-iris-500">Featured</span>}
                          {p.isPopular && <span className="rounded bg-warning-bg px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-warning">Popular</span>}
                        </div>
                      </div>
                    </div>
                    <span className="truncate font-sans text-[12.5px] font-medium text-iris-500">{p.vendorName}</span>
                    <span className="truncate font-sans text-[13px] text-ink-soft">{p.categoryName}</span>
                    <span className="font-display text-[13.5px] font-bold text-ink">{p.price}</span>
                    <span className="font-sans text-[12px] text-muted">{p.submittedLabel}</span>
                    <span>
                      <AdminProductStatusBadge status={p.approvalStatus} />
                    </span>
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/products/${p.id}`}
                        aria-label={`View ${p.name}`}
                        className="flex h-8 items-center gap-1.5 rounded-md border border-iris-100 bg-iris-50 px-3 font-sans text-[12px] font-semibold text-iris-500 transition-colors hover:bg-iris-100"
                      >
                        <Icon name="eye" size={14} strokeWidth={2} />
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BrandsPagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
          </>
        )}
      </div>
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
      <span className={`mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl ${tone === "error" ? "bg-error-bg text-error" : "bg-iris-50 text-iris-400"}`}>
        <Icon name={icon} size={34} strokeWidth={1.7} />
      </span>
      <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">{title}</div>
      <p className="mx-auto mb-6 mt-3 max-w-[340px] font-sans text-[14px] leading-[1.5] text-muted">{text}</p>
      {action}
    </div>
  );
}
