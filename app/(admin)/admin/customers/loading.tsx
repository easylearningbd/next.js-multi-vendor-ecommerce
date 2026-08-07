export default function AdminCustomersLoading() {
  return (
    <div>
      <div className="mb-[22px] h-8 w-48 animate-pulse rounded bg-line-soft" />
      <div className="rounded-[18px] border border-line-soft bg-surface p-6">
        <div className="mb-5 h-11 w-72 animate-pulse rounded-[11px] bg-line-soft" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line-soft py-4 last:border-b-0">
            <div className="size-10 flex-none animate-pulse rounded-full bg-line-soft" />
            <div className="h-3 flex-1 animate-pulse rounded bg-line-soft" />
            <div className="h-3 w-24 animate-pulse rounded bg-line-soft" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-line-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
