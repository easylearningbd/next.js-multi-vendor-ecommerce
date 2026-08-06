export default function AdminOrderDetailsLoading() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="h-8 w-56 animate-pulse rounded bg-line-soft" />
        <div className="h-10 w-28 animate-pulse rounded-[11px] bg-line-soft" />
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <div className="h-[280px] animate-pulse rounded-[16px] bg-line-soft" />
          <div className="h-[180px] animate-pulse rounded-[16px] bg-line-soft" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-[220px] animate-pulse rounded-[16px] bg-line-soft" />
          <div className="h-[150px] animate-pulse rounded-[16px] bg-line-soft" />
          <div className="h-[150px] animate-pulse rounded-[16px] bg-line-soft" />
        </div>
      </div>
    </div>
  );
}
