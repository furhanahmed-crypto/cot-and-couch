import type { PriceUnit } from "@/constants/products";
import { AppError } from "@/lib/action-result";
import { belongsToProduct, getAddonUnitPrice, getUnitTotal } from "@/lib/pricing";
import type { AddonOption } from "@/types/catalogue";

/** A variant as the order needs it: prices plus the names copied into the snapshot. */
export type OrderLineVariant = {
  id: string;
  productId: string;
  categoryId: string;
  productName: string;
  sku: string;
  sizeLabel: string;
  qualityId: string | null;
  qualityName: string | null;
  colourName: string | null;
  seats: number | null;
  mrp: number | null;
  price: number;
};

export type OrderLineAddon = AddonOption & { categoryId: string; productId: string | null; isActive: boolean };

export type OrderLineRequest = {
  variantId: string;
  quantity: number;
  addonIds: string[];
  customLengthIn: number | null;
  customWidthIn: number | null;
};

export type OrderLine = Omit<OrderLineRequest, "addonIds" | "variantId"> & {
  variant: OrderLineVariant;
  /** Variant price plus add-ons, for one unit. */
  unitPrice: number;
  lineTotal: number;
  addons: { id: string; name: string; priceUnit: PriceUnit; price: number }[];
};

function buildLine(request: OrderLineRequest, variant: OrderLineVariant, addons: OrderLineAddon[]): OrderLine {
  const chosen = request.addonIds.map((addonId) => {
    const addon = addons.find((option) => option.id === addonId);
    const price = addon && belongsToProduct(addon, { id: variant.productId, categoryId: variant.categoryId })
      ? getAddonUnitPrice(addon, variant)
      : null;
    if (!addon || price === null) throw new AppError(`An add-on is not available for ${variant.productName} (${variant.sizeLabel})`);
    return { id: addon.id, name: addon.name, priceUnit: addon.priceUnit, price };
  });
  const unitPrice = getUnitTotal(variant.price, chosen.map((addon) => addon.price));
  return {
    variant,
    quantity: request.quantity,
    customLengthIn: request.customLengthIn,
    customWidthIn: request.customWidthIn,
    unitPrice,
    lineTotal: unitPrice * request.quantity,
    addons: chosen,
  };
}

/**
 * Works out every line and the subtotal from current prices.
 * Throws when a variant is gone or an add-on is not offered for it.
 */
export function buildOrderLines(
  requests: OrderLineRequest[],
  variants: OrderLineVariant[],
  addons: OrderLineAddon[],
): { lines: OrderLine[]; subtotal: number } {
  const lines = requests.map((request) => {
    const variant = variants.find((option) => option.id === request.variantId);
    if (!variant) throw new AppError("An item is no longer available. Remove it and add it again.");
    return buildLine(request, variant, addons);
  });
  return { lines, subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0) };
}
