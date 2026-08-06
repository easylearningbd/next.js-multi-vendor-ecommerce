// Client-safe report constants (NO prisma import) so both the server reporting
// layer (lib/vendor/reports.ts) and client filter UI can share one source.

export type ReportPreset = "today" | "this-week" | "this-month" | "this-year";

export const REPORT_PRESETS: { value: ReportPreset; label: string }[] = [
  { value: "this-year", label: "This Year" },
  { value: "this-month", label: "This Month" },
  { value: "this-week", label: "This Week" },
  { value: "today", label: "Today" },
];

export const DEFAULT_REPORT_PRESET: ReportPreset = "this-year";

export function isReportPreset(v: string | undefined): v is ReportPreset {
  return v === "today" || v === "this-week" || v === "this-month" || v === "this-year";
}
