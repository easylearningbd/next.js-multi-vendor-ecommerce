import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CustomerProfileForm } from "@/components/dashboard/CustomerProfileForm";
import { StateProvider, StateTabs, StateView } from "@/components/dashboard/PreviewPanel";

// Reads the signed-in customer's own row per request.
export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, phone: true, image: true },
      })
    : null;

  // User.name is a single column; the design shows First / Last, so we split on
  // the first space for the field defaults (recombined on save).
  const fullName = user?.name ?? "";
  const spaceAt = fullName.indexOf(" ");
  const firstName = spaceAt === -1 ? fullName : fullName.slice(0, spaceAt);
  const lastName = spaceAt === -1 ? "" : fullName.slice(spaceAt + 1);

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
    <StateProvider>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink">
            Profile Info
          </h1>
          <div className="mt-3 h-[3px] w-11 rounded-full bg-iris-500" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden font-sans text-[12px] text-muted-soft sm:inline">
            Preview state
          </span>
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
          <CustomerProfileForm
            firstName={firstName}
            lastName={lastName}
            email={user?.email ?? ""}
            phone={user?.phone ?? ""}
            image={user?.image ?? null}
          />
        </div>
      </StateView>
    </StateProvider>
  );
}
