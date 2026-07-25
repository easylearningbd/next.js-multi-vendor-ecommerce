import type { Metadata } from "next";
import { Icon } from "@/components/dashboard/Icon";
import { AddVendorForm } from "@/components/vendors/AddVendorForm";

export const metadata: Metadata = { title: "Add New Vendor — Covet Admin" };

export default function AddVendorPage() {
  return (
    <div>
      <div className="mb-[22px] flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-iris-50 text-iris-500">
          <Icon name="store" size={20} strokeWidth={1.9} />
        </span>
        <h1 className="m-0 font-display text-[24px] font-extrabold tracking-[-0.01em] text-ink">Add New Vendor</h1>
      </div>
      <AddVendorForm />
    </div>
  );
}
