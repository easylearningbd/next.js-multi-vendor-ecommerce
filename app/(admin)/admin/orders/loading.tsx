export default function AdminOrdersLoading() {
  return (
    <div>
      <div className="mb-[22px] h-8 w-48 animate-pulse rounded bg-line-soft" />
      <div className="mb-[22px] rounded-[18px] border border-line-soft bg-surface p-6">
        <div className="mb-[18px] h-5 w-52 animate-pulse rounded bg-line-soft" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[68px] animate-pulse rounded-[14px] bg-line-soft" />
          ))}
        </div>
      </div>
      <div className="rounded-[18px] border border-line-soft bg-surface p-6">
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
