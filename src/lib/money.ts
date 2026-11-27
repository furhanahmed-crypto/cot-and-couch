/**
 * Money helpers. The DB stores rupees as numeric strings ("18800.00");
 * the app works with whole-rupee numbers.
 */

/** "18800.00" -> 18800. Throws if the value is not a number. */
export function toRupees(value: string | number): number {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    throw new Error(`Not a valid amount: ${value}`);
  }
  return Math.round(amount);
}

/** Same as toRupees, but keeps a missing value (e.g. no MRP) as null. */
export function toRupeesOrNull(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toRupees(value);
}

/** Unit price x quantity, in whole rupees. */
export function lineTotal(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity);
}
