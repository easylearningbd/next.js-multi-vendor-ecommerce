import Link from "next/link";
import type { AdminProductDetail } from "@/lib/admin-product-types";
import { Icon } from "@/components/dashboard/Icon";
import { ProductGallery } from "@/components/products/ProductGallery";
import { AdminProductStatusBadge } from "./AdminProductStatusBadge";
import { AdminProductActions } from "./AdminProductActions";
import { AdminFlagToggles } from "./AdminFlagToggles";

const money = (s: string) => `$${Number(s).toFixed(2)}`;
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);

function Card({ title, icon, children }: { title: string; icon: React.ComponentProps<typeof Icon>["name"]; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-line-soft bg-surface p-[24px_26px] shadow-xs">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-iris-50 text-iris-500">
          <Icon name={icon} size={17} strokeWidth={2} />
        </span>
        <span className="font-display text-[16px] font-bold text-ink">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-2 font-sans text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

export function AdminProductDetailView({ product: p }: { product: AdminProductDetail }) {
  const categoryPath = [p.categoryName, p.subCategoryName, p.subSubCategoryName].filter(Boolean).join("  ›  ");
  const discountLabel =
    p.discount != null ? (p.discountType === "PERCENT" ? `${Number(p.discount)}% off` : `${money(p.discount)} off`) : null;

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products/pending" aria-label="Back to products" className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-soft transition-colors hover:bg-field">
            <Icon name="chevronLeft" size={18} strokeWidth={2} />
          </Link>
          <div>
            <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Product Details</h1>
            <div className="mt-1.5 font-sans text-[12.5px] text-muted-soft">Submitted {fmtDate(p.createdAt)}</div>
          </div>
        </div>
        <AdminProductActions id={p.id} name={p.name} status={p.approvalStatus} />
      </div>

      {/* Overview */}
      <div className="rounded-[18px] border border-line-soft bg-surface p-[24px_26px] shadow-xs">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          <div className="flex flex-col gap-5">
            <ProductGallery thumbnail={p.thumbnail} gallery={p.gallery} alt={p.name} />
            {/* Store card */}
            <div className="rounded-2xl border border-line-soft p-5 text-center">
              <div className="font-display text-[15px] font-bold text-ink">{p.vendorName}</div>
              <div className="mt-1.5 font-sans text-[12px] text-muted">{p.vendorProductCount} products</div>
              <Link
                href={`/admin/vendors/${p.vendorId}`}
                className="mt-3.5 inline-flex h-[42px] items-center justify-center rounded-xl bg-iris-500 px-6 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
              >
                View vendor
              </Link>
            </div>
            {/* Admin storefront flags */}
            <AdminFlagToggles id={p.id} isFeatured={p.isFeatured} isPopular={p.isPopular} />
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <AdminProductStatusBadge status={p.approvalStatus} />
              {p.isFeatured && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-iris-50 px-2.5 py-1 font-sans text-[11px] font-semibold text-iris-500">
                  <Icon name="star" size={12} strokeWidth={2} /> Featured
                </span>
              )}
              {p.isPopular && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 font-sans text-[11px] font-semibold text-warning">
                  <Icon name="trendUp" size={12} strokeWidth={2} /> Popular
                </span>
              )}
              {!p.isActive && (
                <span className="inline-flex items-center rounded-full bg-field px-2.5 py-1 font-sans text-[11px] font-semibold text-muted">Hidden</span>
              )}
            </div>
            <h2 className="font-display text-[24px] font-extrabold leading-[1.2] tracking-[-0.01em] text-ink">{p.name}</h2>

            {p.shortDescription && (
              <p className="mt-3 font-sans text-[14px] font-medium leading-[1.6] text-ink-soft">{p.shortDescription}</p>
            )}

            {/* Price block */}
            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-line-soft bg-bg-subtle p-4">
              <span className="font-display text-[28px] font-extrabold leading-none text-ink">{money(p.price)}</span>
              {p.compareAtPrice && <span className="mb-0.5 font-sans text-[15px] text-muted-soft line-through">{money(p.compareAtPrice)}</span>}
              {discountLabel && (
                <span className="mb-1 inline-flex items-center rounded-full bg-success-bg px-2.5 py-1 font-sans text-[11.5px] font-semibold text-success">{discountLabel}</span>
              )}
              {p.taxRate != null && <span className="mb-1 ml-auto font-sans text-[12.5px] text-muted">Tax: {Number(p.taxRate)}%</span>}
            </div>

            {/* Info grid */}
            <div className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div className="divide-y divide-line-soft">
                <Info label="Seller" value={<Link href={`/admin/vendors/${p.vendorId}`} className="text-iris-500 hover:text-iris-600">{p.vendorName}</Link>} />
                <Info label="Brand" value={p.brandName || "—"} />
                <Info label="Category" value={categoryPath} />
              </div>
              <div className="divide-y divide-line-soft">
                <Info label="SKU" value={p.sku || "—"} />
                <Info label="Stock" value={`${p.totalStock}${p.hasVariations ? ` (${p.variations.length} variations)` : ""}`} />
                <Info label="Slug" value={p.slug} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variations */}
      {p.hasVariations && (
        <Card title={`Variations (${p.variations.length})`} icon="grid">
          <div className="overflow-x-auto">
            <div className="min-w-[640px] overflow-hidden rounded-xl border border-line-soft">
              <div className="grid grid-cols-[64px_minmax(140px,1.4fr)_110px_90px_1fr] gap-3 bg-field p-[12px_16px] font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                <span>Image</span>
                <span>Combination</span>
                <span>Price</span>
                <span>Stock</span>
                <span>SKU</span>
              </div>
              {p.variations.map((v) => (
                <div key={v.id} className="grid grid-cols-[64px_minmax(140px,1.4fr)_110px_90px_1fr] items-center gap-3 border-t border-line-soft p-[10px_16px]">
                  <div className="h-11 w-11 overflow-hidden rounded-lg border border-line-soft bg-field">
                    {v.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.image} alt={v.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-muted-soft">
                        <Icon name="image" size={16} strokeWidth={1.8} />
                      </span>
                    )}
                  </div>
                  <span className="font-sans text-[13px] font-semibold text-ink">{v.name}</span>
                  <span className="font-display text-[13px] font-bold text-ink">{money(v.price)}</span>
                  <span className="font-sans text-[13px] text-ink-soft">{v.stock}</span>
                  <span className="font-sans text-[12.5px] text-muted">{v.sku || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Description */}
      <Card title="Description" icon="edit">
        <p className="whitespace-pre-wrap font-sans text-[13.5px] leading-[1.7] text-muted">{p.description}</p>
      </Card>

      {/* SEO */}
      <Card title="Product SEO & meta data" icon="globe">
        <div className="rounded-xl border border-line-soft bg-bg-subtle p-4">
          <div className="font-sans text-[12px] text-success">covet.market/product/{p.slug}</div>
          <div className="mt-1 font-sans text-[16px] font-medium text-iris-600">{p.metaTitle || p.name}</div>
          <div className="mt-1 font-sans text-[13px] leading-[1.5] text-muted">
            {p.metaDescription || p.shortDescription || "No meta description set."}
          </div>
        </div>
      </Card>

      {/* Product Reviews — PLACEHOLDER. The reviews table/logic renders here later.
          TODO(reviews): fetch + render product reviews (reviewer, rating, review, reply,
          date, status, actions) once the review system is built. Do NOT build it now. */}
      <Card title="Product Reviews" icon="star">
        <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-bg-subtle px-6 py-12 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-iris-50 text-iris-400">
            <Icon name="message" size={22} strokeWidth={1.7} />
          </span>
          <div className="font-display text-[15px] font-bold text-ink">Reviews coming soon</div>
          <p className="mx-auto mt-2 max-w-[360px] font-sans text-[13px] leading-[1.5] text-muted">
            Customer reviews for this product will appear here once the review system is available.
          </p>
        </div>
      </Card>
    </div>
  );
}
