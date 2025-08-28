export const BAR_COLORS = [
  "#008037", "#FAC300", "#888AA0", "#10b981", "#3b82f6",
  "#8b5cf6", "#f43f5e", "#f97316", "#14b8a6", "#ec4899",
];

export const currency = (n?: number) => (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0 });
export const fixed2 = (n?: number) => (n ?? 0).toFixed(2);