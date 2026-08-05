export default function VendorOrdersLoading() {
  return (
    <div>
      <div className="mb-5 h-7 w-40 animate-pulse rounded bg-line-soft" />
      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[66px] animate-pulse rounded-[14px] bg-line-soft" />
        ))}
      </div>
      <div className="rounded-[18px] border border-line-soft bg-surface p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line-soft py-4 last:border-b-0">
            <div className="h-3 w-8 animate-pulse rounded bg-line-soft" />
            <div className="h-3 w-20 animate-pulse rounded bg-line-soft" />
            <div className="h-3 flex-1 animate-pulse rounded bg-line-soft" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-line-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
