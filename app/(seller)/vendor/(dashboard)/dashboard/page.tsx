import { auth } from "@/auth";
import { StateProvider, StateTabs, StateView } from "@/components/dashboard/PreviewPanel";
import { RangeAreaChart, CHART } from "@/components/dashboard/Charts";
import { Card, SectionHead, StatusStat, Thumb, WalletStat, type Tone } from "@/components/dashboard/cards";
import { Icon, type IconName } from "@/components/dashboard/Icon";

const statusCards: {
  label: string;
  value: number;
  icon: IconName;
  tone: Tone;
  numClass?: string;
}[] = [
  { label: "Pending", value: 3, icon: "pending", tone: "info" },
  { label: "Confirmed", value: 4, icon: "confirmed", tone: "success", numClass: "text-success" },
  { label: "Packaging", value: 1, icon: "packaging", tone: "warning" },
  { label: "Out For Delivery", value: 2, icon: "outfor", tone: "iris" },
  { label: "Delivered", value: 11, icon: "delivered", tone: "success", numClass: "text-success" },
  { label: "Canceled", value: 1, icon: "canceled", tone: "error" },
  { label: "Returned", value: 1, icon: "returned", tone: "info" },
  { label: "Failed To Deliver", value: 2, icon: "failed", tone: "error", numClass: "text-danger" },
];

const earningSets = {
  year: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    series: [
      { label: "Income", color: CHART.iris, data: [1.2, 1.8, 1.4, 2.6, 2.1, 3.4, 2.9, 3.8, 3.2, 4.4, 3.9, 4.8] },
      { label: "Commission", color: CHART.green, data: [0.2, 0.3, 0.25, 0.4, 0.35, 0.5, 0.45, 0.6, 0.5, 0.7, 0.6, 0.75] },
    ],
  },
  month: {
    labels: ["W1", "W2", "W3", "W4"],
    series: [
      { label: "Income", color: CHART.iris, data: [2.1, 3.2, 2.8, 4.1] },
      { label: "Commission", color: CHART.green, data: [0.3, 0.5, 0.45, 0.65] },
    ],
  },
  week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    series: [
      { label: "Income", color: CHART.iris, data: [0.6, 0.9, 0.7, 1.2, 1.0, 1.5, 1.3] },
      { label: "Commission", color: CHART.green, data: [0.1, 0.15, 0.12, 0.2, 0.16, 0.24, 0.21] },
    ],
  },
};

const topProducts = [
  { title: "Vimly Women Blazer Suit", sales: "$22,500.00", sold: 5 },
  { title: "Leather Ladies Bag", sales: "$17,970.00", sold: 3 },
  { title: "Ladies Bag", sales: "$1,969.80", sold: 3 },
  { title: "Ugly Love: A Novel", sales: "$930.00", sold: 1 },
  { title: "Hydration Pack", sales: "$50.00", sold: 1 },
];

const deliveryMen = [
  { name: "Marcus Reid", rating: "4.9", delivered: 2 },
  { name: "Jude Bellingham", rating: "4.7", delivered: 1 },
];

