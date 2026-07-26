import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VendorProfileForm } from "@/components/dashboard/VendorProfileForm";
import { Icon } from "@/components/dashboard/Icon";

export const metadata: Metadata = { title: "Profile Information — Covet Seller" };

// Keep the page dynamic — it reflects the signed-in vendor's own data.
export const dynamic = "force-dynamic";

function Header() {
  return (
    <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-iris-50 text-iris-500">
          <Icon name="user" size={20} strokeWidth={1.9} />
        </span>
        <h1 className="m-0 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
          Profile Information
        </h1>
      </div>
      <Link
        href="/vendor/dashboard"
        className="flex h-11 items-center gap-2 rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
      >
        <Icon name="home" size={17} strokeWidth={2} />
        Dashboard
      </Link>
    </div>
  );
}

function StateCard({
  tone,
  icon,
  title,
  text,
}: {
  tone: "empty" | "error";
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  text: string;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-[18px] border bg-surface px-8 py-[72px] text-center ${
        tone === "error" ? "border-[#f6d9da]" : "border-dashed border-line"
      }`}
    >
      <span
        className={`mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-[22px] ${
          tone === "error" ? "bg-error-bg text-error" : "bg-iris-50 text-iris-400"
        }`}
      >
        <Icon name={icon} size={34} strokeWidth={1.7} />
      </span>
      <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">{title}</div>
      <p className="mx-auto mt-3 max-w-[360px] font-sans text-[14px] leading-[1.5] text-muted">{text}</p>
    </div>
  );
}

function certDisplayName(key: string): string {
  const ext = key.includes(".") ? key.slice(key.lastIndexOf(".")) : "";
  return `tin-certificate${ext.toLowerCase()}`;
}

export default async function VendorProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  let record: {
    name: string;
    email: string;
    phone: string | null;
    vendor: {
      storeName: string;
      address: string | null;
      tinNumber: string | null;
      tinExpireDate: Date | null;
      logo: string | null;
      coverImage: string | null;
      tinCertificate: string | null;
    } | null;
  } | null;

  try {
    record = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        vendor: {
          select: {
            storeName: true,
            address: true,
            tinNumber: true,
            tinExpireDate: true,
            logo: true,
            coverImage: true,
            tinCertificate: true,
          },
        },
      },
    });
  } catch {
    return (
      <div>
        <Header />
        <StateCard
          tone="error"
          icon="alert"
          title="Couldn't load your profile"
          text="Something went wrong while loading your details. Please refresh and try again."
        />
      </div>
    );
  }

  if (!record?.vendor) {
    return (
      <div>
        <Header />
        <StateCard
          tone="empty"
          icon="store"
          title="Store profile not available"
          text="We couldn't find a store linked to your account. Contact support if you believe this is an error."
        />
      </div>
    );
  }

  const v = record.vendor;
  const data = {
    name: record.name ?? "",
    email: record.email ?? "",
    phone: record.phone ?? "",
    storeName: v.storeName ?? "",
    address: v.address ?? "",
    tinNumber: v.tinNumber ?? "",
    tinExpireDate: v.tinExpireDate ? v.tinExpireDate.toISOString().slice(0, 10) : "",
    logo: v.logo,
    coverImage: v.coverImage,
    tinCertificateName: v.tinCertificate ? certDisplayName(v.tinCertificate) : null,
    tinCertificateUrl: v.tinCertificate ? "/vendor/profile/tin" : null,
  };

  return (
    <div>
      <Header />
      <VendorProfileForm data={data} />
    </div>
  );
}
