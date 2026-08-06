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
      {
        label: "Product Manage",
        icon: "box",
        children: [
          { label: "Product List", href: "/vendor/products" },
          { label: "Add Product", href: "/vendor/products/add" },
        ],
      },
      {
        label: "Coupon Manage",
        icon: "ticket",
        children: [
          { label: "Coupon List", href: "/vendor/coupons" },
          { label: "Add Coupon", href: "/vendor/coupons/add" },
        ],
      },
      {
        label: "Order Manage",
        icon: "order",
        children: [
          { label: "All", href: "/vendor/orders" },
          { label: "Pending", href: "/vendor/orders?status=pending" },
          { label: "Confirmed", href: "/vendor/orders?status=confirmed" },
          { label: "Packaging", href: "/vendor/orders?status=packaging" },
          { label: "Out for delivery", href: "/vendor/orders?status=out-for-delivery" },
          { label: "Delivered", href: "/vendor/orders?status=delivered" },
          { label: "Returned", href: "/vendor/orders?status=returned" },
          { label: "Failed To Deliver", href: "/vendor/orders?status=failed-to-deliver" },
          { label: "Canceled", href: "/vendor/orders?status=canceled" },
        ],
      },
      {
        label: "Report Manage",
        icon: "chart",
        children: [
          { label: "Transactions Report", href: "/vendor/reports/transactions" },
          { label: "Product Report", href: "/vendor/reports/products" },
          { label: "Order Report", href: "/vendor/reports/orders" },
        ],
      },
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
      {
        label: "Vendor Manage",
        icon: "store",
        children: [
          { label: "Vendor Approval", href: "/admin/vendors/approval" },
          { label: "Add New Vendor", href: "/admin/vendors/add" },
          { label: "Vendor List", href: "/admin/vendors" },
        ],
      },
      {
        label: "Product Manage",
        icon: "box",
        children: [
          { label: "Pending Product", href: "/admin/products/pending" },
          { label: "Approved Product", href: "/admin/products/approved" },
          { label: "Denied Product", href: "/admin/products/denied" },
          { label: "Featured Product", href: "/admin/products/featured" },
          { label: "Popular Product", href: "/admin/products/popular" },
        ],
      },
    ],
  },
];
