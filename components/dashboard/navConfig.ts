import type { IconName } from "./Icon";

export type SellerNavItem = { label: string; href: string; icon: IconName };
export type SellerNavSection = { label: string; items: SellerNavItem[] };

export const vendorNav: SellerNavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/vendor/dashboard", icon: "dash" },
      { label: "POS", href: "#", icon: "pos" },
    ],
  },
];

export const adminNav: SellerNavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "dash" }],
  },
  {
    label: "Catalog",
    items: [{ label: "Brands", href: "/admin/brands", icon: "tag" }],
  },
];
