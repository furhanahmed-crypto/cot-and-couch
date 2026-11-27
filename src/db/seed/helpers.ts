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

/**
 * Shop order for one category: 1 = lowest starting price. Equal prices keep
 * the order of the price list. `lowestPrices[i]` is product i's cheapest variant.
 */
export function rankByLowestPrice(lowestPrices: number[]): number[] {
  const ranked = lowestPrices.map((price, index) => ({ price, index })).sort((a, b) => a.price - b.price || a.index - b.index);
  return lowestPrices.map((_, index) => ranked.findIndex((item) => item.index === index) + 1);
}

/** The cheapest variant price of each product, in product order. */
export function lowestPriceOf(productIds: string[], variants: { productId: string; price: number }[]): number[] {
  return productIds.map((id) => Math.min(...variants.filter((variant) => variant.productId === id).map((variant) => variant.price)));
}
