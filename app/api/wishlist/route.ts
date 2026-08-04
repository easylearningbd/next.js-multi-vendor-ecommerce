import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWishlistProductIds } from "@/lib/shop/wishlist";

// Hydrates the client WishlistProvider: the signed-in customer's wishlisted
// product ids (one query), or an empty list for guests. Session-scoped.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ isLoggedIn: false, ids: [] });
  }
  const ids = await getWishlistProductIds(session.user.id);
  return NextResponse.json({ isLoggedIn: true, ids });
}
