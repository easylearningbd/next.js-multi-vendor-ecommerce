import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function VendorPendingPage() {
  const session = await auth();
  const user = session!.user;

  // Approved vendors don't belong here — send them to the dashboard.
  if (user.vendorStatus === "APPROVED") {
    redirect("/vendor/dashboard");
  }

  const suspended = user.vendorStatus === "SUSPENDED";

  return (
    <div className="flex min-h-screen flex-col bg-bg-dash">
      <header className="border-b border-line-soft bg-surface">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-6">
          <Link
            href="/"
            className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink"
          >
            Covet<span className="text-iris-500">.</span>
          </Link>
          <div className="ml-auto">
            <SignOutButton redirectTo="/vendor/login" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[540px] rounded-2xl border border-line-soft bg-surface p-8 text-center shadow-xs sm:p-11">
          <span
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl ${
              suspended ? "bg-error-bg text-error" : "bg-warning-bg text-warning"
            }`}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>

          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.01em] text-ink">
            {suspended ? "Store suspended" : "Your store is under review"}
          </h1>
          <p className="mx-auto mt-3 max-w-[420px] font-sans text-[14px] leading-[1.6] text-muted">
            {suspended
              ? "This seller account has been suspended. Please contact Covet support to resolve the issue and restore access."
              : "Thanks for registering, " +
                (user.name?.split(" ")[0] ?? "seller") +
                ". An admin is reviewing your application. You'll get access to the seller dashboard as soon as your store is approved."}
          </p>

          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="flex h-11 items-center rounded-md border border-line bg-surface px-5 font-sans text-[13px] font-semibold text-ink-soft transition-colors hover:bg-field"
            >
              Back to marketplace
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
