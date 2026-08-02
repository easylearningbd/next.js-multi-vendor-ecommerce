"use client";

import { Dispatch, SetStateAction } from "react";
import { Icon } from "@/components/dashboard/Icon";
import { formatCents } from "@/lib/shop/pricing";
import {
  COUNTRIES,
  SHIPPING_METHODS,
  type AddressInput,
  type CheckoutForm,
} from "@/lib/checkout/shipping-schema";

type AddressErrors = Partial<Record<keyof AddressInput, string>>;
export type ShippingErrors = { shipping?: AddressErrors; billing?: AddressErrors };

const labelCls = "mb-2 block font-sans text-[13px] font-medium text-ink-soft";
const inputCls =
  "h-[46px] w-full rounded-[11px] border px-3.5 font-sans text-sm text-ink outline-none focus:border-iris-500 focus:shadow-[0_0_0_3px_var(--color-iris-100)]";

function Field({
  label,
  required,
  error,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className={labelCls}>
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 font-sans text-[12px] text-error">{error}</p>}
    </div>
  );
}

/** The 7 shared address fields (shipping or billing). */
function AddressFields({
  value,
  onChange,
  errors = {},
  addressType,
}: {
  value: AddressInput;
  onChange: (patch: Partial<AddressInput>) => void;
  errors?: AddressErrors;
  addressType?: { value: string; onChange: (v: string) => void };
}) {
  const border = (k: keyof AddressInput) => (errors[k] ? "border-error" : "border-line");
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-[18px] sm:grid-cols-2">
      <Field label="Contact person name" required error={errors.name}>
        <input
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Jordan Avery"
          className={`${inputCls} ${border("name")}`}
        />
      </Field>
      <Field label="Phone" required error={errors.phone}>
        <input
          value={value.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
          className={`${inputCls} ${border("phone")}`}
        />
      </Field>
      <Field label="Email" required error={errors.email} full>
        <input
          type="email"
          value={value.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="you@email.com"
          className={`${inputCls} ${border("email")}`}
        />
      </Field>
      {addressType && (
        <Field label="Address type">
          <select
            value={addressType.value}
            onChange={(e) => addressType.onChange(e.target.value)}
            className={`${inputCls} appearance-none border-line bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2375727F%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[right_12px_center] bg-no-repeat pr-9`}
          >
            {["Home", "Office", "Other"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Country" required error={errors.country}>
        <select
          value={value.country}
          onChange={(e) => onChange({ country: e.target.value })}
          className={`${inputCls} appearance-none bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2375727F%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[right_12px_center] bg-no-repeat pr-9 ${border("country")}`}
        >
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="City" required error={errors.city}>
        <input
          value={value.city}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder="Kingston"
          className={`${inputCls} ${border("city")}`}
        />
      </Field>
      <Field label="Zip code" required error={errors.zip}>
        <input
          value={value.zip}
          onChange={(e) => onChange({ zip: e.target.value })}
          placeholder="12401"
          className={`${inputCls} ${border("zip")}`}
        />
      </Field>
      <Field label="Address" required error={errors.address} full>
        <textarea
          value={value.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Street address, apartment, suite, etc."
          className={`min-h-[88px] w-full resize-y rounded-[11px] border px-3.5 py-3 font-sans text-sm leading-[1.5] text-ink outline-none focus:border-iris-500 focus:shadow-[0_0_0_3px_var(--color-iris-100)] ${border("address")}`}
        />
      </Field>
    </div>
  );
}

const CARD = "rounded-[20px] border border-line-soft bg-surface p-7 shadow-[0_1px_2px_rgba(20,18,31,0.05)]";

export function ShippingStep({
  value,
  setForm,
  errors,
}: {
  value: CheckoutForm;
  setForm: Dispatch<SetStateAction<CheckoutForm>>;
  errors: ShippingErrors;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Shipping Address */}
      <div className={CARD}>
        <h2 className="m-0 mb-6 font-display text-[20px] font-bold text-ink">Shipping Address</h2>
        <AddressFields
          value={value.shipping}
          onChange={(patch) => setForm((f) => ({ ...f, shipping: { ...f.shipping, ...patch } }))}
          errors={errors.shipping}
          addressType={{
            value: value.addressType,
            onChange: (v) => setForm((f) => ({ ...f, addressType: v })),
          }}
        />
      </div>

      {/* Billing Address */}
      <div className={CARD}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-[20px] font-bold text-ink">Billing Address</h2>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, billingSame: !f.billingSame }))}
            className="flex items-center gap-2.5 font-sans text-[13.5px] text-ink-soft"
          >
            <span
              className={`flex size-[19px] flex-none items-center justify-center rounded-[6px] border ${
                value.billingSame
                  ? "border-iris-500 bg-iris-500 text-white"
                  : "border-line-soft bg-surface text-transparent"
              }`}
            >
              <Icon name="delivered" size={12} strokeWidth={3} />
            </span>
            Same as shipping address
          </button>
        </div>

        {value.billingSame ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-iris-50 px-4 py-4 font-sans text-[13.5px] font-medium text-iris-700">
            <Icon name="confirmed" size={18} strokeWidth={2} />
            Billing address matches your shipping address.
          </div>
        ) : (
          <AddressFields
            value={value.billing}
            onChange={(patch) => setForm((f) => ({ ...f, billing: { ...f.billing, ...patch } }))}
            errors={errors.billing}
          />
        )}
      </div>

      {/* Shipping Method */}
      <div className={CARD}>
        <h2 className="m-0 mb-5 font-display text-[20px] font-bold text-ink">Shipping Method</h2>
        <div className="flex flex-col gap-3">
          {SHIPPING_METHODS.map((m) => {
            const on = value.shippingMethod === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, shippingMethod: m.value }))}
                aria-pressed={on}
                className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition-colors ${
                  on ? "border-iris-500 bg-iris-50" : "border-line hover:border-iris-200"
                }`}
              >
                <span
                  className={`flex size-[18px] flex-none items-center justify-center rounded-full border-2 ${
                    on ? "border-iris-500" : "border-line"
                  }`}
                >
                  {on && <span className="size-2 rounded-full bg-iris-500" />}
                </span>
                <div className="flex-1">
                  <div className="font-sans text-sm font-semibold text-ink">{m.label}</div>
                  <div className="font-sans text-[12px] text-muted">{m.eta}</div>
                </div>
                <div className="font-display text-sm font-bold text-ink">
                  {m.cents === 0 ? "Free" : formatCents(m.cents)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
