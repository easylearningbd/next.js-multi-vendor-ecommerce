"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/dashboard/Icon";
import { IMAGE_ACCEPT_ATTR } from "@/lib/product-validation";

export type VariationRow = {
  key: string; // stable identity = signature of the attribute combination
  name: string; // "Red / M"
  attributes: Record<string, string>;
  price: string;
  stock: string;
  sku: string;
  image: File | null;
  preview: string | null;
};

type Attribute = { id: string; name: string; values: string[] };

let uid = 0;
const nextId = () => `a${++uid}`;
const sig = (attrs: Record<string, string>) =>
  Object.entries(attrs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("|");

// Cartesian product of the attributes' value lists → one combination per row.
function combine(attrs: Attribute[]): Record<string, string>[] {
  const usable = attrs.filter((a) => a.name.trim() && a.values.length);
  if (!usable.length) return [];
  let acc: Record<string, string>[] = [{}];
  for (const a of usable) {
    const next: Record<string, string>[] = [];
    for (const combo of acc) for (const v of a.values) next.push({ ...combo, [a.name.trim()]: v });
    acc = next;
  }
  return acc;
}

const inputSm =
  "h-[38px] w-full rounded-lg border border-line bg-bg-subtle px-2.5 font-sans text-[12.5px] text-ink outline-none transition focus:border-iris-500 focus:bg-surface";

export function VariationBuilder({
  enabled,
  setEnabled,
  rows,
  setRows,
  defaultPrice,
  error,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  rows: VariationRow[];
  setRows: (r: VariationRow[]) => void;
  defaultPrice: string;
  error?: string;
}) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const setAttr = (id: string, patch: Partial<Attribute>) =>
    setAttributes((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const addAttribute = () => setAttributes((prev) => [...prev, { id: nextId(), name: "", values: [] }]);
  const removeAttribute = (id: string) => setAttributes((prev) => prev.filter((a) => a.id !== id));
  const addValue = (id: string) => {
    const v = (drafts[id] ?? "").trim();
    if (!v) return;
    setAttributes((prev) =>
      prev.map((a) => (a.id === id && !a.values.includes(v) ? { ...a, values: [...a.values, v] } : a)),
    );
    setDrafts((d) => ({ ...d, [id]: "" }));
  };
  const removeValue = (id: string, val: string) =>
    setAttr(id, { values: attributes.find((a) => a.id === id)!.values.filter((v) => v !== val) });

  function generate() {
    const combos = combine(attributes);
    const byKey = new Map(rows.map((r) => [r.key, r]));
    const next: VariationRow[] = combos.map((attrs) => {
      const key = sig(attrs);
      const existing = byKey.get(key);
      return (
        existing ?? {
          key,
          name: Object.values(attrs).join(" / "),
          attributes: attrs,
          price: defaultPrice || "",
          stock: "0",
          sku: "",
          image: null,
          preview: null,
        }
      );
    });
    setRows(next);
  }

  const updateRow = (key: string, patch: Partial<VariationRow>) =>
    setRows(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const removeRow = (key: string) => setRows(rows.filter((r) => r.key !== key));

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-display text-[18px] font-bold text-ink">Product Variation Setup</div>
          <div className="mt-2 font-sans text-[13px] text-muted">
            Add attributes (e.g. Color, Size) and generate a row per combination — each with its own
            price, stock and image.
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(!enabled)}
          className={`relative mt-1 inline-flex h-[24px] w-[44px] flex-none items-center rounded-full transition-colors ${
            enabled ? "bg-iris-500" : "bg-line"
          }`}
        >
          <span
            className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-[22px]" : "translate-x-[2px]"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-6">
          {/* Attribute editors */}
          <div className="flex flex-col gap-3">
            {attributes.map((a) => (
              <div key={a.id} className="rounded-xl border border-line-soft bg-bg-subtle p-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    value={a.name}
                    onChange={(e) => setAttr(a.id, { name: e.target.value })}
                    placeholder="Attribute (e.g. Color)"
                    className={`${inputSm} max-w-[200px] flex-1`}
                  />
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={drafts[a.id] ?? ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addValue(a.id);
                        }
                      }}
                      placeholder="Add a value, press Enter (e.g. Red)"
                      className={`${inputSm} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => addValue(a.id)}
                      className="flex h-[38px] items-center rounded-lg bg-iris-50 px-3 font-sans text-[12px] font-semibold text-iris-500 hover:bg-iris-100"
                    >
                      Add
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttribute(a.id)}
                    aria-label="Remove attribute"
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-error-bg bg-error-bg text-error"
                  >
                    <Icon name="trash" size={15} strokeWidth={2} />
                  </button>
                </div>
                {a.values.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {a.values.map((v) => (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1.5 rounded-full bg-iris-50 px-2.5 py-1 font-sans text-[11.5px] font-medium text-iris-600"
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => removeValue(a.id, v)}
                          aria-label={`Remove ${v}`}
                          className="text-iris-400 hover:text-error"
                        >
                          <Icon name="x" size={12} strokeWidth={2.4} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addAttribute}
              className="flex h-[40px] items-center gap-2 rounded-lg border border-line bg-surface px-4 font-sans text-[13px] font-semibold text-ink-soft hover:bg-field"
            >
              <Icon name="plus" size={15} strokeWidth={2.2} />
              Add attribute
            </button>
            <button
              type="button"
              onClick={generate}
              className="flex h-[40px] items-center gap-2 rounded-lg bg-iris-500 px-4 font-display text-[13px] font-bold text-white hover:bg-iris-600"
            >
              <Icon name="grid" size={15} strokeWidth={2} />
              Generate combinations
            </button>
            {rows.length > 0 && (
              <span className="font-sans text-[12.5px] text-muted">{rows.length} combinations</span>
            )}
          </div>

          {error && <p className="mt-3 font-sans text-[12px] text-error">{error}</p>}

          {/* Generated rows */}
          {rows.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[720px] overflow-hidden rounded-xl border border-line-soft">
                <div className="grid grid-cols-[minmax(120px,1.2fr)_110px_90px_120px_64px_44px] gap-3 bg-field p-[12px_16px] font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                  <span>Combination</span>
                  <span>Price ($)</span>
                  <span>Stock</span>
                  <span>SKU</span>
                  <span>Image</span>
                  <span></span>
                </div>
                {rows.map((r) => (
                  <VariationRowEditor key={r.key} row={r} onChange={(p) => updateRow(r.key, p)} onRemove={() => removeRow(r.key)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VariationRowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: VariationRow;
  onChange: (patch: Partial<VariationRow>) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objUrl = useRef<string | null>(null);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    objUrl.current = URL.createObjectURL(f);
    onChange({ image: f, preview: objUrl.current });
  }

  return (
    <div className="grid grid-cols-[minmax(120px,1.2fr)_110px_90px_120px_64px_44px] items-center gap-3 border-t border-line-soft p-[10px_16px]">
      <span className="truncate font-sans text-[12.5px] font-semibold text-ink">{row.name}</span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={row.price}
        onChange={(e) => onChange({ price: e.target.value })}
        className={inputSm}
      />
      <input
        type="number"
        step="1"
        min="0"
        value={row.stock}
        onChange={(e) => onChange({ stock: e.target.value })}
        className={inputSm}
      />
      <input
        value={row.sku}
        onChange={(e) => onChange({ sku: e.target.value })}
        placeholder="Optional"
        className={inputSm}
      />
      <div>
        <input ref={inputRef} type="file" accept={IMAGE_ACCEPT_ATTR} onChange={pick} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-[38px] w-[44px] items-center justify-center overflow-hidden rounded-lg border border-line bg-bg-subtle text-muted-soft hover:border-iris-500"
        >
          {row.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name="image" size={16} strokeWidth={1.8} />
          )}
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${row.name}`}
        className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-error-bg bg-error-bg text-error"
      >
        <Icon name="trash" size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
