import { asc, eq, inArray } from "drizzle-orm";
import { db, bedRanges, productBedRanges, products } from "@/db";

export type ProductBedRangeRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

/** Linked bed ranges for one product, sorted by range sort_order. */
export async function listProductBedRanges(productId: string) {
  const links = await db
    .select({ bedRangeId: productBedRanges.bedRangeId })
    .from(productBedRanges)
    .where(eq(productBedRanges.productId, productId));
  if (!links.length) return [] as ProductBedRangeRow[];

  const rows = await db
    .select({
      id: bedRanges.id,
      name: bedRanges.name,
      slug: bedRanges.slug,
      sortOrder: bedRanges.sortOrder,
    })
    .from(bedRanges)
    .where(
      inArray(
        bedRanges.id,
        links.map((l) => l.bedRangeId),
      ),
    )
    .orderBy(asc(bedRanges.sortOrder));

  return rows;
}

/** Batch: productId → ranges sorted by sort_order. */
export async function listProductBedRangesByProductIds(productIds: string[]) {
  const map = new Map<string, ProductBedRangeRow[]>();
  if (!productIds.length) return map;

  const links = await db
    .select({
      productId: productBedRanges.productId,
      bedRangeId: productBedRanges.bedRangeId,
    })
    .from(productBedRanges)
    .where(inArray(productBedRanges.productId, productIds));
  if (!links.length) return map;

  const rangeIds = [...new Set(links.map((l) => l.bedRangeId))];
  const ranges = await db
    .select({
      id: bedRanges.id,
      name: bedRanges.name,
      slug: bedRanges.slug,
      sortOrder: bedRanges.sortOrder,
    })
    .from(bedRanges)
    .where(inArray(bedRanges.id, rangeIds));
  const byId = new Map(ranges.map((r) => [r.id, r]));

  for (const link of links) {
    const range = byId.get(link.bedRangeId);
    if (!range) continue;
    const list = map.get(link.productId) ?? [];
    list.push(range);
    map.set(link.productId, list);
  }

  for (const [pid, list] of map) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    map.set(pid, list);
  }
  return map;
}

/**
 * Replace product ↔ range links.
 * Sets products.bed_range_id to the first range by sort_order (primary).
 */
export async function syncProductBedRanges(
  productId: string,
  bedRangeIds: string[],
) {
  const unique = [...new Set(bedRangeIds.filter(Boolean))];

  await db
    .delete(productBedRanges)
    .where(eq(productBedRanges.productId, productId));

  if (!unique.length) {
    await db
      .update(products)
      .set({ bedRangeId: null, updatedAt: new Date() })
      .where(eq(products.id, productId));
    return [] as ProductBedRangeRow[];
  }

  await db.insert(productBedRanges).values(
    unique.map((bedRangeId) => ({ productId, bedRangeId })),
  );

  const linked = await listProductBedRanges(productId);
  const primary = linked[0]?.id ?? null;
  await db
    .update(products)
    .set({ bedRangeId: primary, updatedAt: new Date() })
    .where(eq(products.id, productId));

  // Fill missing width×colour SKUs for newly linked ranges (keeps edits).
  const [prod] = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (prod && linked.length) {
    const { ensureBedRangeVariants } = await import(
      "@/services/bed-range-variants"
    );
    await ensureBedRangeVariants(productId, prod.slug);
  }

  return linked;
}
