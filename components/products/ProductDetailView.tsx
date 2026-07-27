import Link from "next/link";
import type { ProductDetail } from "@/lib/product-types";
import { Icon } from "@/components/dashboard/Icon";
import { ProductApprovalBadge } from "./ProductApprovalBadge";
import { ProductGallery } from "./ProductGallery";
import { ProductDetailActions } from "./ProductDetailActions";

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

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold ${
        active ? "bg-success-bg text-success" : "bg-field text-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-muted-soft"}`} />
      {active ? "Active" : "Hidden"}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft py-2.5 last:border-0">
      <span className="font-sans text-[12.5px] text-muted">{label}</span>
      <span className="text-right font-sans text-[13px] font-semibold text-ink">{value}</span>
    </div>
  );
}

export function ProductDetailView({ product: p }: { product: ProductDetail }) {
  const categoryPath = [p.categoryName, p.subCategoryName, p.subSubCategoryName].filter(Boolean).join("  ›  ");
  const discountLabel =
    p.discount != null
      ? p.discountType === "PERCENT"
        ? `${Number(p.discount)}% off`
        : `${money(p.discount)} off`
      : null;

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/vendor/products"
            aria-label="Back to products"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-soft transition-colors hover:bg-field"
          >
            <Icon name="chevronLeft" size={18} strokeWidth={2} />
          </Link>
          <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Product Details</h1>
        </div>
        <ProductDetailActions id={p.id} name={p.name} />
      </div>

      {/* Overview */}
      <div className="rounded-[18px] border border-line-soft bg-surface p-[24px_26px] shadow-xs">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
          <ProductGallery thumbnail={p.thumbnail} gallery={p.gallery} alt={p.name} />

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <ProductApprovalBadge status={p.approvalStatus} />
              <ActiveBadge active={p.isActive} />
            </div>
            <h2 className="font-display text-[24px] font-extrabold leading-[1.2] tracking-[-0.01em] text-ink">
              {p.name}
            </h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-[12.5px] text-muted">
              <span>SKU: <span className="font-semibold text-ink-soft">{p.sku || "—"}</span></span>
              <span>Brand: <span className="font-semibold text-ink-soft">{p.brandName || "—"}</span></span>
            </div>
            <div className="mt-1.5 font-sans text-[12.5px] text-muted">{categoryPath}</div>

            {/* Price block */}
            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-line-soft bg-bg-subtle p-4">
              <span className="font-display text-[28px] font-extrabold leading-none text-ink">{money(p.price)}</span>
              {p.compareAtPrice && (
                <span className="mb-0.5 font-sans text-[15px] text-muted-soft line-through">{money(p.compareAtPrice)}</span>
              )}
              {discountLabel && (
                <span className="mb-1 inline-flex items-center rounded-full bg-success-bg px-2.5 py-1 font-sans text-[11.5px] font-semibold text-success">
                  {discountLabel}
                </span>
              )}
              {p.taxRate != null && (
                <span className="mb-1 ml-auto font-sans text-[12.5px] text-muted">Tax: {Number(p.taxRate)}%</span>
              )}
            </div>

            {/* Stock summary */}
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-line-soft px-4 py-3">
                <Icon name="box" size={18} strokeWidth={1.9} className="text-iris-500" />
                <div>
                  <div className="font-display text-[16px] font-bold text-ink">{p.totalStock}</div>
                  <div className="font-sans text-[11px] text-muted">
                    {p.hasVariations ? `In stock across ${p.variations.length} variations` : "In stock"}
                  </div>
                </div>
              </div>
              {p.totalStock === 0 && (
                <span className="inline-flex items-center rounded-xl bg-error-bg px-3 py-3 font-sans text-[12px] font-semibold text-error">
                  Out of stock
                </span>
              )}
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
        {p.shortDescription && (
          <p className="mb-4 font-sans text-[14px] font-medium leading-[1.6] text-ink-soft">{p.shortDescription}</p>
        )}
        <p className="whitespace-pre-wrap font-sans text-[13.5px] leading-[1.7] text-muted">{p.description}</p>
      </Card>

      {/* SEO preview */}
      <Card title="SEO Preview" icon="globe">
        <div className="rounded-xl border border-line-soft bg-bg-subtle p-4">
          <div className="font-sans text-[12px] text-success">covet.market/product/{p.slug}</div>
          <div className="mt-1 font-sans text-[16px] font-medium text-iris-600">{p.metaTitle || p.name}</div>
          <div className="mt-1 font-sans text-[13px] leading-[1.5] text-muted">
            {p.metaDescription || p.shortDescription || "No meta description set."}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <InfoRow label="Meta title" value={p.metaTitle || "—"} />
          <InfoRow label="Meta description" value={p.metaDescription ? "Set" : "—"} />
        </div>
      </Card>

      {/* Meta / record */}
      <Card title="Product Record" icon="box">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <InfoRow label="Slug" value={p.slug} />
          <InfoRow label="Total stock" value={p.totalStock} />
          <InfoRow label="Created" value={fmtDate(p.createdAt)} />
          <InfoRow label="Last updated" value={fmtDate(p.updatedAt)} />
        </div>
      </Card>
    </div>
  );
}
