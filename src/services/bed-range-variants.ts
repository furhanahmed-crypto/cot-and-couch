import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  db,
  options,
  optionGroups,
  productBedRanges,
  products,
  productVariants,
} from "@/db";
import { BED_WIDTH_GROUP_KEY } from "@/constants/bed-model";
import {
  bedSizeKeyFromSlug,
  bedVariantPrices,
} from "@/constants/bed-pricing";
import { listProductBedRanges } from "@/services/product-bed-ranges";
import { listProductColourIds } from "@/services/product-colours";

/**
 * Ensure every linked bed range has width × colour SKUs for this product.
 * Missing ranges are seeded from the range price sheet (does not overwrite edits).
 */
export async function ensureBedRangeVariants(
  productId: string,
  slugBase: string,
) {
  const linked = await listProductBedRanges(productId);
  if (!linked.length) return { created: 0 };

  const [widthGroup] = await db
    .select({ id: optionGroups.id })
    .from(optionGroups)
    .where(eq(optionGroups.key, BED_WIDTH_GROUP_KEY))
    .limit(1);
  if (!widthGroup) return { created: 0 };

  const widths = await db
    .select()
    .from(options)
    .where(
      and(eq(options.groupId, widthGroup.id), eq(options.isActive, true)),
    );
  const colourIds = await listProductColourIds(productId);
  if (!widths.length || !colourIds.length) return { created: 0 };

  const colourRows = await db
    .select({ id: options.id, slug: options.slug })
    .from(options)
    .where(inArray(options.id, colourIds));
  const colourSlugById = new Map(colourRows.map((c) => [c.id, c.slug]));

  const existing = await db
    .select({
      bedRangeId: productVariants.bedRangeId,
      widthOptionId: productVariants.widthOptionId,
      colourOptionId: productVariants.colourOptionId,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const have = new Set(
    existing.map(
      (r) =>
        `${r.bedRangeId ?? ""}:${r.widthOptionId ?? ""}:${r.colourOptionId ?? ""}`,
    ),
  );

  const batch: (typeof productVariants.$inferInsert)[] = [];
  const prefix = slugBase.slice(0, 20).toUpperCase();

  for (const range of linked) {
    for (const w of widths) {
      const sizeKey = bedSizeKeyFromSlug(w.slug);
      const isExtra = w.slug.includes("-78x");
      const priced =
        sizeKey != null
          ? bedVariantPrices(range.slug, sizeKey, isExtra)
          : null;
      if (!priced) continue;
      for (const colourId of colourIds) {
        const key = `${range.id}:${w.id}:${colourId}`;
        if (have.has(key)) continue;
        const colourSlug =
          colourSlugById.get(colourId) ?? colourId.slice(0, 8);
        batch.push({
          productId,
          sku: `${prefix}-${range.slug.slice(0, 10)}-${w.slug}-${colourSlug}`
            .slice(0, 80)
            .toUpperCase(),
          widthOptionId: w.id,
          colourOptionId: colourId,
          bedRangeId: range.id,
          mrp: String(priced.mrp),
          price: String(priced.price),
          stockQty: 0,
          isActive: true,
        });
      }
    }
  }

  if (batch.length) {
    await db.insert(productVariants).values(batch);
  }
  return { created: batch.length };
}

/** Attach null-range cot SKUs to primary, then fill missing linked ranges. */
export async function backfillMissingRangeVariants() {
  const linkedProductIds = await db
    .selectDistinct({ productId: productBedRanges.productId })
    .from(productBedRanges);

  if (!linkedProductIds.length) return { created: 0, products: 0 };

  const cotProducts = await db
    .select({
      id: products.id,
      slug: products.slug,
      bedRangeId: products.bedRangeId,
    })
    .from(products)
    .where(
      inArray(
        products.id,
        linkedProductIds.map((r) => r.productId),
      ),
    );

  let created = 0;
  for (const p of cotProducts) {
    if (p.bedRangeId) {
      await db
        .update(productVariants)
        .set({ bedRangeId: p.bedRangeId })
        .where(
          and(
            eq(productVariants.productId, p.id),
            isNull(productVariants.bedRangeId),
          ),
        );
    }
    const res = await ensureBedRangeVariants(p.id, p.slug);
    created += res.created;
  }
  return { created, products: cotProducts.length };
}
