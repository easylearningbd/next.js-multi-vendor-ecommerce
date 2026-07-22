"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

type ViewState = "default" | "loading" | "empty" | "error";

const StateCtx = createContext<{
  state: ViewState;
  setState: (s: ViewState) => void;
}>({ state: "default", setState: () => {} });

const items: { k: ViewState; l: string }[] = [
  { k: "default", l: "Default" },
  { k: "loading", l: "Loading" },
  { k: "empty", l: "Empty" },
  { k: "error", l: "Error" },
];

/**
 * Wraps the "Preview state" switcher. StateTabs + StateView communicate via
 * context so a Server Component can place the tabs in its header and the body
 * below without passing any functions across the client boundary.
 */
export function StateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ViewState>("default");
  return <StateCtx.Provider value={{ state, setState }}>{children}</StateCtx.Provider>;
}

export function StateTabs({ trackClass = "bg-line-soft" }: { trackClass?: string }) {
  const { state, setState } = useContext(StateCtx);
  return (
    <div className={`flex gap-1 rounded-md p-1 ${trackClass}`}>
      {items.map((t) => {
        const active = state === t.k;
        return (
          <button
            key={t.k}
            type="button"
            onClick={() => setState(t.k)}
            className={`h-[30px] rounded-md px-3.5 font-sans text-[12px] transition ${
              active ? "bg-surface font-semibold text-ink shadow-xs" : "font-medium text-muted hover:text-ink"
            }`}
          >
            {t.l}
          </button>
        );
      })}
    </div>
  );
}

export function StateView({
  children,
  loading,
  empty,
  error,
}: {
  children: ReactNode;
  loading: ReactNode;
  empty: { title: string; text: string; actionLabel?: string };
  error: { title: string; text: string };
}) {
  const { state, setState } = useContext(StateCtx);

  if (state === "loading") return <>{loading}</>;
  if (state === "empty") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#dad8e0] bg-surface px-8 py-[72px] text-center">
        <span className="mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl bg-iris-50 text-iris-400">
          <Icon name="trendUp" size={36} strokeWidth={1.6} />
        </span>
        <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">{empty.title}</div>
        <p className="mx-auto mt-3 max-w-[360px] font-sans text-[14px] leading-[1.5] text-muted">{empty.text}</p>
        {empty.actionLabel && (
          <button
            type="button"
            onClick={() => setState("default")}
            className="mt-6 h-[46px] rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
          >
            {empty.actionLabel}
          </button>
        )}
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-[#f6d9da] bg-surface px-8 py-[72px] text-center">
        <span className="mb-[22px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl bg-error-bg text-danger">
          <Icon name="alert" size={36} strokeWidth={1.7} />
        </span>
        <div className="font-display text-[20px] font-bold leading-[1.2] text-ink">{error.title}</div>
        <p className="mx-auto mt-3 max-w-[360px] font-sans text-[14px] leading-[1.5] text-muted">{error.text}</p>
        <button
          type="button"
          onClick={() => setState("default")}
          className="mt-6 flex h-[46px] items-center gap-2 rounded-md bg-iris-500 px-6 font-sans text-[13.5px] font-semibold text-white transition-colors hover:bg-iris-600"
        >
          <Icon name="refresh" size={16} strokeWidth={2} />
          Try again
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
