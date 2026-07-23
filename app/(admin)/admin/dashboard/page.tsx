import { auth } from "@/auth";
import { StateProvider, StateTabs, StateView } from "@/components/dashboard/PreviewPanel";
import { RangeAreaChart, DonutChart, CHART } from "@/components/dashboard/Charts";
import {
  Card,
  SectionHead,
  StatusStat,
  RatedRow,
  ProductTile,
  toneChip,
  type Tone,
} from "@/components/dashboard/cards";
import { Icon, type IconName } from "@/components/dashboard/Icon";

const bizCards: { label: string; value: number; icon: IconName; tone: Tone }[] = [
  { label: "Total Order", value: 248, icon: "order", tone: "iris" },
  { label: "Total Stores", value: 10, icon: "store", tone: "info" },
  { label: "Total Products", value: 39, icon: "product", tone: "success" },
  { label: "Total Customers", value: 21, icon: "customer", tone: "warning" },
];

const statusCards: { label: string; value: number; icon: IconName; tone: Tone; numClass?: string }[] = [
  { label: "Pending", value: 3, icon: "pending", tone: "info" },
  { label: "Confirmed", value: 4, icon: "confirmed", tone: "success", numClass: "text-success" },
  { label: "Packaging", value: 1, icon: "packaging", tone: "warning" },
  { label: "Out For Delivery", value: 2, icon: "outfor", tone: "iris" },
  { label: "Delivered", value: 11, icon: "delivered", tone: "success", numClass: "text-success" },
  { label: "Canceled", value: 1, icon: "canceled", tone: "error" },
  { label: "Returned", value: 1, icon: "returned", tone: "info" },
  { label: "Failed To Delivery", value: 2, icon: "failed", tone: "error", numClass: "text-danger" },
];

const walletLeft = [
  { icon: "dollar" as IconName, v: "$12,927.52", l: "Commission Earned" },
  { icon: "tax" as IconName, v: "$5,240.00", l: "Total Tax Collected" },
];
const walletRight = [
  { icon: "truck" as IconName, v: "$1,660.00", l: "Delivery Charge Earned" },
  { icon: "clock" as IconName, v: "$7,687.00", l: "Pending Amount" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const orderSets = {
  year: {
    labels: months,
    series: [
      { label: "Inhouse", color: CHART.iris, data: [1.2, 1.8, 1.4, 2.6, 2.1, 3.4, 2.9, 3.8, 3.2, 4.4, 3.9, 4.8] },
      { label: "Vendor", color: CHART.green, data: [0.8, 1.2, 1.0, 1.8, 1.5, 2.4, 2.1, 2.8, 2.4, 3.2, 2.9, 3.6] },
    ],
  },
  month: {
    labels: ["W1", "W2", "W3", "W4"],
    series: [
      { label: "Inhouse", color: CHART.iris, data: [2.1, 3.2, 2.8, 4.1] },
      { label: "Vendor", color: CHART.green, data: [1.4, 2.2, 1.9, 2.8] },
    ],
  },
  week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    series: [
      { label: "Inhouse", color: CHART.iris, data: [0.6, 0.9, 0.7, 1.2, 1.0, 1.5, 1.3] },
      { label: "Vendor", color: CHART.green, data: [0.4, 0.6, 0.5, 0.9, 0.7, 1.1, 0.9] },
    ],
  },
};
const earnSets = {
  year: {
    labels: months,
    series: [
      { label: "Inhouse", color: CHART.iris, data: [1.4, 2.0, 1.6, 2.8, 2.3, 3.6, 3.1, 4.0, 3.4, 4.6, 4.1, 5.0] },
      { label: "Vendor", color: CHART.green, data: [1.0, 1.4, 1.2, 2.0, 1.7, 2.6, 2.3, 3.0, 2.6, 3.4, 3.1, 3.8] },
      { label: "Commission", color: CHART.amber, data: [0.3, 0.4, 0.35, 0.55, 0.45, 0.7, 0.6, 0.8, 0.7, 0.9, 0.82, 1.0] },
    ],
  },
  month: {
    labels: ["W1", "W2", "W3", "W4"],
    series: [
      { label: "Inhouse", color: CHART.iris, data: [2.4, 3.5, 3.0, 4.4] },
      { label: "Vendor", color: CHART.green, data: [1.6, 2.4, 2.1, 3.0] },
      { label: "Commission", color: CHART.amber, data: [0.4, 0.6, 0.5, 0.75] },
    ],
  },
  week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    series: [
      { label: "Inhouse", color: CHART.iris, data: [0.7, 1.0, 0.8, 1.3, 1.1, 1.6, 1.4] },
      { label: "Vendor", color: CHART.green, data: [0.5, 0.7, 0.6, 1.0, 0.8, 1.2, 1.0] },
      { label: "Commission", color: CHART.amber, data: [0.1, 0.15, 0.12, 0.2, 0.16, 0.24, 0.2] },
    ],
  },
};

