import { eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { addonPrices, addons, products, qualities } from "@/db/schema";
import { AppError } from "@/lib/action-result";
import { toMoney } from "@/lib/money";
import type { addonFormSchema, addonPriceGridSchema } from "@/validation/catalogue";

type AddonData = z.output<typeof addonFormSchema>;
type PriceGridData = z.output<typeof addonPriceGridSchema>;

/** A product add-on must belong to a product of the same category. */
async function assertProductInCategory(data: AddonData): Promise<void> {
  if (!data.productId) return;
  const [product] = await db.select({ categoryId: products.categoryId }).from(products).where(eq(products.id, data.productId));
  if (product?.categoryId !== data.categoryId) throw new AppError("This product is not in that category");
}

export async function createAddon(data: AddonData): Promise<void> {
  await assertProductInCategory(data);
  await db.insert(addons).values(data);
}

/** Category and product stay as they were: only name, kind, unit, size and order change. */
export async function updateAddon(id: string, data: AddonData): Promise<void> {
  const changes = {
    name: data.name, kind: data.kind, priceUnit: data.priceUnit, sizeLabel: data.sizeLabel,
    isActive: data.isActive, sortOrder: data.sortOrder,
  };
  await db.update(addons).set(changes).where(eq(addons.id, id));
}

/** Past orders keep the add-on's name and price (snapshot); carts lose it. */
export async function deleteAddon(id: string): Promise<void> {
  await db.delete(addons).where(eq(addons.id, id));
}

/** Every cell must pair an add-on with a quality of the same category. */
async function assertGridMatches(data: PriceGridData): Promise<void> {
  const qualityIds = [...new Set(data.cells.map((cell) => cell.qualityId))];
  const [addonRows, qualityRows] = await Promise.all([
    db.select({ id: addons.id, categoryId: addons.categoryId }).from(addons).where(inArray(addons.id, data.addonIds)),
    qualityIds.length
      ? db.select({ id: qualities.id, categoryId: qualities.categoryId }).from(qualities).where(inArray(qualities.id, qualityIds))
      : Promise.resolve([]),
  ]);
  if (addonRows.length !== data.addonIds.length) throw new AppError("An add-on was deleted. Reload the page.");
  const isValid = data.cells.every((cell) => {
    const addon = addonRows.find((row) => row.id === cell.addonId);
    const quality = qualityRows.find((row) => row.id === cell.qualityId);
    return addon && quality && addon.categoryId === quality.categoryId;
  });
  if (!isValid) throw new AppError("A price does not match its add-on and quality. Reload the page.");
}

/** Replaces all prices of these add-ons in one transaction. Empty cells = not offered. */
export async function saveAddonPriceGrid(data: PriceGridData): Promise<void> {
  if (!data.addonIds.length) return;
  await assertGridMatches(data);
  const removeOld = db.delete(addonPrices).where(inArray(addonPrices.addonId, data.addonIds));
  if (!data.cells.length) {
    await removeOld;
    return;
  }
  const rows = data.cells.map((cell) => ({ addonId: cell.addonId, qualityId: cell.qualityId, price: toMoney(cell.price) }));
  await db.batch([removeOld, db.insert(addonPrices).values(rows)]);
}
