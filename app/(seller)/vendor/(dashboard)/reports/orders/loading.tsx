export default function VendorOrderReportLoading() {
  return (
    <div>
      <div className="mb-[22px] h-9 w-52 animate-pulse rounded bg-line-soft" />
      <div className="mb-[22px] h-[112px] animate-pulse rounded-[18px] bg-line-soft" />
      <div className="mb-[22px] grid grid-cols-1 gap-[22px] lg:grid-cols-[300px_1fr_300px]">
        <div className="flex flex-col gap-[22px]">
          <div className="h-[168px] animate-pulse rounded-[18px] bg-line-soft" />
          <div className="h-[104px] animate-pulse rounded-[18px] bg-line-soft" />
        </div>
        <div className="h-[420px] animate-pulse rounded-[18px] bg-line-soft" />
        <div className="h-[420px] animate-pulse rounded-[18px] bg-line-soft" />
      </div>
      <div className="rounded-[18px] border border-line-soft bg-surface p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line-soft py-4 last:border-b-0">
            <div className="h-3 w-8 animate-pulse rounded bg-line-soft" />
            <div className="h-3 w-24 animate-pulse rounded bg-line-soft" />
            <div className="h-3 flex-1 animate-pulse rounded bg-line-soft" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-line-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
