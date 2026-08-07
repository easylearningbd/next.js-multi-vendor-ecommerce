import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { formatMoney } from "@/lib/shop/pricing";
import { getAdminCustomer } from "@/lib/admin/customers";
import { Icon } from "@/components/dashboard/Icon";
import { OrderStatusBadge } from "@/components/dashboard/orders/OrderStatusBadge";
import { ReviewStatusBadge } from "@/components/admin-reviews/ReviewStatusBadge";

export const metadata: Metadata = { title: "Customer Details — Covet Admin" };
export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });

export default async function AdminCustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN", "/admin/login");

  const { id } = await params;
  const customer = await getAdminCustomer(id);
  if (!customer) notFound();

  const addr = customer.address;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-iris-50 text-iris-500">
            <Icon name="user" size={19} strokeWidth={2} />
          </span>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">Customer Details</h1>
        </div>
        <Link
          href="/admin/customers"
          className="flex h-10 items-center gap-1.5 rounded-[11px] border border-line px-3.5 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
        >
          <Icon name="chevronLeft" size={14} strokeWidth={2.2} />
          All customers
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[340px_1fr]">
        {/* Left: profile + address */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="flex items-center gap-3.5">
              <span className="flex size-14 flex-none items-center justify-center overflow-hidden rounded-full bg-iris-50 font-display text-[22px] font-bold text-iris-500">
                {customer.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={customer.image} alt={customer.name} className="h-full w-full object-cover" />
                ) : (
                  customer.name.charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <div className="truncate font-display text-[17px] font-bold text-ink">{customer.name}</div>
                <span className="mt-1 inline-flex items-center rounded-full bg-success-bg px-2.5 py-0.5 font-sans text-[11px] font-semibold text-success">
                  Active
                </span>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-line-soft pt-4 font-sans text-[13px]">
              <div className="flex items-start gap-2.5">
                <Icon name="mail" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span className="break-all text-ink-soft">{customer.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="phone" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span className="text-ink-soft">{customer.phone ?? "—"}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="calendar" size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-muted-soft" />
                <span className="text-ink-soft">Joined {DATE_FMT.format(customer.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Address (from latest order, if any) */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-3 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <Icon name="pin" size={16} strokeWidth={2} className="text-iris-500" />
              Address
            </div>
            {addr ? (
              <div className="font-sans text-[13px] leading-[1.6] text-ink-soft">
                <div className="font-semibold text-ink">{addr.shipName}</div>
                <div>{addr.shipAddress}</div>
                <div>
                  {addr.shipCity} {addr.shipZip}
                </div>
                <div>{addr.shipCountry}</div>
                <div className="mt-1 text-muted">{addr.shipPhone}</div>
                <div className="mt-2 font-sans text-[11px] text-muted-soft">From their most recent order.</div>
              </div>
            ) : (
              <p className="font-sans text-[13px] text-muted">No address on file yet (no orders placed).</p>
            )}
          </div>
        </div>

        {/* Right: order history + reviews */}
        <div className="flex flex-col gap-5">
          {/* Summary tiles */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile icon="order" label="Total Orders" value={String(customer.orderCount)} />
            <StatTile icon="wallet" label="Total Spent" value={formatMoney(customer.totalSpent)} />
            <StatTile icon="star" label="Reviews" value={String(customer.reviews.length)} />
          </div>

          {/* Recent orders */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 font-display text-[15px] font-bold text-ink">Recent Orders</div>
            {customer.recentOrders.length > 0 ? (
              <div className="flex flex-col">
                {customer.recentOrders.map((o) => (
                  <div
                    key={o.orderNumber}
                    className="flex items-center justify-between gap-3 border-b border-line-soft py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${o.orderNumber}`}
                        className="font-display text-[13px] font-bold text-iris-500 hover:text-iris-600"
                      >
                        {o.orderNumber}
                      </Link>
                      <div className="mt-0.5 font-sans text-[11.5px] text-muted-soft">
                        {DATE_FMT.format(o.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={o.status} />
                      <span className="font-display text-[13.5px] font-bold text-ink">
                        {formatMoney(o.grandTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-[13px] text-muted">No orders yet.</p>
            )}
          </div>

          {/* Reviews written */}
          <div className="rounded-[16px] border border-line-soft bg-surface p-6">
            <div className="mb-4 font-display text-[15px] font-bold text-ink">Reviews Written</div>
            {customer.reviews.length > 0 ? (
              <div className="flex flex-col gap-3">
                {customer.reviews.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 border-b border-line-soft pb-3 last:border-b-0">
                    <span className="flex size-10 flex-none items-center justify-center overflow-hidden rounded-[9px] bg-field text-muted-soft">
                      {r.productThumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.productThumbnail} alt={r.productName} className="h-full w-full object-cover" />
                      ) : (
                        <Icon name="image" size={16} strokeWidth={1.7} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/admin/reviews/${r.id}`}
                          className="truncate font-sans text-[13px] font-semibold text-ink hover:text-iris-500"
                        >
                          {r.productName}
                        </Link>
                        <ReviewStatusBadge status={r.status} />
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Icon
                              key={n}
                              name="star"
                              size={11}
                              className={n <= r.rating ? "text-star" : "text-line"}
                            />
                          ))}
                        </span>
                        <span className="font-sans text-[11px] text-muted-soft">
                          {DATE_FMT.format(r.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 font-sans text-[12px] leading-[1.4] text-ink-soft">
                        {r.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-[13px] text-muted">This customer hasn&apos;t written any reviews.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: "order" | "wallet" | "star"; label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-line-soft bg-surface p-5">
      <span className="flex size-9 items-center justify-center rounded-[10px] bg-iris-50 text-iris-500">
        <Icon name={icon} size={17} strokeWidth={1.9} />
      </span>
      <div className="mt-3 font-display text-[20px] font-extrabold text-ink">{value}</div>
      <div className="mt-1 font-sans text-[12px] text-muted">{label}</div>
    </div>
  );
}
