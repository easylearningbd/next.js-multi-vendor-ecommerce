"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { updateProfile, type FormState } from "@/lib/auth-actions";
import { IMAGE_ACCEPT_ATTR } from "@/lib/brand-validation";
import { TextField, SubmitButton } from "@/components/auth/AuthFields";
import { Icon } from "./Icon";

export function CustomerProfileForm({
  firstName,
  lastName,
  email,
  phone,
  image,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image?: string | null;
}) {
  const [state, formAction, pending] = useActionState<FormState | undefined, FormData>(
    updateProfile,
    undefined,
  );

  // Image: pick a new file (client preview) or remove the current one (a hidden
  // flag tells the action to null the column). A new pick always wins over remove.
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const shown = preview ?? (removed ? null : image ?? null);

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(f);
    setPreview(objectUrl.current);
    setRemoved(false);
  }

  function removeImage() {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    if (fileInput.current) fileInput.current.value = "";
    setPreview(null);
    setRemoved(true);
  }

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state && !state.fieldErrors && !state.error) toast.success("Profile updated");
  }, [state]);

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "Your profile";

  return (
    <form action={formAction} noValidate>
      {/* Avatar */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative">
          <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border border-iris-100 bg-[linear-gradient(135deg,var(--color-iris-100),var(--color-iris-50))] text-iris-400">
            {shown ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shown} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <Icon name="user" size={56} strokeWidth={1.6} />
            )}
          </div>
          <button
            type="button"
            aria-label={shown ? "Change photo" : "Add photo"}
            onClick={() => fileInput.current?.click()}
            className="absolute bottom-1 right-1 flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-surface bg-iris-500 text-white transition-colors hover:bg-iris-600"
          >
            <Icon name="camera" size={16} strokeWidth={2} />
          </button>
          {shown && (
            <button
              type="button"
              aria-label="Remove photo"
              onClick={removeImage}
              className="absolute right-1 top-1 flex h-[26px] w-[26px] items-center justify-center rounded-full border-[3px] border-surface bg-error-bg text-error transition-[filter] hover:brightness-95"
            >
              <Icon name="x" size={13} strokeWidth={2.4} />
            </button>
          )}
        </div>

        {/* File input + remove flag (submitted with the form) */}
        <input
          ref={fileInput}
          type="file"
          name="image"
          accept={IMAGE_ACCEPT_ATTR}
          onChange={pickImage}
          className="hidden"
        />
        <input type="hidden" name="removeImage" value={removed ? "true" : "false"} />

        <div className="mt-4 font-display text-[18px] font-bold text-ink">{displayName}</div>
        {state?.fieldErrors?.image && (
          <p className="mt-2 font-sans text-[12px] text-error" role="alert">
            {state.fieldErrors.image}
          </p>
        )}
      </div>

      <div className="mx-auto grid max-w-[840px] grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2">
        <TextField
          label="First Name"
          name="firstName"
          defaultValue={firstName}
          error={state?.fieldErrors?.firstName}
        />
        <TextField
          label="Last Name"
          name="lastName"
          defaultValue={lastName}
          error={state?.fieldErrors?.lastName}
        />
        <TextField
          label="Phone Number"
          name="phone"
          type="tel"
          defaultValue={phone}
          placeholder="Add a phone number"
          autoComplete="tel"
          error={state?.fieldErrors?.phone}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          defaultValue={email}
          autoComplete="email"
          error={state?.fieldErrors?.email}
        />
      </div>

      <div className="mx-auto mt-8 flex max-w-[840px] justify-end">
        <SubmitButton pending={pending} className="w-auto px-8">
          {pending ? "Updating…" : "Update Profile"}
        </SubmitButton>
      </div>
    </form>
  );
}
