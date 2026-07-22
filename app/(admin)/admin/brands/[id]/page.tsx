import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { SellerShell } from "@/components/dashboard/SellerShell";
import { adminNav } from "@/components/dashboard/navConfig";
import { Icon, type IconName } from "@/components/dashboard/Icon";
import { BrandStatusBadge } from "@/components/brands/BrandStatusBadge";
import { BrandDetailActions } from "@/components/brands/BrandDetailActions";
import { getBrand } from "../actions";

export const metadata: Metadata = { title: "Brand details — Covet Admin" };

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default async function BrandViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session!.user;

  const res = await getBrand(id);
  if (!res.success || !res.data) notFound();
  const brand = res.data;

  const stats: { label: string; value: number; icon: IconName; tone: string }[] = [
    { label: "Total products", value: brand.productCount, icon: "box", tone: "bg-iris-50 text-iris-500" },
    { label: "Active products", value: brand.activeProducts, icon: "delivered", tone: "bg-success-bg text-success" },
    { label: "Inactive products", value: brand.inactiveProducts, icon: "canceled", tone: "bg-line-soft text-muted" },
  ];

  return (
    <SellerShell
      variant="admin"
      userName={user.name ?? "Admin"}
      userEmail={user.email ?? ""}
      signOutTo="/admin/login"
      setupPercent={38}
      showSearch
      notifCount={12}
      nav={adminNav}
      breadcrumb={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Brands", href: "/admin/brands" },
        { label: brand.name },
      ]}
    >
      <div className="flex flex-col gap-[22px]">
        {/* Header card */}
        <div className="rounded-2xl border border-line-soft bg-surface p-[24px_26px] shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 items-center gap-5">
              <div className="h-[92px] w-[92px] flex-none overflow-hidden rounded-xl border border-line-soft bg-field">
                {brand.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brand.image} alt={brand.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-muted-soft">
                    <Icon name="image" size={30} strokeWidth={1.6} />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="m-0 truncate font-display text-[26px] font-extrabold tracking-[-0.01em] text-ink">
                    {brand.name}
                  </h1>
                  <BrandStatusBadge status={brand.status} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-sans text-[12.5px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <Icon name="tag" size={14} strokeWidth={1.9} className="text-muted-soft" />
                    <span className="font-mono">{brand.slug}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="calendar" size={14} strokeWidth={1.9} className="text-muted-soft" />
                    Created {formatDate(brand.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <BrandDetailActions brand={brand} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between gap-3 rounded-2xl border border-line-soft bg-surface p-[20px_22px] shadow-xs"
            >
              <div>
                <div className="font-sans text-[12.5px] text-muted">{s.label}</div>
                <div className="mt-2.5 font-display text-[26px] font-extrabold text-ink">{s.value}</div>
              </div>
              <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-md ${s.tone}`}>
                <Icon name={s.icon} size={22} strokeWidth={1.8} />
              </span>
            </div>
          ))}
        </div>

        {/* Products under this brand */}
        <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-iris-50 text-iris-500">
              <Icon name="box" size={16} strokeWidth={2} />
            </span>
            <span className="font-display text-[16px] font-bold text-ink">Products</span>
            <span className="flex h-[22px] min-w-[26px] items-center justify-center rounded-full bg-line-soft px-2 font-display text-[12px] font-bold text-ink-soft">
              {brand.productCount}
            </span>
          </div>

          {brand.products.length === 0 ? (
            <div className="flex flex-col items-center px-8 py-16 text-center">
              <span className="mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl bg-iris-50 text-iris-400">
                <Icon name="box" size={34} strokeWidth={1.6} />
              </span>
              <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">No products yet</div>
              <p className="mx-auto mt-3 max-w-[360px] font-sans text-[14px] leading-[1.5] text-muted">
                Products assigned to this brand will appear here once the catalog is built.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[640px] overflow-hidden rounded-lg border border-line-soft">
                <div className="grid grid-cols-[44px_minmax(200px,1.6fr)_120px_120px_80px] gap-3.5 bg-field p-[14px_18px] font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                  <span>#</span>
                  <span>Product</span>
                  <span>Price</span>
                  <span>Status</span>
                  <span className="text-right">View</span>
                </div>
                {brand.products.map((p, i) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[44px_minmax(200px,1.6fr)_120px_120px_80px] items-center gap-3.5 border-t border-line-soft p-[12px_18px] hover:bg-bg-subtle"
                  >
                    <span className="font-sans text-[13px] text-muted">{i + 1}</span>
                    <span className="truncate font-sans text-[13.5px] font-semibold text-ink">{p.name}</span>
                    <span className="font-display text-[13.5px] font-bold text-ink">${p.price.toFixed(2)}</span>
                    <span className="font-sans text-[13px] text-ink-soft">{p.status}</span>
                    <span className="text-right">
                      <a
                        href={`/admin/products/${p.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-success-bg bg-[#f1fbf6] text-success hover:brightness-95"
                        aria-label={`View ${p.name}`}
                      >
                        <Icon name="eye" size={15} strokeWidth={2} />
                      </a>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SellerShell>
  );
}
