import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Icon, type IconName } from "@/components/dashboard/Icon";
import { AccountSidebar } from "@/components/dashboard/AccountSidebar";

// Read the signed-in customer per request for the sidebar identity block.
export const dynamic = "force-dynamic";

const HELP_CARDS: { title: string; sub: string; icon: IconName }[] = [
  { title: "About us", sub: "Know more about our company", icon: "building" },
  { title: "Contact Us", sub: "We are here to help", icon: "chat" },
  { title: "FAQ", sub: "Get all your answers", icon: "help" },
  { title: "Blog", sub: "Check our latest posts", icon: "blog" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already guarantees a signed-in CUSTOMER here; we only read the
  // identity fields for the sidebar. Scoped to the session user id.
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      })
    : null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="mx-auto flex max-w-[var(--container-max)] items-center gap-2 px-[var(--cpad)] pt-[22px] font-sans text-[13px] text-muted-soft">
        <Link href="/" className="text-muted hover:text-ink">
          Home
        </Link>
        <Icon name="chevronRight" size={14} strokeWidth={2} className="text-line" />
        <span className="font-semibold text-ink">My Account</span>
      </div>

      {/* Sidebar + content card */}
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-start gap-6 px-[var(--cpad)] pt-5 lg:grid-cols-[300px_1fr]">
        <AccountSidebar name={user?.name ?? "Your account"} email={user?.email ?? ""} />

        <section className="min-h-[640px] rounded-2xl border border-line-soft bg-surface p-6 shadow-[0_1px_2px_rgba(20,18,31,0.05)] sm:p-8 lg:px-9">
          {children}
        </section>
      </div>

      {/* Help cards */}
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--cpad)] pt-14">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HELP_CARDS.map((h) => (
            <div
              key={h.title}
              className="flex flex-col items-center gap-3.5 rounded-2xl border border-line-soft bg-surface px-6 py-8 text-center shadow-[0_1px_2px_rgba(20,18,31,0.05)]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-iris-50 text-iris-500">
                <Icon name={h.icon} size={22} strokeWidth={1.9} />
              </span>
              <div>
                <div className="font-display text-base font-bold text-ink">{h.title}</div>
                <div className="mt-1.5 font-sans text-[13px] text-muted">{h.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
