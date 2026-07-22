import Link from "next/link";
import { auth } from "@/auth";
import { homePathForRole, loginPathForArea } from "@/lib/roles";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function Home() {
  const session = await auth();
  const dest = session?.user
    ? homePathForRole(session.user.role, session.user.vendorStatus)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-line-soft bg-surface">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center px-8">
          <span className="font-display text-[27px] font-extrabold tracking-[-0.02em] text-ink">
            Covet<span className="text-iris-500">.</span>
          </span>
          <div className="ml-auto flex items-center gap-3">
            {session?.user ? (
              <>
                <Link
                  href={dest!}
                  className="flex h-10 items-center rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white hover:bg-iris-600"
                >
                  Go to dashboard
                </Link>
                <SignOutButton redirectTo={loginPathForArea(dest ?? "/login")} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex h-10 items-center rounded-md border border-line px-5 font-sans text-[13px] font-semibold text-ink-soft hover:bg-field"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex h-10 items-center rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white hover:bg-iris-600"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col items-center justify-center px-8 py-20 text-center">
        <span className="mb-5 rounded-full bg-iris-50 px-4 py-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-iris-700">
          Multi-vendor marketplace
        </span>
        <h1 className="max-w-[720px] font-display text-[46px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
          One storefront, one checkout,{" "}
          <span className="text-iris-500">thousands of sellers.</span>
        </h1>
        <p className="mt-5 max-w-[520px] font-sans text-[15px] leading-[1.6] text-muted">
          Covet brings independent sellers and beloved brands under one trusted checkout. Sign in
          to shop, or open a store and start selling today.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="flex h-12 items-center rounded-md bg-iris-500 px-7 font-display text-[14px] font-bold text-white hover:bg-iris-600"
          >
            Create an account
          </Link>
          <Link
            href="/vendor/register"
            className="flex h-12 items-center rounded-md border border-line bg-surface px-7 font-sans text-[14px] font-semibold text-ink-soft hover:bg-field"
          >
            Sell on Covet
          </Link>
        </div>
        <p className="mt-6 font-sans text-[13px] text-muted-soft">
          Administrator?{" "}
          <Link href="/admin/login" className="font-semibold text-iris-500 hover:text-iris-600">
            Admin sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
