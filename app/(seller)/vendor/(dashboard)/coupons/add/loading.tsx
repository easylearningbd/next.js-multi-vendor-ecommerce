// Skeleton while the Add Coupon form's product list loads.
export default function AddCouponLoading() {
  return (
    <div>
      <div className="mb-[22px] h-9 w-40 animate-pulse rounded-md bg-line-soft" />
      <div className="rounded-[18px] border border-line-soft bg-surface p-[26px_28px] shadow-xs">
        <div className="mb-6 h-5 w-40 animate-pulse rounded bg-line-soft" />
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-3.5 w-2/5 animate-pulse rounded bg-line-soft" />
              <div className="h-[48px] animate-pulse rounded-xl bg-line-soft" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
