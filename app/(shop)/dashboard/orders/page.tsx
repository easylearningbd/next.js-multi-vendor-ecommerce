import Link from "next/link";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { auth } from "@/auth";
import { Icon } from "@/components/dashboard/Icon";
import {
  getCustomerOrders,
  ORDER_STATUS_FILTERS,
} from "@/lib/shop/customer-orders";
import { OrderCard } from "@/components/dashboard/orders/OrderCard";
import { OrderListControls } from "@/components/dashboard/orders/OrderListControls";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; status?: string; page?: string }>;

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/dashboard/orders");

  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const status = ORDER_STATUS_FILTERS.includes(sp.status as OrderStatus)
    ? (sp.status as OrderStatus)
    : undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const hasFilters = Boolean(q || status);

  const { orders, total, totalPages } = await getCustomerOrders(session.user.id, {
    q,
    status,
    page,
  });

  // Preserve q/status across pagination links.
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/dashboard/orders?${qs}` : "/dashboard/orders";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
            My Orders <span className="font-semibold text-muted-soft">({total})</span>
          </h1>
          <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
        </div>
        <OrderListControls />
      </div>

      {orders.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order.orderNumber} order={order} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className="flex h-9 items-center gap-1 rounded-lg border border-line px-3 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
                >
                  <Icon name="chevronLeft" size={14} strokeWidth={2.2} />
                  Prev
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 font-sans text-[13px] font-semibold transition-colors ${
                    p === page
                      ? "bg-iris-500 text-white"
                      : "border border-line text-ink-soft hover:border-iris-500 hover:text-iris-500"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={pageHref(page + 1)}
                  className="flex h-9 items-center gap-1 rounded-lg border border-line px-3 font-sans text-[13px] font-medium text-ink-soft transition-colors hover:border-iris-500 hover:text-iris-500"
                >
                  Next
                  <Icon name="chevronRight" size={14} strokeWidth={2.2} />
                </Link>
              )}
            </nav>
          )}
        </>
      ) : hasFilters ? (
        // Empty — no results for the active filter/search
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <span className="mb-5 flex size-[72px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
            <Icon name="search" size={32} strokeWidth={1.7} />
          </span>
          <div className="font-display text-[19px] font-bold text-ink">No matching orders</div>
          <p className="mx-auto mt-2.5 max-w-[340px] font-sans text-sm text-muted">
            No orders match your search or filter. Try clearing them.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        // Empty — the customer has no orders at all
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
            <Icon name="bag" size={34} strokeWidth={1.6} />
          </span>
          <div className="font-display text-[20px] font-bold text-ink">No orders yet</div>
          <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
            When you place an order across our sellers, it&apos;ll show up here so you can track
            it.
          </p>
          <Link
            href="/"
            className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            Start shopping
          </Link>
        </div>
      )}
    </div>
  );
}
