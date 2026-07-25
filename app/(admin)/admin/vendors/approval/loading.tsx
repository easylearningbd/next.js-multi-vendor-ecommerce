// Content-area skeleton for the Vendor Approval list.
export default function VendorApprovalLoading() {
  return (
    <div>
      <div className="mb-5 h-8 w-48 animate-pulse rounded-md bg-line-soft" />
      <div className="rounded-2xl border border-line-soft bg-surface p-[22px_24px] shadow-xs">
        <div className="mb-5 flex gap-3.5">
          <div className="h-[46px] flex-1 animate-pulse rounded-md bg-line-soft" />
          <div className="h-[46px] w-32 animate-pulse rounded-md bg-line-soft" />
        </div>
        <div className="overflow-hidden rounded-lg border border-line-soft">
          <div className="h-11 bg-field" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-line-soft p-[14px_18px]">
              <div className="h-3 w-6 flex-none animate-pulse rounded bg-line-soft" />
              <div className="h-3 flex-1 animate-pulse rounded bg-line-soft" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-line-soft" />
              <div className="h-8 w-8 animate-pulse rounded-md bg-line-soft" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
