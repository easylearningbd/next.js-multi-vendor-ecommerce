import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/dashboard/Icon";
import { getWishlistItems } from "@/lib/shop/wishlist";
import { WishlistItemRow } from "@/components/shop/wishlist/WishlistItemRow";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/dashboard/wishlist");

  const items = await getWishlistItems(session.user.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
          Wishlist <span className="font-semibold text-muted-soft">({items.length})</span>
        </h1>
        <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {items.map((item) => (
            <WishlistItemRow key={item.product.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <span className="mb-5 flex size-[78px] items-center justify-center rounded-[22px] bg-iris-50 text-iris-400">
            <Icon name="heartLine" size={34} strokeWidth={1.6} />
          </span>
          <div className="font-display text-[20px] font-bold text-ink">Your wishlist is empty</div>
          <p className="mx-auto mt-3 max-w-[340px] font-sans text-sm leading-[1.5] text-muted">
            Tap the heart on any product to save it here and buy it later.
          </p>
          <Link
            href="/"
            className="mt-6 flex h-11 items-center rounded-xl bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            Discover products
          </Link>
        </div>
      )}
    </div>
  );
}
