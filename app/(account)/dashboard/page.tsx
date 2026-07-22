import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StoreHeader, StoreFooter } from "@/components/storefront/StorefrontChrome";
import { AccountSidebar } from "@/components/dashboard/AccountSidebar";
import { CustomerProfileForm } from "@/components/dashboard/CustomerProfileForm";
import { StateProvider, StateTabs, StateView } from "@/components/dashboard/PreviewPanel";
import { Icon, type IconName } from "@/components/dashboard/Icon";

const helpCards: { title: string; sub: string; icon: IconName }[] = [
  { title: "About us", sub: "Know more about our company", icon: "building" },
  { title: "Contact Us", sub: "We are here to help", icon: "chat" },
  { title: "FAQ", sub: "Get all your answers", icon: "help" },
  { title: "Blog", sub: "Check our latest posts", icon: "blog" },
];

export default async function CustomerDashboardPage() {
  const session = await auth();
  const user = session!.user;
  const record = user.id
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true, phone: true } })
    : null;

  const fullName = record?.name ?? user.name ?? "";
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  const email = record?.email ?? user.email ?? "";
  const phone = record?.phone ?? "";

  const loading = (
    <>
      <div className="my-8 flex flex-col items-center">
        <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-line-soft" />
        <div className="mt-4 h-4 w-[120px] animate-pulse rounded bg-line-soft" />
      </div>
      <div className="mx-auto grid max-w-[840px] grid-cols-1 gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="mb-2.5 h-3 w-2/5 animate-pulse rounded bg-line-soft" />
            <div className="h-[50px] animate-pulse rounded-md bg-line-soft" />
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <StoreHeader name={fullName} />

      {/* breadcrumb */}
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-6 pt-5 font-sans text-[13px] text-muted-soft lg:px-10">
        <Link href="/" className="text-muted">
          Home
        </Link>
        <Icon name="chevronRight" size={14} strokeWidth={2} className="text-[#c6c4ce]" />
        <span className="font-semibold text-ink">My Dashboard</span>
      </div>

      {/* main */}
      <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 items-start gap-6 px-6 pt-5 lg:grid-cols-[300px_1fr] lg:px-10">
        <AccountSidebar name={fullName || "Your account"} email={email} />

        <div className="min-h-[640px] rounded-2xl border border-line-soft bg-surface p-6 shadow-xs sm:p-[32px_36px_40px]">
          <StateProvider>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">Profile Info</h1>
                <div className="mt-3 h-[3px] w-11 rounded-sm bg-iris-500" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="hidden font-sans text-[12px] text-muted-soft sm:inline">Preview state</span>
                <StateTabs />
              </div>
            </div>
            <StateView
              loading={loading}
              empty={{
                title: "Profile not set up yet",
                text: "Complete your profile so sellers can ship to you and personalize your marketplace experience.",
                actionLabel: "Complete profile",
              }}
              error={{
                title: "Couldn't load your profile",
                text: "Something went wrong while fetching your account details. Please try again.",
              }}
            >
              <div className="pt-5">
                <CustomerProfileForm firstName={firstName} lastName={lastName} email={email} phone={phone} />
              </div>
            </StateView>
          </StateProvider>
        </div>
      </main>

      {/* help cards */}
      <section className="mx-auto w-full max-w-[1600px] px-6 pt-14 lg:px-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {helpCards.map((h) => (
            <Link
              key={h.title}
              href="/"
              className="flex flex-col items-center gap-3.5 rounded-2xl border border-line-soft bg-surface p-[32px_24px] text-center shadow-xs transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-iris-50 text-iris-500">
                <Icon name={h.icon} size={24} strokeWidth={1.9} />
              </span>
              <div>
                <div className="font-display text-[16px] font-bold leading-[1.1] text-ink">{h.title}</div>
                <div className="mt-1.5 font-sans text-[13px] text-muted">{h.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
