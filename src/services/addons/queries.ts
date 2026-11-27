import { and, asc, eq, inArray, isNull, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { addonPrices, addons } from "@/db/schema";
import { toRupees } from "@/lib/money";
import type { AddonAdminRow } from "@/types/admin-catalogue";

async function listAddons(where: SQL | undefined): Promise<AddonAdminRow[]> {
  const rows = await db.select().from(addons).where(where).orderBy(asc(addons.sortOrder), asc(addons.name));
  if (!rows.length) return [];
  const priceRows = await db
    .select()
    .from(addonPrices)
    .where(inArray(addonPrices.addonId, rows.map((row) => row.id)));
  return rows.map((row) => ({
    id: row.id,
    categoryId: row.categoryId,
    productId: row.productId,
    name: row.name,
    kind: row.kind,
    priceUnit: row.priceUnit,
    sizeLabel: row.sizeLabel,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    prices: Object.fromEntries(
      priceRows.filter((price) => price.addonId === row.id).map((price) => [price.qualityId, toRupees(price.price)]),
    ),
  }));
}

/** Add-ons for the whole category (cots). */
export function listCategoryAddons(categoryId: string): Promise<AddonAdminRow[]> {
  return listAddons(and(eq(addons.categoryId, categoryId), isNull(addons.productId)));
}

/** Add-ons that belong to one product (sofas). */
export function listProductAddons(productId: string): Promise<AddonAdminRow[]> {
  return listAddons(eq(addons.productId, productId));
}

/** True when any of these add-ons is category-wide (those need an admin). Unknown ids count as category-wide. */
export async function includesCategoryAddon(addonIds: string[]): Promise<boolean> {
  if (!addonIds.length) return false;
  const rows = await db
    .select({ productId: addons.productId })
    .from(addons)
    .where(inArray(addons.id, addonIds));
  return rows.length !== addonIds.length || rows.some((row) => row.productId === null);
}