const userDonut = [
  { label: "Total Customer", value: 7, color: CHART.blue },
  { label: "Total Vendor", value: 10, color: CHART.amber },
  { label: "Total Delivery Man", value: 4, color: CHART.deep },
];
const topCustomers = [
  { name: "Robert Downey", email: "r****@**mer.com", orders: 140 },
  { name: "David Jack", email: "t****@**mer.com", orders: 17 },
  { name: "Chris Evans", email: "c****@**mer.com", orders: 7 },
  { name: "Anthony Mackie", email: "t****@**mer.com", orders: 3 },
];
const deliveryMen = [
  { name: "Will Smith", rating: "4.50", delivered: 10 },
  { name: "Marcus Reid", rating: "4.20", delivered: 6 },
];
const popularStores = [
  { name: "Book Store", likes: 3 },
  { name: "FootFinds", likes: 1 },
];
const topStores = [
  { name: "Bicycle Shop", sales: "$12,000.20" },
  { name: "Book Store", sales: "$10,081.50" },
  { name: "Hanover Electronics", sales: "$9,590.01" },
  { name: "Iiceria & co.", sales: "$408.00" },
];
const inhouseRated = [
  { title: "4 French Door Refrigerator", rating: 5, reviews: 2 },
  { title: "Straps Plaid Patchwork Dress", rating: 5, reviews: 1 },
  { title: "T900 Smart Watch", rating: 4, reviews: 1 },
];
const inhouseTop = [
  { title: "4 French Door Refrigerator", price: "$5,400.00", sold: 12 },
  { title: "Straps Plaid Patchwork Dress", price: "$3,150.00", sold: 7 },
  { title: "Bohemiantee Shirt Tops", price: "$3,430.00", sold: 7 },
  { title: "T900 Smart Watch", price: "$31,500.00", sold: 7 },
];
const vendorRated = [
  { title: "Copper Alloy Inlaid Zircon Ring", seller: "Golden Jewellery", rating: 5, reviews: 3 },
  { title: "iPhone 14 Pro Max", seller: "Hanover Electronics", rating: 5, reviews: 1 },
  { title: "Leather Single Shoes", seller: "FootFinds", rating: 5, reviews: 1 },
];
const vendorTop = [
  { title: "iPhone 14 Pro Max", seller: "Hanover Electronics", price: "$4,950.00", sold: 11 },
  { title: "Vimly Women Blazer Suit", seller: "Marchetti", price: "$22,500.00", sold: 5 },
  { title: "Copper Alloy Inlaid Zircon Ring", seller: "Golden Jewellery", price: "$20,000.00", sold: 4 },
  { title: "Women Beautiful White Sneakers", seller: "FootFinds", price: "$1,350.00", sold: 3 },
];

