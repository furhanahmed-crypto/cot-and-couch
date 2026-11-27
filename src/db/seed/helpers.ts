/** New uuid, made in JS so related rows can be inserted in one batch. */
export function newId(): string {
  return crypto.randomUUID();
}

/** "King 78" -> "king-78" */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** "King 78" -> "KING-78" */
export function toSkuPart(text: string): string {
  return toSlug(text).toUpperCase();
}

/** Whole rupees -> numeric column value. */
export function toMoney(rupees: number): string {
  return rupees.toFixed(2);
}

export function toMoneyOrNull(rupees: number | null): string | null {
  return rupees === null ? null : toMoney(rupees);
}
