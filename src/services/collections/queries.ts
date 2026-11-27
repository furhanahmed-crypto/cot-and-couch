import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { tagShopCache } from "@/lib/cache-tags";
import { toCollectionItem } from "@/services/catalogue/mappers";
import type { CollectionItem } from "@/types/catalogue";

export async function listCollections(): Promise<CollectionItem[]> {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.isActive, true))
    .orderBy(asc(collections.sortOrder));
  return rows.map(toCollectionItem);
}

export async function getCollectionBySlug(slug: string): Promise<CollectionItem | null> {
  "use cache";
  tagShopCache();
  const [row] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.slug, slug), eq(collections.isActive, true)))
    .limit(1);
  return row ? toCollectionItem(row) : null;
}
