import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutFlow } from "@/components/shop/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout — Covet",
};

export default async function CheckoutPage() {
  // Pre-fill the shipping contact fields from the logged-in user's profile.
  // (No saved-address model yet — everyone still fills in the address.)
  const session = await auth();
  let defaultContact:
    | { name?: string | null; email?: string | null; phone?: string | null }
    | undefined;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    });
    if (user) defaultContact = user;
  }

  return <CheckoutFlow defaultContact={defaultContact} />;
}
