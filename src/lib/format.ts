const IST_TIME_ZONE = "Asia/Kolkata";
const INDIAN_MOBILE_LENGTH = 10;

/** 123456 -> "₹1,23,456" (Indian grouping, whole rupees). */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Date or ISO string -> "27 Nov 2026", always in IST. */
export function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/** "9876543210" -> "98765 43210". Anything else is returned unchanged. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== INDIAN_MOBILE_LENGTH) return phone;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54);
}
