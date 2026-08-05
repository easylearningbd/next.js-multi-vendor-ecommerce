export default function VendorOrderDetailLoading() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-7 w-44 animate-pulse rounded bg-line-soft" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-line-soft" />
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div className="h-[320px] animate-pulse rounded-[16px] bg-line-soft" />
        <div className="h-[280px] animate-pulse rounded-[16px] bg-line-soft" />
      </div>
    </div>
  );
}
