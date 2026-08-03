import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";

export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
        <Icon name="bag" size={34} strokeWidth={1.6} />
      </span>
      <div className="font-display text-[20px] font-bold text-ink">Order not found</div>
      <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
        We couldn&apos;t find the details for this order. It may not exist, or it isn&apos;t
        part of your account.
      </p>
      <Link
        href="/dashboard/orders"
        className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
      >
        Back to My Orders
      </Link>
    </div>
  );
}
