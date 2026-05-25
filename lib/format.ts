export function formatPrice(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "--";
  return value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

export function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatVolume(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "--";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-MY");
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "--";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "--";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-MY", { dateStyle: "medium" });
}
