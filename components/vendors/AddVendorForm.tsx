"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createVendorByAdmin } from "@/app/(admin)/admin/vendors/actions";
import { IMAGE_ACCEPT_ATTR, CERT_ACCEPT_ATTR } from "@/lib/vendor-validation";
import type { ActionResult } from "@/lib/vendor-types";
import { Icon } from "@/components/dashboard/Icon";
import { ImageUploadField, FileUploadField } from "./UploadField";

type FE = Record<string, string> | undefined;

const inputBase =
  "h-[48px] w-full rounded-md border bg-bg-subtle px-[14px] font-sans text-[13.5px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 font-sans text-[12px] text-error" role="alert">
      {message}
    </p>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block font-sans text-[12.5px] font-semibold text-ink-soft">
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );
}

function TextField({
  name,
  label,
  required,
  type = "text",
  placeholder,
  autoComplete,
  errors,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  errors: FE;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!errors?.[name]}
        className={`${inputBase} ${errors?.[name] ? "border-error" : "border-line"}`}
      />
      <FieldError message={errors?.[name]} />
    </div>
  );
}

function PasswordField({
  name,
  label,
  placeholder,
  errors,
}: {
  name: string;
  label: string;
  placeholder?: string;
  errors: FE;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label required>{label}</Label>
      <div
        className={`flex h-[48px] items-center overflow-hidden rounded-md border bg-bg-subtle transition focus-within:border-iris-500 focus-within:bg-surface focus-within:shadow-[0_0_0_3px_var(--color-iris-100)] ${
          errors?.[name] ? "border-error" : "border-line"
        }`}
      >
        <input
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          className="min-w-0 flex-1 border-none bg-transparent px-[14px] font-sans text-[13.5px] text-ink outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="flex h-full items-center px-3.5 text-muted-soft hover:text-muted"
        >
          <Icon name={show ? "eyeOff" : "eye"} size={17} strokeWidth={2} />
        </button>
      </div>
      <FieldError message={errors?.[name]} />
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line-soft bg-surface p-[26px_28px] shadow-xs">
      <div className="mb-[22px]">
        <div className="font-display text-[18px] font-bold text-ink">{title}</div>
        <div className="mt-2 font-sans text-[13px] text-muted">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

export function AddVendorForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult<{ vendorId: string }> | undefined, FormData>(
    createVendorByAdmin,
    undefined,
  );
  const errors = state?.fieldErrors;

  useEffect(() => {
    if (state?.success && state.data?.vendorId) {
      toast.success("Vendor created");
      router.push(`/admin/vendors/${state.data.vendorId}`);
    }
  }, [state, router]);

  const generalError = state && !state.success && state.error && !state.fieldErrors ? state.error : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-[22px]">
      {generalError && (
        <div className="rounded-md border border-[#f6d9da] bg-error-bg px-4 py-3 font-sans text-[13px] text-error">
          {generalError}
        </div>
      )}

      {/* Vendor Information */}
      <SectionCard title="Vendor Information" subtitle="Provide all mandatory details to create a new vendor profile.">
        <div className="grid grid-cols-1 gap-[26px] lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <TextField name="firstName" label="First name" required placeholder="Ex: John" autoComplete="given-name" errors={errors} />
            <TextField name="lastName" label="Last name" required placeholder="Ex: Doe" autoComplete="family-name" errors={errors} />
            <div className="sm:col-span-2">
              <Label required>Phone</Label>
              <div
                className={`flex h-[48px] items-center overflow-hidden rounded-md border bg-bg-subtle transition focus-within:border-iris-500 focus-within:bg-surface focus-within:shadow-[0_0_0_3px_var(--color-iris-100)] ${
                  errors?.phone ? "border-error" : "border-line"
                }`}
              >
                <span className="flex h-full items-center border-r border-line px-3 font-sans text-[13px] font-medium text-ink-soft">+1</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Ex: 555xxxxxxx"
                  autoComplete="tel"
                  className="min-w-0 flex-1 border-none bg-transparent px-[14px] font-sans text-[13.5px] text-ink outline-none"
                />
              </div>
              <FieldError message={errors?.phone} />
            </div>
          </div>
          <ImageUploadField
            name="image"
            label="Vendor Image"
            required
            hint="JPEG, PNG, JPG, WEBP · Max 2MB (1:1)"
            accept={IMAGE_ACCEPT_ATTR}
            error={errors?.image}
          />
        </div>
      </SectionCard>

      {/* Account Information */}
      <SectionCard title="Account Information" subtitle="Provide the account details required for vendor operations.">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
          <TextField name="email" label="Email" required type="email" placeholder="Ex: john@company.com" autoComplete="off" errors={errors} />
          <PasswordField name="password" label="Password" placeholder="Password minimum 8 characters" errors={errors} />
          <PasswordField name="confirmPassword" label="Confirm password" placeholder="Confirm password" errors={errors} />
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-md border border-iris-100 bg-iris-50 px-4 py-3">
          <Icon name="lock" size={16} strokeWidth={2} className="mt-0.5 flex-none text-iris-500" />
          <p className="font-sans text-[12.5px] leading-[1.5] text-accent-fg">
            This is a <span className="font-semibold">temporary password</span> — share it with the vendor so they can
            sign in. (Email invites come later.)
          </p>
        </div>
      </SectionCard>

      {/* Shop Information */}
      <SectionCard title="Shop Information" subtitle="Basic shop details provided below.">
        <div className="mb-[22px] grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <TextField name="storeName" label="Shop name" required placeholder="Ex: John's Store" errors={errors} />
          <div>
            <Label required>Shop address</Label>
            <textarea
              name="address"
              maxLength={100}
              placeholder="Ex: 148 Maple Court, New York"
              aria-invalid={!!errors?.address}
              className={`h-[48px] w-full resize-none rounded-md border bg-bg-subtle px-[14px] py-3 font-sans text-[13.5px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)] ${
                errors?.address ? "border-error" : "border-line"
              }`}
            />
            <FieldError message={errors?.address} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <ImageUploadField name="logo" label="Shop logo" required hint="JPEG, PNG, JPG, WEBP · Max 2MB (1:1)" accept={IMAGE_ACCEPT_ATTR} error={errors?.logo} />
          <ImageUploadField name="coverImage" label="Shop cover image" required hint="JPEG, PNG, JPG, WEBP · Max 2MB (4:1)" accept={IMAGE_ACCEPT_ATTR} error={errors?.coverImage} />
        </div>
      </SectionCard>

      {/* Business TIN */}
      <SectionCard title="Business TIN" subtitle="Provide vendor business TIN and related information for taxpayer verification.">
        <div className="grid grid-cols-1 gap-[26px] lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-5">
            <TextField name="tinNumber" label="Taxpayer identification number (TIN)" placeholder="Type TIN number" errors={errors} />
            <div>
              <Label>Expire Date</Label>
              <input name="tinExpireDate" type="date" className={`${inputBase} border-line`} />
            </div>
          </div>
          <FileUploadField name="tinCertificate" label="TIN Certificate" hint="PDF, JPG, PNG, WEBP · Max 2MB" accept={CERT_ACCEPT_ATTR} error={errors?.tinCertificate} />
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="reset"
          className="h-[48px] rounded-md border border-line bg-surface px-7 font-sans text-[14px] font-semibold text-ink-soft transition-colors hover:bg-field"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex h-[48px] items-center gap-2 rounded-md bg-iris-500 px-7 font-display text-[14px] font-bold text-white transition-colors hover:bg-iris-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {pending ? "Saving…" : "Save information"}
        </button>
      </div>
    </form>
  );
}
