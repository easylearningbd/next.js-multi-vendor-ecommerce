import type { IconName } from "./Icon";

/** A leaf link inside a collapsible group. */
export type SellerNavLeaf = { label: string; href: string };

/** A sidebar entry: either a leaf link (has `href`) or a collapsible group (has `children`). */
export type SellerNavItem = {
  label: string;
  icon: IconName;
  href?: string;
  children?: SellerNavLeaf[];
};

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
    items: [
      { label: "Brands", href: "/admin/brands", icon: "tag" },
      {
        label: "Category Setup",
        icon: "layers",
        children: [
          { label: "Categories", href: "/admin/categories" },
          { label: "Sub Categories", href: "/admin/categories/sub" },
          { label: "Sub Sub Categories", href: "/admin/categories/sub-sub" },
        ],
      },
    ],
  },
];
