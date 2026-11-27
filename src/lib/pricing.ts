import type { AddonOption, VariantOption } from "@/types/catalogue";

type PricedAddon = Pick<AddonOption, "priceUnit" | "sizeLabel" | "prices">;
type PricedVariant = Pick<VariantOption, "qualityId" | "sizeLabel" | "seats">;

/**
 * Price of one add-on for one unit of this variant, or null when the add-on
 * is not offered for it (no price for the quality, wrong size, or a per-seat
 * add-on on a variant without a seat count).
 */
export function getAddonUnitPrice(addon: PricedAddon, variant: PricedVariant): number | null {
  if (addon.sizeLabel && addon.sizeLabel !== variant.sizeLabel) return null;
  if (!variant.qualityId) return null;
  const price = addon.prices[variant.qualityId];
  if (price === undefined) return null;
  if (addon.priceUnit === "fixed") return price;
  if (!variant.seats) return null;
  return price * variant.seats;
}

/** The add-ons that can be chosen for this variant. */
export function listOfferedAddons<T extends PricedAddon>(addons: T[], variant: PricedVariant): T[] {
  return addons.filter((addon) => getAddonUnitPrice(addon, variant) !== null);
}

/** Variant price plus the chosen add-on prices, for one unit. */
export function getUnitTotal(price: number, addonUnitPrices: number[]): number {
  return addonUnitPrices.reduce((sum, addonPrice) => sum + addonPrice, price);
}

type OwnedAddon = { isActive: boolean; categoryId: string; productId: string | null };

/** True when the add-on is active and belongs to this product or its category. */
export function belongsToProduct(addon: OwnedAddon, product: { id: string; categoryId: string }): boolean {
  if (!addon.isActive || addon.categoryId !== product.categoryId) return false;
  return addon.productId === null || addon.productId === product.id;
}
