import { eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { productVariants } from "@/db/schema";
import { toMoney, toMoneyOrNull } from "@/lib/money";
import type { bulkVariantsSchema } from "@/validation/products";
import { buildSku, getChoiceNames, getVariantProduct, listTakenSkus } from "./variant-lookups";

type BulkData = z.output<typeof bulkVariantsSchema>;
type Combo = {
  sizeLabel: string;
  lengthIn: number | null;
  widthIn: number | null;
  thicknessIn: number | null;
  qualityId: string | null;
  colourId: string | null;
};

/** Same parts as the unique "choice" constraint, so duplicates are skipped before insert. */
export function toChoiceKey(combo: Combo): string {
  return [combo.sizeLabel, combo.lengthIn, combo.widthIn, combo.thicknessIn, combo.qualityId, combo.colourId].join("|");
}

/** Every size x quality x thickness x colour. An empty list means "not used". */
export function listCombos(data: Pick<BulkData, "sizes" | "qualityIds" | "colourIds" | "thicknessIns">): Combo[] {
  const qualityIds = data.qualityIds.length ? data.qualityIds : [null];
  const colourIds = data.colourIds.length ? data.colourIds : [null];
  const thicknesses = data.thicknessIns.length ? data.thicknessIns : [null];
  return data.sizes.flatMap((size) =>
    qualityIds.flatMap((qualityId) =>
      thicknesses.flatMap((thicknessIn) =>
        colourIds.map((colourId) => ({ ...size, lengthIn: size.lengthIn ?? null, widthIn: size.widthIn ?? null, thicknessIn, qualityId, colourId })),
      ),
    ),
  );
}

/** "Add many": creates the missing combinations with one price. Existing ones are left alone. */
export async function bulkCreateVariants(data: BulkData): Promise<{ created: number; skipped: number }> {
  const product = await getVariantProduct(data.productId);
  const names = await getChoiceNames(product, data.qualityIds, data.colourIds, true);
  const existing = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));
  const existingKeys = new Set(existing.map(toChoiceKey));
  const combos = listCombos(data);
  const missing = combos.filter((combo) => !existingKeys.has(toChoiceKey(combo)));
  if (!missing.length) return { created: 0, skipped: combos.length };

  const takenSkus = await listTakenSkus();
  const nextSortOrder = existing.reduce((highest, variant) => Math.max(highest, variant.sortOrder), 0) + 1;
  const rows = missing.map((combo, index) => {
    const sku = buildSku(
      product.slug,
      { ...combo, qualitySlug: names.qualitySlug.get(combo.qualityId ?? ""), colourName: names.colourName.get(combo.colourId ?? "") },
      takenSkus,
    );
    takenSkus.push(sku);
    return { ...combo, productId: product.id, sku, mrp: toMoneyOrNull(data.mrp), price: toMoney(data.price), sortOrder: nextSortOrder + index };
  });
  await db.insert(productVariants).values(rows);
  return { created: rows.length, skipped: combos.length - rows.length };
}
