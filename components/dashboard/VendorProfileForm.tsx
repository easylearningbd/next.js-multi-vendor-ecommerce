"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  updateVendorProfile,
  type VendorProfileSaveResult,
} from "@/app/(seller)/vendor/(dashboard)/profile/actions";
import { IMAGE_ACCEPT_ATTR, CERT_ACCEPT_ATTR } from "@/lib/vendor-profile-validation";
import type { ActionResult } from "@/lib/vendor-types";
import { Icon } from "./Icon";

export type VendorProfileData = {
  name: string;
  email: string;
  phone: string;
  storeName: string;
  address: string;
  tinNumber: string;
  tinExpireDate: string; // yyyy-mm-dd or ""
  logo: string | null;
  coverImage: string | null;
  tinCertificateName: string | null;
  tinCertificateUrl: string | null;
};

const labelClass = "mb-2.5 flex items-center gap-1.5 font-sans text-[13px] font-semibold text-ink-soft";
const inputBase =
  "h-[50px] w-full rounded-xl border bg-bg-subtle px-[15px] font-sans text-[14px] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 font-sans text-[12px] text-error" role="alert">
      {message}
    </p>
  );
}

function Req() {
  return <span className="text-error">*</span>;
}

function SectionHead({ icon, title }: { icon: React.ComponentProps<typeof Icon>["name"]; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-2.5">
      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-iris-50 text-iris-500">
        <Icon name={icon} size={17} strokeWidth={2} />
      </span>
      <span className="font-display text-[17px] font-bold text-ink">{title}</span>
    </div>
  );
}

const smallBtn =
  "rounded-md px-2.5 py-1 font-sans text-[11px] font-semibold shadow-xs transition-colors";

// Cover banner (coverImage) + overlapping avatar (logo). Both are functional:
// pick a new file (preview) or remove the current one (hidden flag → action nulls it).
function Hero({
  cover,
  logo,
  coverError,
  logoError,
}: {
  cover: string | null;
  logo: string | null;
  coverError?: string;
  logoError?: string;
}) {
  const coverInput = useRef<HTMLInputElement>(null);
  const coverObj = useRef<string | null>(null);
  const [coverPrev, setCoverPrev] = useState<string | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);

  const logoInput = useRef<HTMLInputElement>(null);
  const logoObj = useRef<string | null>(null);
  const [logoPrev, setLogoPrev] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);

  const coverShown = coverPrev ?? (coverRemoved ? null : cover);
  const logoShown = logoPrev ?? (logoRemoved ? null : logo);

  function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (coverObj.current) URL.revokeObjectURL(coverObj.current);
    coverObj.current = URL.createObjectURL(f);
    setCoverPrev(coverObj.current);
    setCoverRemoved(false);
  }
  function removeCover() {
    if (coverObj.current) {
      URL.revokeObjectURL(coverObj.current);
      coverObj.current = null;
    }
    if (coverInput.current) coverInput.current.value = "";
    setCoverPrev(null);
    setCoverRemoved(true);
  }
  function pickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (logoObj.current) URL.revokeObjectURL(logoObj.current);
    logoObj.current = URL.createObjectURL(f);
    setLogoPrev(logoObj.current);
    setLogoRemoved(false);
  }
  function removeLogo() {
    if (logoObj.current) {
      URL.revokeObjectURL(logoObj.current);
      logoObj.current = null;
    }
    if (logoInput.current) logoInput.current.value = "";
    setLogoPrev(null);
    setLogoRemoved(true);
  }

  return (
    <div className="relative h-[200px] bg-[linear-gradient(120deg,var(--color-iris-100)_0%,var(--color-iris-50)_50%,#fbfaff_100%)]">
      {coverShown ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverShown} alt="Shop cover" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(101,68,224,0.05)_0_1px,transparent_1px_26px)]" />
      )}

      {/* cover file input + remove flag */}
      <input
        ref={coverInput}
        type="file"
        name="coverImage"
        accept={IMAGE_ACCEPT_ATTR}
        onChange={pickCover}
        className="hidden"
      />
      <input type="hidden" name="removeCoverImage" value={coverRemoved ? "true" : "false"} />

      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => coverInput.current?.click()}
          className={`${smallBtn} border border-line bg-surface text-ink-soft hover:bg-field`}
        >
          {coverShown ? "Change cover" : "Add cover"}
        </button>
        {coverShown && (
          <button
            type="button"
            onClick={removeCover}
            className={`${smallBtn} border border-[#f6d9da] bg-error-bg text-error hover:brightness-95`}
          >
            Remove
          </button>
        )}
      </div>
      {coverError && (
        <p className="absolute bottom-2 left-3 z-10 rounded bg-surface/90 px-2 py-0.5 font-sans text-[12px] text-error">
          {coverError}
        </p>
      )}

      {/* avatar (logo) */}
      <div className="absolute bottom-[-52px] left-1/2 z-10 -translate-x-1/2">
        <div className="relative flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-surface text-iris-500 shadow-[0_10px_30px_-10px_rgba(20,18,31,.3)]">
          {logoShown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoShown} alt="Shop logo" className="h-full w-full object-cover" />
          ) : (
            <Icon name="user" size={52} strokeWidth={1.5} />
          )}
          <button
            type="button"
            aria-label={logoShown ? "Change logo" : "Add logo"}
            onClick={() => logoInput.current?.click()}
            className="absolute bottom-0.5 right-0.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-surface bg-iris-500 text-white transition-colors hover:bg-iris-600"
          >
            <Icon name="camera" size={15} strokeWidth={2} />
          </button>
          {logoShown && (
            <button
              type="button"
              aria-label="Remove logo"
              onClick={removeLogo}
              className="absolute right-0.5 top-0.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border-[3px] border-surface bg-error-bg text-error transition-[filter] hover:brightness-95"
            >
              <Icon name="x" size={13} strokeWidth={2.4} />
            </button>
          )}
        </div>
        <input
          ref={logoInput}
          type="file"
          name="logo"
          accept={IMAGE_ACCEPT_ATTR}
          onChange={pickLogo}
          className="hidden"
        />
        <input type="hidden" name="removeLogo" value={logoRemoved ? "true" : "false"} />
      </div>
    </div>
  );
}