export default async function VendorDashboardPage() {
  const session = await auth();
  const user = session!.user;
  const firstName = user.name?.split(" ")[0] ?? "seller";

  const defaultView = (
    <div className="flex flex-col gap-[22px]">
      {/* Business Analytics */}
      <Card className="p-[24px_26px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-iris-50 text-iris-500">
              <Icon name="trendUp" size={17} strokeWidth={2} />
            </span>
            <span className="font-display text-[17px] font-bold text-ink">Business Analytics</span>
          </div>
          <div className="flex h-10 items-center gap-2 rounded-md border border-line px-3.5 font-sans text-[13px] text-ink-soft">
            Overall Statistics
            <Icon name="chevronDown" size={14} strokeWidth={2} className="text-muted" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {statusCards.map((c) => (
            <StatusStat key={c.label} {...c} />
          ))}
        </div>
      </Card>

      {/* Vendor Wallet */}
      <Card className="p-[24px_26px]">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-iris-50 text-iris-500">
            <Icon name="wallet" size={17} strokeWidth={2} />
          </span>
          <span className="font-display text-[17px] font-bold text-ink">Vendor Wallet</span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_1fr]">
          <div className="flex flex-col items-center rounded-xl border border-iris-100 bg-[linear-gradient(150deg,var(--color-iris-50),#fbfaff)] p-6 text-center">
            <span className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-iris-500 shadow-sm">
              <Icon name="card" size={26} strokeWidth={1.8} />
            </span>
            <div className="font-display text-[28px] font-extrabold text-ink">$10,081.50</div>
            <div className="mb-4 mt-2 font-sans text-[13px] text-muted">Withdrawable Balance</div>
            <button
              type="button"
              className="h-11 w-full rounded-md bg-iris-500 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
            >
              Withdraw
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <WalletStat icon="clock" v1="$500.00" l1="Pending Withdraw" />
            <WalletStat icon="coins" v1="$600.00" l1="Already Withdrawn" v2="$2,534.50" l2="Total Tax" />
          </div>
          <div className="flex flex-col gap-4">
            <WalletStat icon="dollar" v1="$6,401.97" l1="Total Commission" />
            <WalletStat icon="cash" v1="$822.00" l1="Total Delivery Charge Earned" v2="$25,756.80" l2="Collected Cash" />
          </div>
        </div>
      </Card>

      {/* Earning Statistics */}
      <RangeAreaChart
        title="Earning Statistics"
        icon="bars"
        legend={[
          { label: "Income", color: CHART.iris },
          { label: "Commission given", color: CHART.green },
        ]}
        sets={earningSets}
      />

      {/* Most Rated + Top Selling */}
      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <SectionHead icon="star" tone="amber" title="Most Rated Products" viewAll filled />
          <div className="flex items-center gap-3.5 rounded-xl border border-line-soft p-3 hover:bg-bg-subtle">
            <Thumb className="h-14 w-14 flex-none rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="font-sans text-[14px] font-semibold leading-[1.3] text-ink">Leather Ladies Bag</div>
              <div className="mt-1.5 font-sans text-[11px] text-iris-500">by Marchetti</div>
              <div className="mt-2 flex items-center gap-1.5">
                <Icon name="star" size={14} className="text-star" />
                <span className="font-display text-[12.5px] font-bold text-ink">4.5</span>
                <span className="font-sans text-[12px] text-muted-soft">2 Reviews</span>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <SectionHead icon="dollar" title="Top Selling Products" viewAll />
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            {topProducts.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-line-soft p-3 text-center transition-shadow hover:shadow-sm"
              >
                <Thumb className="mb-2.5 aspect-square rounded-md" />
                <div className="min-h-[32px] font-sans text-[12.5px] font-semibold leading-[1.3] text-ink">
                  {p.title}
                </div>
                <div className="mb-1 mt-2 font-sans text-[11px] text-muted-soft">Total Sold Price</div>
                <div className="mb-2.5 font-display text-[14px] font-bold text-ink">{p.sales}</div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-iris-500 px-3 py-1.5 font-sans text-[11px] font-semibold text-white">
                  Sold: {p.sold}
                  <Icon name="cart" size={13} strokeWidth={2} />
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Delivery Man */}
      <Card>
        <SectionHead icon="user" tone="error" title="Top Delivery Man" viewAll />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deliveryMen.map((d) => (
            <div key={d.name} className="rounded-xl border border-line-soft p-[22px] text-center">
              <div className="mx-auto mb-3.5 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-400">
                <Icon name="user" size={32} strokeWidth={1.7} />
              </div>
              <div className="font-display text-[14px] font-bold text-ink">{d.name}</div>
              <div className="mt-2.5 flex items-center justify-center gap-1.5 font-sans text-[12px] text-muted">
                Rating: <span className="font-semibold text-ink">{d.rating}</span>
                <Icon name="star" size={12} className="text-star" />
              </div>
              <div className="mt-2 font-sans text-[12px] text-muted">
                Orders Delivered: <span className="font-semibold text-ink">{d.delivered}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const loading = (
    <div className="flex flex-col gap-[22px]">
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[74px] animate-pulse rounded-lg bg-line-soft" />
        ))}
      </div>
      <div className="h-[220px] animate-pulse rounded-2xl bg-line-soft" />
      <div className="h-[320px] animate-pulse rounded-2xl bg-line-soft" />
    </div>
  );

  return (
    <StateProvider>
      <div className="mb-[22px] flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
            Welcome {user.name ?? firstName}
          </h1>
          <p className="mt-3 font-sans text-[14px] text-muted">
            Monitor your business analytics and statistics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden font-sans text-[12px] text-muted-soft sm:inline">Preview state</span>
          <StateTabs trackClass="bg-[#EDECF1]" />
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-md bg-iris-500 px-5 font-display text-[13px] font-bold text-white transition-colors hover:bg-iris-600"
          >
            <Icon name="box" size={17} strokeWidth={2} />
            Products
          </button>
        </div>
      </div>
      <StateView
        loading={loading}
        empty={{
          title: "No analytics yet",
          text: "Once you start selling, your business analytics and earnings will appear here.",
          actionLabel: "Add your first product",
        }}
        error={{
          title: "Couldn't load your dashboard",
          text: "Something went wrong while loading your analytics. Please try again.",
        }}
      >
        {defaultView}
      </StateView>
    </StateProvider>
  );
}
