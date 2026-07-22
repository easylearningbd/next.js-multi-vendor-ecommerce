// Loading skeleton for the Brands list (shown while the server fetches / on
// search, filter and pagination navigations).
export default function BrandsLoading() {
  return (
    <div className="min-h-screen bg-bg-dash">
      <div className="h-16 border-b border-line bg-surface" />
      <div className="mx-auto w-full max-w-[1280px] p-[26px]">
        <div className="mb-5 flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded-md bg-line-soft" />
          <div className="h-[46px] w-32 animate-pulse rounded-md bg-line-soft" />
        </div>
        <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
          <div className="mb-5 flex gap-3.5">
            <div className="h-[46px] flex-1 animate-pulse rounded-md bg-line-soft" />
            <div className="h-[46px] w-36 animate-pulse rounded-md bg-line-soft" />
            <div className="h-[46px] w-32 animate-pulse rounded-md bg-line-soft" />
          </div>
          <div className="overflow-hidden rounded-lg border border-line-soft">
            <div className="h-11 bg-field" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-t border-line-soft p-[14px_18px]">
                <div className="h-[46px] w-[46px] flex-none animate-pulse rounded-md bg-line-soft" />
                <div className="h-3 flex-1 animate-pulse rounded bg-line-soft" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-line-soft" />
                <div className="h-8 w-24 animate-pulse rounded-md bg-line-soft" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
