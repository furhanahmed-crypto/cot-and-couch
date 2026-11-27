import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { shortlistItems } from "@/db/schema";
import { listProductCardsByIds } from "@/services/catalogue/product-card-queries";
import type { ProductCardItem } from "@/types/catalogue";

/** Shortlisted product ids, newest first. */
export async function listShortlistProductIds(profileId: string): Promise<string[]> {
  const rows = await db
    .select({ productId: shortlistItems.productId })
    .from(shortlistItems)
    .where(eq(shortlistItems.profileId, profileId))
    .orderBy(desc(shortlistItems.createdAt));
  return rows.map((row) => row.productId);
}

/** Shortlisted products still on sale (unpublished ones drop out). */
export async function listShortlistCards(profileId: string): Promise<ProductCardItem[]> {
  return listProductCardsByIds(await listShortlistProductIds(profileId));
}
