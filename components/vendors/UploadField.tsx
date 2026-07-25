"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/dashboard/Icon";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 font-sans text-[12px] text-error" role="alert">
      {message}
    </p>
  );
}

export function ImageUploadField({
  name,
  label,
  required,
  hint,
  error,
  accept,
}: {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setPreview(objectUrl.current);
  }
  function remove() {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  }

  return (
    <div>
      <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink-soft">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {hint && <div className="mb-3 font-sans text-[11.5px] leading-[1.4] text-muted-soft">{hint}</div>}
      <input ref={inputRef} type="file" name={name} accept={accept} onChange={onPick} className="hidden" />
      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-line bg-bg-subtle">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={`${label} preview`} className="h-[150px] w-full object-contain" />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-line bg-surface px-2.5 py-1 font-sans text-[11px] font-semibold text-ink-soft shadow-xs transition-colors hover:bg-field"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={remove}
              className="rounded-md border border-[#f6d9da] bg-error-bg px-2.5 py-1 font-sans text-[11px] font-semibold text-error shadow-xs transition-[filter] hover:brightness-95"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-[150px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed bg-surface p-6 text-center transition-colors hover:border-iris-500 ${
            error ? "border-error" : "border-[#d6d4dd]"
          }`}
        >
          <Icon name="image" size={30} strokeWidth={1.6} className="text-muted-soft" />
          <span className="mt-1 font-sans text-[12px] font-semibold text-iris-500">Click to upload</span>
          <span className="font-sans text-[11px] text-muted-soft">Or drag and drop</span>
        </button>
      )}
      <FieldError message={error} />
    </div>
  );
}

export function FileUploadField({
  name,
  label,
  hint,
  error,
  accept,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div>
      <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink-soft">{label}</label>
      {hint && <div className="mb-3 font-sans text-[11.5px] leading-[1.4] text-muted-soft">{hint}</div>}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[100px] w-full flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed bg-surface p-6 text-center transition-colors hover:border-iris-500 ${
          error ? "border-error" : "border-[#d6d4dd]"
        }`}
      >
        <Icon name="upload" size={26} strokeWidth={1.6} className="text-muted-soft" />
        {fileName ? (
          <span className="flex items-center gap-2 font-sans text-[12.5px] font-medium text-ink">
            {fileName}
            <span
              role="button"
              tabIndex={0}
              onClick={(ev) => {
                ev.stopPropagation();
                if (inputRef.current) inputRef.current.value = "";
                setFileName(null);
              }}
              className="text-error"
            >
              <Icon name="x" size={14} strokeWidth={2.2} />
            </span>
          </span>
        ) : (
          <span className="font-sans text-[12.5px] text-ink-soft">
            Select a file or <span className="font-semibold text-iris-500">Drag and Drop here</span>
          </span>
        )}
      </button>
      <FieldError message={error} />
    </div>
  );
}
