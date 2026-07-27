// Skeleton while the Add Product form's options (categories/brands) load.
export default function AddProductLoading() {
  return (
    <div>
      <div className="mb-[22px] h-8 w-52 animate-pulse rounded-md bg-line-soft" />
      {[260, 180, 180, 150, 140].map((h, i) => (
        <div
          key={i}
          style={{ height: h }}
          className="mb-[22px] animate-pulse rounded-[18px] bg-line-soft"
        />
      ))}
    </div>
  );
}
