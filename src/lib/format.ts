export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54);
}

export function stockLabel(
  status: string,
  qty: number,
  days?: [number, number],
): string {
  if (status === "out_of_stock") return "Out of stock";
  if (status === "low_stock") return `Only ${qty} left`;
  if (status === "made_to_order") {
    return days ? `Made to order (${days[0]}–${days[1]} days)` : "Made to order";
  }
  return "In stock";
}
