import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/dashboard/Icon";
import { formatMoney } from "@/lib/shop/pricing";
import { getTrackedOrder, type TrackedOrder } from "@/lib/shop/tracking";
import { OrderStatusBadge } from "@/components/dashboard/orders/OrderStatusBadge";
import { TrackingStepper } from "@/components/shop/tracking/TrackingStepper";

export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const session = await auth();
  // Login required — tracking is scoped to the customer's own orders (privacy).
  if (!session?.user?.id) redirect("/login?next=/dashboard/track-order");

  const sp = await searchParams;
  const query = (sp.order ?? "").trim();
  // Scoped lookup — null for a non-owner / missing id (no existence leak).
  const tracked = query ? await getTrackedOrder(query, session.user.id) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
          Track Order
        </h1>
        <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
      </div>

      {/* Lookup box — GET so the server-side, session-scoped lookup runs on submit */}
      <form method="get" className="mb-6 rounded-2xl border border-line-soft bg-bg-subtle p-6">
        <label htmlFor="order" className="mb-2.5 block font-sans text-[13px] font-semibold text-ink-soft">
          Enter your Order ID
        </label>
        <div className="flex flex-wrap gap-3">
          <div className="flex h-[50px] min-w-[240px] flex-1 items-center overflow-hidden rounded-xl border border-line bg-surface focus-within:border-iris-500 focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]">
            <span className="pl-3.5 text-muted-soft">
              <Icon name="bag" size={18} strokeWidth={2} />
            </span>
            <input
              id="order"
              name="order"
              defaultValue={query}
              placeholder="e.g. CVT-7F3K9A"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-3 font-sans text-sm font-medium text-ink outline-none placeholder:text-muted-soft"
            />
          </div>
          <button
            type="submit"
            className="h-[50px] rounded-xl bg-iris-500 px-7 font-display text-sm font-bold text-white transition-colors hover:bg-iris-600"
          >
            Track
          </button>
        </div>
      </form>

      {!query ? (
        <TrackPrompt />
      ) : tracked ? (
        <TrackedResult order={tracked} />
      ) : (
        <NotFound />
      )}
    </div>
  );
}

function TrackPrompt() {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <span className="mb-5 flex size-[72px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
        <Icon name="truck" size={32} strokeWidth={1.6} />
      </span>
      <div className="font-display text-[18px] font-bold text-ink">Track your order</div>
      <p className="mx-auto mt-2.5 max-w-[360px] font-sans text-[13.5px] leading-[1.5] text-muted">
        Enter one of your order numbers above to see its shipment progress for every seller.
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
        <Icon name="search" size={34} strokeWidth={1.6} />
      </span>
      <div className="font-display text-[20px] font-bold text-ink">Order not found</div>
      <p className="mx-auto mt-3 max-w-[360px] font-sans text-sm leading-[1.5] text-muted">
        We couldn&apos;t find an order with that number in your account. Double-check the
        number from your confirmation and try again.
      </p>
    </div>
  );
}

function TrackedResult({ order }: { order: TrackedOrder }) {
  const itemCount = order.subOrders.reduce(
    (sum, s) => sum + s.items.reduce((n, i) => n + i.qty, 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Order summary + shipping address */}
      <div className="rounded-2xl border border-line-soft bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-display text-base font-bold text-ink">Order {order.orderNumber}</div>
          <div className="font-sans text-[12.5px] text-muted-soft">
            Placed {DATE_FMT.format(order.createdAt)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"} · {order.subOrders.length}{" "}
            {order.subOrders.length === 1 ? "seller" : "sellers"}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2 border-t border-line-soft pt-4 font-sans text-[13px]">
          <span className="text-muted-soft">Name</span>
          <span className="text-ink">{order.shipName}</span>
          <span className="text-muted-soft">Phone</span>
          <span className="text-ink">{order.shipPhone}</span>
          <span className="text-muted-soft">Address</span>
          <span className="text-ink">
            {order.shipAddress}, {order.shipCity} {order.shipZip}, {order.shipCountry}
          </span>
        </div>
      </div>

      {/* One tracker per sub-order (per vendor) — each at its OWN stage */}
      {order.subOrders.map((sub) => {
        const subItems = sub.items.reduce((n, i) => n + i.qty, 0);
        return (
          <div key={sub.id} className="overflow-hidden rounded-2xl border border-line-soft">
            {/* Vendor header */}
            <div className="flex flex-wrap items-center gap-3 border-b border-line-soft bg-field px-6 py-4">
              <span className="flex size-9 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface text-iris-500">
                {sub.vendor.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sub.vendor.logo} alt={sub.vendor.storeName} className="h-full w-full object-cover" />
                ) : (
                  <Icon name="store" size={17} strokeWidth={1.9} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-sans text-[9.5px] font-semibold uppercase tracking-[0.07em] text-muted">
                  Sold by
                </div>
                <Link
                  href={`/sellers/${sub.vendor.slug}`}
                  className="font-display text-sm font-bold text-ink hover:text-iris-500"
                >
                  {sub.vendor.storeName}
                </Link>
              </div>
              <span className="font-sans text-[12px] text-muted-soft">
                {subItems} {subItems === 1 ? "item" : "items"}
              </span>
              <OrderStatusBadge status={sub.status} />
            </div>

            {/* Items + this vendor's shipment progress */}
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_300px]">
              <div className="flex flex-col gap-3.5">
                {sub.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5">
                    <div className="flex size-14 flex-none items-center justify-center overflow-hidden rounded-[11px] bg-field text-muted-soft">
                      {item.product?.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.thumbnail} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <Icon name="image" size={18} strokeWidth={1.7} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.product?.slug ? (
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="line-clamp-2 font-sans text-[13.5px] font-medium leading-[1.3] text-ink hover:text-iris-500"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <span className="line-clamp-2 font-sans text-[13.5px] font-medium leading-[1.3] text-ink">
                          {item.productName}
                        </span>
                      )}
                      {item.variantLabel && (
                        <div className="mt-1 font-sans text-[12px] text-muted">{item.variantLabel}</div>
                      )}
                      <div className="mt-1 font-sans text-[12px] text-muted-soft">
                        Qty {item.qty} · {formatMoney(item.lineTotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:border-l lg:border-line-soft lg:pl-6">
                <div className="mb-4 font-display text-sm font-bold text-ink">Shipment progress</div>
                <TrackingStepper status={sub.status} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
