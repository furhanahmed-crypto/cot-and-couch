import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { addonPrices, addons } from "@/db/schema";
import { toRupees } from "@/lib/money";
import type { AddonOption } from "@/types/catalogue";
import type { AddonRow } from "@/types/db";

/** An add-on row with its prices, plus what a cart needs to check it. */
export type CartAddonOption = AddonOption & Pick<AddonRow, "categoryId" | "productId" | "isActive">;

/** Loads add-ons by id with their price per quality. */
export async function listAddonOptionsByIds(ids: string[]): Promise<CartAddonOption[]> {
  if (!ids.length) return [];
  const [addonRows, priceRows] = await Promise.all([
    db.select().from(addons).where(inArray(addons.id, ids)),
    db.select().from(addonPrices).where(inArray(addonPrices.addonId, ids)),
  ]);
  return addonRows.map((addon) => ({
    id: addon.id,
    name: addon.name,
    kind: addon.kind,
    priceUnit: addon.priceUnit,
    sizeLabel: addon.sizeLabel,
    categoryId: addon.categoryId,
    productId: addon.productId,
    isActive: addon.isActive,
    prices: Object.fromEntries(
      priceRows.filter((price) => price.addonId === addon.id).map((price) => [price.qualityId, toRupees(price.price)]),
    ),
  }));
}
