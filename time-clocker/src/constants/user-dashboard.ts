export const TZ = "America/Bogota";

export const moneyCO = (n: number) => (n ?? 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
export const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const BAR_COLORS = ["#008037", "#E0AF00", "#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#f97316", "#14b8a6", "#ec4899"];

export const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const daysDiff = (a: Date, b: Date) =>
  Math.floor((stripTime(a).getTime() - stripTime(b).getTime()) / 86400000);
