"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateProfile, type FormState } from "@/lib/auth-actions";
import { Icon } from "./Icon";

const labelClass =
  "flex items-center gap-1.5 font-sans text-[13px] font-semibold text-ink-soft mb-2.5";
const inputBase =
  "h-[50px] w-full rounded-xl border border-line bg-bg-subtle px-[15px] font-sans text-[14px] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-iris-500 focus:bg-surface focus:shadow-[0_0_0_3px_var(--color-iris-100)]";

function RequiredMark() {
  return <span className="text-error">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 font-sans text-[12px] text-error" role="alert">
      {message}
    </p>
  );
}

export function VendorProfileForm({
  firstName,
  lastName,
  email,
  phone,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    updateProfile,
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (!state.fieldErrors) {
      toast.success("Profile updated");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      noValidate
      className="overflow-hidden rounded-[18px] border border-line-soft bg-surface shadow-xs"
    >
      {/* Cover + avatar */}
      <div className="relative h-[200px] bg-[linear-gradient(120deg,var(--color-iris-100)_0%,var(--color-iris-50)_50%,#fbfaff_100%)]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(101,68,224,0.05)_0_1px,transparent_1px_26px)]" />
        <div className="absolute bottom-[-52px] left-1/2 -translate-x-1/2">
          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-surface bg-surface text-iris-500 shadow-[0_10px_30px_-10px_rgba(20,18,31,.3)]">
            <Icon name="user" size={52} strokeWidth={1.5} />
            <button
              type="button"
              aria-label="Change photo"
              className="absolute bottom-0.5 right-0.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-surface bg-iris-500 text-white transition-colors hover:bg-iris-600"
            >
              <Icon name="camera" size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="px-[30px] pb-[30px] pt-[72px]">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-iris-50 text-iris-500">
            <Icon name="user" size={17} strokeWidth={2} />
          </span>
          <span className="font-display text-[17px] font-bold text-ink">Basic Information</span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First Name <RequiredMark />
            </label>
            <input
              id="firstName"
              name="firstName"
              defaultValue={firstName}
              aria-invalid={!!state?.fieldErrors?.firstName}
              className={inputBase}
            />
            <FieldError message={state?.fieldErrors?.firstName} />
          </div>

          <div>
            <label htmlFor="lastName" className={labelClass}>
              Last Name <RequiredMark />
            </label>
            <input
              id="lastName"
              name="lastName"
              defaultValue={lastName}
              aria-invalid={!!state?.fieldErrors?.lastName}
              className={inputBase}
            />
            <FieldError message={state?.fieldErrors?.lastName} />
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone Number
            </label>
            <div className="flex h-[50px] items-center overflow-hidden rounded-xl border border-line bg-bg-subtle transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-iris-500 focus-within:bg-surface focus-within:shadow-[0_0_0_3px_var(--color-iris-100)]">
              <span className="flex h-full items-center gap-1.5 whitespace-nowrap border-r border-line px-3 font-sans text-[13px] font-medium text-ink-soft">
                +1
                <Icon name="chevronDown" size={13} strokeWidth={2} className="text-muted" />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={phone}
                placeholder="Add a phone number"
                className="min-w-0 flex-1 border-none bg-transparent px-3.5 font-sans text-[14px] text-ink outline-none"
              />
            </div>
            <FieldError message={state?.fieldErrors?.phone} />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email <RequiredMark />
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="h-[50px] w-full cursor-not-allowed rounded-xl border border-line bg-field px-[15px] font-sans text-[14px] text-muted outline-none"
            />
          </div>
        </div>

        <div className="mt-7 flex justify-end">
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
      </div>
    </form>
  );
}
