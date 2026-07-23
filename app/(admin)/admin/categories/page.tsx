import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Categories — Covet Admin" };

export default function CategoriesPage() {
  return (
    <ComingSoon
      title="Categories"
      subtitle="Manage top-level product categories for the marketplace."
      icon="layers"
    />
  );
}