// TIN certificate: show the current file (with an authorized "View" link) and allow
// replacing it.
function CertField({
  currentName,
  currentUrl,
  error,
}: {
  currentName: string | null;
  currentUrl: string | null;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div>
      <label className={labelClass}>TIN Certificate</label>
      {currentName && !picked && (
        <div className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-line bg-bg-subtle px-3.5 py-2.5">
          <span className="flex min-w-0 items-center gap-2 font-sans text-[13px] text-ink">
            <Icon name="upload" size={15} strokeWidth={1.9} className="flex-none text-muted" />
            <span className="truncate">{currentName}</span>
          </span>
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-none items-center gap-1.5 font-sans text-[12.5px] font-semibold text-iris-500 hover:text-iris-600"
            >
              <Icon name="eye" size={14} strokeWidth={2} />
              View
            </a>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        name="tinCertificate"
        accept={CERT_ACCEPT_ATTR}
        onChange={(e) => setPicked(e.target.files?.[0]?.name ?? null)}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed bg-surface px-4 py-3 text-center transition-colors hover:border-iris-500 ${
          error ? "border-error" : "border-[#d6d4dd]"
        }`}
      >
        <Icon name="upload" size={18} strokeWidth={1.7} className="text-muted-soft" />
        {picked ? (
          <span className="flex items-center gap-2 font-sans text-[13px] font-medium text-ink">
            {picked}
            <span
              role="button"
              tabIndex={0}
              onClick={(ev) => {
                ev.stopPropagation();
                if (inputRef.current) inputRef.current.value = "";
                setPicked(null);
              }}
              className="text-error"
            >
              <Icon name="x" size={14} strokeWidth={2.2} />
            </span>
          </span>
        ) : (
          <span className="font-sans text-[13px] font-semibold text-iris-500">
            {currentName ? "Replace certificate" : "Upload certificate"}
          </span>
        )}
      </button>
      <div className="mt-2 font-sans text-[11.5px] text-muted-soft">PDF, JPG, PNG or WEBP · Max 5MB</div>
      <FieldError message={error} />
    </div>
  );
}

export function VendorProfileForm({ data }: { data: VendorProfileData }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    ActionResult<VendorProfileSaveResult> | undefined,
    FormData
  >(updateVendorProfile, undefined);
  const errors = state?.fieldErrors;

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Profile updated");
      router.refresh();
    } else if (state.fieldErrors) {
      toast.error(state.error ?? "Please fix the errors below.");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const generalError = state && !state.success && state.error && !state.fieldErrors ? state.error : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-[22px]">
      {generalError && (
        <div className="rounded-md border border-[#f6d9da] bg-error-bg px-4 py-3 font-sans text-[13px] text-error">
          {generalError}
        </div>
      )}

      {/* Group A — Basic Information (User) */}
      <div className="overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-xs">
        <Hero cover={data.coverImage} logo={data.logo} coverError={errors?.coverImage} logoError={errors?.logo} />
        <div className="px-[30px] pb-[30px] pt-[72px]">
          <SectionHead icon="user" title="Basic Information" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>
                Full Name <Req />
              </label>
              <input
                id="name"
                name="name"
                defaultValue={data.name}
                aria-invalid={!!errors?.name}
                className={`${inputBase} ${errors?.name ? "border-error" : "border-line"}`}
              />
              <FieldError message={errors?.name} />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email <Req />
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={data.email}
                autoComplete="email"
                aria-invalid={!!errors?.email}
                className={`${inputBase} ${errors?.email ? "border-error" : "border-line"}`}
              />
              <FieldError message={errors?.email} />
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number
              </label>
              <div
                className={`flex h-[50px] items-center overflow-hidden rounded-xl border bg-bg-subtle transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-iris-500 focus-within:bg-surface focus-within:shadow-[0_0_0_3px_var(--color-iris-100)] ${
                  errors?.phone ? "border-error" : "border-line"
                }`}
              >
                <span className="flex h-full items-center gap-1.5 whitespace-nowrap border-r border-line px-3 font-sans text-[13px] font-medium text-ink-soft">
                  +1
                  <Icon name="chevronDown" size={13} strokeWidth={2} className="text-muted" />
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={data.phone}
                  placeholder="Add a phone number"
                  autoComplete="tel"
                  className="min-w-0 flex-1 border-none bg-transparent px-3.5 font-sans text-[14px] text-ink outline-none"
                />
              </div>
              <FieldError message={errors?.phone} />
            </div>
          </div>
        </div>
      </div>

      {/* Group B — Store Information (Vendor) */}
      <div className="rounded-[18px] border border-line-soft bg-surface p-[26px_30px] shadow-xs">
        <SectionHead icon="store" title="Store Information" />
        <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
          <div>
            <label htmlFor="storeName" className={labelClass}>
              Store Name <Req />
            </label>
            <input
              id="storeName"
              name="storeName"
              defaultValue={data.storeName}
              aria-invalid={!!errors?.storeName}
              className={`${inputBase} ${errors?.storeName ? "border-error" : "border-line"}`}
            />
            <FieldError message={errors?.storeName} />
          </div>

          <div>
            <label htmlFor="tinNumber" className={labelClass}>
              Taxpayer Identification Number (TIN)
            </label>
            <input
              id="tinNumber"
              name="tinNumber"
              defaultValue={data.tinNumber}
              placeholder="Type TIN number"
              aria-invalid={!!errors?.tinNumber}
              className={`${inputBase} ${errors?.tinNumber ? "border-error" : "border-line"}`}
            />
            <FieldError message={errors?.tinNumber} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address" className={labelClass}>
              Store Address
            </label>
            <textarea
              id="address"
              name="address"
              defaultValue={data.address}
              maxLength={255}
              rows={3}
              placeholder="Ex: 148 Maple Court, New York"
              aria-invalid={!!errors?.address}
              className={`min-h-[84px] w-full resize-none rounded-xl border bg-bg-subtle px-[15px] py-3 font-sans text-[14px] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)] ${
                errors?.address ? "border-error" : "border-line"
              }`}
            />
            <FieldError message={errors?.address} />
          </div>

          <div>
            <label htmlFor="tinExpireDate" className={labelClass}>
              TIN Expiry Date
            </label>
            <input
              id="tinExpireDate"
              name="tinExpireDate"
              type="date"
              defaultValue={data.tinExpireDate}
              aria-invalid={!!errors?.tinExpireDate}
              className={`${inputBase} ${errors?.tinExpireDate ? "border-error" : "border-line"}`}
            />
            <FieldError message={errors?.tinExpireDate} />
          </div>

          <CertField
            currentName={data.tinCertificateName}
            currentUrl={data.tinCertificateUrl}
            error={errors?.tinCertificate}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-iris-500 px-[30px] font-display text-[14px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending && (
            <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
