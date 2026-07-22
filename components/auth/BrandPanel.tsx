const features = [
  {
    label: "Free delivery on orders over $50",
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
  },
  {
    label: "Secure Stripe checkout & buyer protection",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    label: "7-day hassle-free returns",
    icon: (
      <>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </>
    ),
  },
];

export function BrandPanel() {
  return (
    <div className="bg-brand-gradient relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-2xl p-[52px_48px]">
      <div className="absolute -right-10 -top-[70px] h-[280px] w-[280px] rounded-full bg-white/[0.07]" />
      <div className="absolute -bottom-[90px] -left-[30px] h-[220px] w-[220px] rounded-full bg-white/[0.05]" />

      <div className="relative">
        <div className="font-display text-[28px] font-extrabold tracking-[-0.02em] text-white">
          Covet<span className="text-iris-300">.</span>
        </div>
        <p className="mt-[18px] max-w-[320px] font-sans text-[14px] leading-[1.5] text-white/75">
          One storefront, one checkout, thousands of independent sellers and brands.
        </p>
      </div>

      <div className="relative flex flex-col gap-4">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-3 text-white">
            <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-md bg-white/[0.14]">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {f.icon}
              </svg>
            </span>
            <span className="font-sans text-[13.5px] font-medium leading-[1.4]">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
