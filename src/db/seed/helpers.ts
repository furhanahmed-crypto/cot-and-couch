import { toMoney, toMoneyOrNull } from "@/lib/money";
import { toSlug } from "@/lib/slug";

export { toMoney, toMoneyOrNull, toSlug };

/** New uuid, made in JS so related rows can be inserted in one batch. */
export function newId(): string {
  return crypto.randomUUID();
}

/** "King 78" -> "KING-78" */
export function toSkuPart(text: string): string {
  return toSlug(text).toUpperCase();
}
