import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Sub Categories — Covet Admin" };

export default function SubCategoriesPage() {
  return (
    <ComingSoon
      title="Sub Categories"
      subtitle="Manage second-level categories nested under each category."
      icon="layers"
    />
  );
}
