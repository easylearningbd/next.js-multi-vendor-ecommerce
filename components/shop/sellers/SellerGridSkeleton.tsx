/** Loading skeleton for the seller grid (Suspense fallback). */
export function SellerGridSkeleton() {
  return (
    <div>
      <div className="mb-5 h-4 w-32 animate-pulse rounded bg-line-soft" />
      <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[18px] border border-line-soft bg-surface">
            <div className="h-24 animate-pulse bg-line-soft" />
            <div className="px-5 pb-5">
              <div className="-mt-8 size-[66px] animate-pulse rounded-2xl border-4 border-surface bg-line-soft" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-line-soft" />
              <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-line-soft" />
              <div className="mt-[18px] h-11 w-full animate-pulse rounded-[11px] bg-line-soft" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
