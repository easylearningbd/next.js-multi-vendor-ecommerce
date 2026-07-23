import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Sub Sub Categories — Covet Admin" };

export default function SubSubCategoriesPage() {
  return (
    <ComingSoon
      title="Sub Sub Categories"
      subtitle="Manage third-level categories nested under each sub category."
      icon="layers"
    />
  );
}
