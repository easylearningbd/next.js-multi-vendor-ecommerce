// Content-area skeleton for the Coupon List.
export default function CouponListLoading() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded-md bg-line-soft" />
        <div className="h-[44px] w-36 animate-pulse rounded-md bg-line-soft" />
      </div>
      <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
        <div className="mb-5 flex gap-3">
          <div className="h-[44px] flex-1 animate-pulse rounded-md bg-line-soft" />
          <div className="h-[44px] w-36 animate-pulse rounded-md bg-line-soft" />
          <div className="h-[44px] w-32 animate-pulse rounded-md bg-line-soft" />
        </div>
        <div className="overflow-hidden rounded-xl border border-line-soft">
          <div className="h-11 bg-field" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-line-soft p-[16px_18px]">
              <div className="h-3 w-8 animate-pulse rounded bg-line-soft" />
              <div className="h-3 flex-1 animate-pulse rounded bg-line-soft" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-line-soft" />
              <div className="h-8 w-8 animate-pulse rounded-md bg-line-soft" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
