import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db, options, optionGroups, productOptions, productVariants } from "@/db";

async function colourOptionIdSet() {
  const [colourGroup] = await db
    .select({ id: optionGroups.id })
    .from(optionGroups)
    .where(eq(optionGroups.key, "colour"))
    .limit(1);
  if (!colourGroup) return new Set<string>();

  const rows = await db
    .select({ id: options.id })
    .from(options)
    .where(eq(options.groupId, colourGroup.id));
  return new Set(rows.map((r) => r.id));
}

/** Colour option ids linked to a product. */
export async function listProductColourIds(productId: string) {
  const colourSet = await colourOptionIdSet();
  if (!colourSet.size) return [] as string[];

  const rows = await db
    .select({ optionId: productOptions.optionId })
    .from(productOptions)
    .where(eq(productOptions.productId, productId));

  return rows.map((r) => r.optionId).filter((id) => colourSet.has(id));
}

/**
 * Replace product colour allowlist.
 * Deactivates variants for removed colours; reactivates for re-added ones.
 */
export async function syncProductColours(
  productId: string,
  colourOptionIds: string[],
) {
  const colourSet = await colourOptionIdSet();
  const next = [
    ...new Set(colourOptionIds.filter((id) => colourSet.has(id))),
  ];
  const prev = await listProductColourIds(productId);
  const prevSet = new Set(prev);

  if (prev.length) {
    await db
      .delete(productOptions)
      .where(
        and(
          eq(productOptions.productId, productId),
          inArray(productOptions.optionId, prev),
        ),
      );
  }

  if (next.length) {
    await db.insert(productOptions).values(
      next.map((optionId) => ({ productId, optionId })),
    );
  }

  const removed = prev.filter((id) => !next.includes(id));
  if (removed.length) {
    await db
      .update(productVariants)
      .set({ isActive: false })
      .where(
        and(
          eq(productVariants.productId, productId),
          inArray(productVariants.colourOptionId, removed),
        ),
      );
  }

  const added = next.filter((id) => !prevSet.has(id));
  if (added.length) {
    await db
      .update(productVariants)
      .set({ isActive: true })
      .where(
        and(
          eq(productVariants.productId, productId),
          inArray(productVariants.colourOptionId, added),
        ),
      );
  }

  if (!next.length) {
    await db
      .update(productVariants)
      .set({ isActive: false })
      .where(
        and(
          eq(productVariants.productId, productId),
          isNotNull(productVariants.colourOptionId),
        ),
      );
  }
}