function StoreRow({ name, meta, icon }: { name: string; meta: React.ReactNode; icon: IconName }) {
  return (
    <a href="#" className="flex items-center gap-3 rounded-xl border border-line-soft p-3.5 hover:bg-bg-subtle">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-500">
        <Icon name={icon} size={22} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <div className="font-sans text-[13.5px] font-semibold leading-[1.2] text-ink">{name}</div>
        <div className="mt-1.5">{meta}</div>
      </div>
    </a>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = session!.user;

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
            This Year Statistics
            <Icon name="chevronDown" size={14} strokeWidth={2} className="text-muted" />
          </div>
        </div>
        <div className="mb-3.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {bizCards.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-line-soft bg-bg-subtle p-[18px]"
            >
              <div>
                <div className="font-sans text-[12.5px] text-muted">{c.label}</div>
                <div className="mt-3 font-display text-[26px] font-extrabold text-ink">{c.value}</div>
              </div>
              <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-md ${toneChip(c.tone)}`}>
                <Icon name={c.icon} size={22} strokeWidth={1.8} />
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {statusCards.map((c) => (
            <StatusStat key={c.label} {...c} chipSize={34} />
          ))}
        </div>
      </Card>

      {/* Admin Wallet */}
      <Card className="p-[24px_26px]">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-iris-50 text-iris-500">
            <Icon name="wallet" size={17} strokeWidth={2} />
          </span>
          <span className="font-display text-[17px] font-bold text-ink">Admin Wallet</span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_1fr]">
          <div className="flex flex-col items-center justify-center rounded-xl border border-iris-100 bg-[linear-gradient(150deg,var(--color-iris-50),#fbfaff)] p-6 text-center">
            <span className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-iris-500 shadow-sm">
              <Icon name="bars" size={26} strokeWidth={1.8} />
            </span>
            <div className="font-display text-[24px] font-extrabold text-ink">$27,514.52</div>
            <div className="mt-2 font-sans text-[13px] text-muted">Total Admin Earning</div>
          </div>
          {[walletLeft, walletRight].map((col, i) => (
            <div key={i} className="flex flex-col gap-4">
              {col.map((w) => (
                <div
                  key={w.l}
                  className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-line-soft bg-bg-subtle p-5"
                >
                  <div>
                    <div className="font-display text-[21px] font-extrabold text-ink">{w.v}</div>
                    <div className="mt-1.5 font-sans text-[12.5px] text-muted">{w.l}</div>
                  </div>
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-iris-50 text-iris-500">
                    <Icon name={w.icon} size={22} strokeWidth={1.7} />
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Order Statistics + User Overview */}
      <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1fr_380px]">
        <RangeAreaChart
          title="Order Statistics"
          icon="trendUp"
          legend={[
            { label: "Inhouse", color: CHART.iris },
            { label: "Vendor", color: CHART.green },
          ]}
          sets={orderSets}
        />
        <Card className="p-[24px_26px]">
          <div className="mb-5 font-display text-[17px] font-bold text-ink">User Overview</div>
          <div className="mb-5 flex justify-center">
            <DonutChart segments={userDonut} size={210} thickness={24} />
          </div>
          <div className="flex flex-col gap-3">
            {userDonut.map((u) => (
              <div key={u.label} className="flex items-center gap-2.5 font-sans text-[13px] font-medium text-ink-soft">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: u.color }} />
                {u.label} ({u.value})
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Earning Statistics */}
      <RangeAreaChart
        title="Earning Statistics"
        icon="bars"
        legend={[
          { label: "Inhouse", color: CHART.iris },
          { label: "Vendor", color: CHART.green },
          { label: "Commission", color: CHART.amber },
        ]}
        sets={earnSets}
      />

      {/* Users */}
      <div className="font-display text-[18px] font-bold text-ink">Users</div>
      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-2">
        <Card>
          <SectionHead icon="user" title="Top Customers" viewAll />
          <div className="flex flex-col gap-2.5">
            {topCustomers.map((c) => (
              <div key={c.name} className="flex items-center gap-3.5 rounded-xl border border-line-soft p-3 hover:bg-bg-subtle">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-400">
                  <Icon name="user" size={22} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-[14px] font-semibold text-ink">{c.name}</div>
                  <div className="mt-1.5 font-sans text-[11.5px] text-muted-soft">{c.email}</div>
                </div>
                <span className="whitespace-nowrap rounded-full bg-iris-50 px-3 py-1.5 font-sans text-[11px] font-semibold text-accent-fg">
                  Orders : {c.orders}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHead icon="truck" tone="error" title="Top Delivery Man" viewAll />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {deliveryMen.map((d) => (
              <div key={d.name} className="rounded-xl border border-line-soft p-5 text-center">
                <div className="mx-auto mb-3 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-400">
                  <Icon name="user" size={28} strokeWidth={1.7} />
                </div>
                <div className="font-display text-[14px] font-bold text-ink">{d.name}</div>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 font-sans text-[12px] text-muted">
                  Rating : <span className="font-semibold text-ink">{d.rating}</span>
                  <Icon name="star" size={12} className="text-star" />
                </div>
                <div className="mt-2 font-sans text-[12px] text-muted">
                  Order Delivered : <span className="font-semibold text-ink">{d.delivered}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Stores */}
      <div className="font-display text-[18px] font-bold text-ink">Stores</div>
      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-2">
        <Card>
          <SectionHead icon="heart" tone="error" title="Most Popular Stores" viewAll filled />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {popularStores.map((s) => (
              <StoreRow
                key={s.name}
                name={s.name}
                icon="store"
                meta={
                  <span className="flex items-center gap-1 font-sans text-[12px] text-muted">
                    <Icon name="heart" size={12} className="text-danger" />
                    {s.likes}
                  </span>
                }
              />
            ))}
          </div>
        </Card>
        <Card>
          <SectionHead icon="clockBig" title="Top Selling Stores" viewAll />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {topStores.map((s) => (
              <StoreRow
                key={s.name}
                name={s.name}
                icon="store"
                meta={
                  <span className="flex items-center gap-1.5 font-display text-[12.5px] font-bold text-iris-500">
                    <Icon name="cart" size={13} strokeWidth={2} />
                    {s.sales}
                  </span>
                }
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Inhouse Products */}
      <div className="font-display text-[18px] font-bold text-ink">Inhouse Products</div>
      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-2">
        <Card>
          <SectionHead icon="star" tone="amber" title="Most Rated Products" viewAll filled />
          <div className="flex flex-col gap-3">
            {inhouseRated.map((p) => (
              <RatedRow key={p.title} title={p.title} subtitle="Sold by Covet Inhouse" rating={p.rating} reviews={p.reviews} />
            ))}
          </div>
        </Card>
        <Card>
          <SectionHead icon="dollar" title="Top Selling Products" viewAll />
          <div className="grid grid-cols-2 gap-3.5">
            {inhouseTop.map((p) => (
              <ProductTile key={p.title} title={p.title} price={p.price} sold={p.sold} />
            ))}
          </div>
        </Card>
      </div>

      {/* Vendor Products */}
      <div className="font-display text-[18px] font-bold text-ink">Vendor Products</div>
      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-2">
        <Card>
          <SectionHead icon="star" tone="amber" title="Most Rated Products" viewAll filled />
          <div className="flex flex-col gap-3">
            {vendorRated.map((p) => (
              <RatedRow key={p.title} title={p.title} subtitle={`Sold by ${p.seller}`} rating={p.rating} reviews={p.reviews} />
            ))}
          </div>
        </Card>
        <Card>
          <SectionHead icon="dollar" title="Top Selling Products" viewAll />
          <div className="grid grid-cols-2 gap-3.5">
            {vendorTop.map((p) => (
              <ProductTile key={p.title} title={p.title} seller={p.seller} price={p.price} sold={p.sold} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const loading = (
    <div className="flex flex-col gap-[22px]">
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-line-soft" />
        ))}
      </div>
      <div className="h-[200px] animate-pulse rounded-2xl bg-line-soft" />
      <div className="h-[340px] animate-pulse rounded-2xl bg-line-soft" />
    </div>
  );

  return (
    <StateProvider>
      <div className="mb-[22px] flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
            Welcome {user.name ?? "Admin"}
          </h1>
          <p className="mt-3 font-sans text-[14px] text-muted">
            Monitor your business analytics and statistics.
          </p>
        </div>
        <StateTabs trackClass="bg-[#EDECF1]" />
      </div>
      <StateView
        loading={loading}
        empty={{
          title: "No analytics yet",
          text: "As stores and orders come in across the marketplace, platform analytics will appear here.",
        }}
        error={{
          title: "Couldn't load dashboard",
          text: "Something went wrong while loading platform analytics. Please try again.",
        }}
      >
        {defaultView}
      </StateView>
    </StateProvider>
  );
}
