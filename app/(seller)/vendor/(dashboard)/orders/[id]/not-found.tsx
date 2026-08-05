import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

export default function VendorOrderNotFound() {
  return (
    <div className="flex flex-col items-center rounded-[18px] border border-dashed border-line bg-surface px-8 py-16 text-center">
      <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
        <Icon name="order" size={34} strokeWidth={1.6} />
      </span>
      <div className="font-display text-[20px] font-bold text-ink">Order not found</div>
      <p className="mx-auto mt-3 max-w-[360px] font-sans text-sm leading-[1.5] text-muted">
        This order doesn&apos;t exist, or it isn&apos;t one of your store&apos;s sub-orders.
      </p>
      <Link
        href="/vendor/orders"
        className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
      >
        Back to orders
      </Link>
    </div>
  );
}
