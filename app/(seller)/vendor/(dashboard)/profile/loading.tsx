// Initial-load skeleton for the vendor profile (shown while the server fetches
// the User + Vendor data). Mirrors the page's header + two cards.
export default function VendorProfileLoading() {
  return (
    <div>
      {/* header */}
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-[38px] w-[38px] animate-pulse rounded-[11px] bg-line-soft" />
          <div className="h-8 w-56 animate-pulse rounded-md bg-line-soft" />
        </div>
        <div className="h-11 w-40 animate-pulse rounded-md bg-line-soft" />
      </div>

      {/* Basic Information card (cover + avatar + fields) */}
      <div className="mb-[22px] overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-xs">
        <div className="h-[180px] animate-pulse bg-line-soft" />
        <div className="px-[30px] pb-[30px] pt-[64px]">
          <div className="mb-6 h-4 w-40 animate-pulse rounded bg-line-soft" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2.5 h-3.5 w-2/5 animate-pulse rounded bg-line-soft" />
                <div className="h-[50px] animate-pulse rounded-xl bg-line-soft" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store Information card */}
      <div className="rounded-[18px] border border-line-soft bg-surface p-[26px_28px] shadow-xs">
        <div className="mb-6 h-4 w-44 animate-pulse rounded bg-line-soft" />
        <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2.5 h-3.5 w-2/5 animate-pulse rounded bg-line-soft" />
              <div className="h-[50px] animate-pulse rounded-xl bg-line-soft" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
