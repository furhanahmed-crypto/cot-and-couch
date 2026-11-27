import { asc, count, eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { collections, productCollections } from "@/db/schema";
import { withUniqueMessage } from "@/lib/db-errors";
import type { CollectionAdminRow } from "@/types/admin-catalogue";
import type { collectionFormSchema } from "@/validation/catalogue";

type CollectionData = z.output<typeof collectionFormSchema>;
const DUPLICATE_MESSAGE = "This slug is already used by another collection";

export async function listCollectionsForAdmin(): Promise<CollectionAdminRow[]> {
  return db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      isFeatured: collections.isFeatured,
      isActive: collections.isActive,
      sortOrder: collections.sortOrder,
      productCount: count(productCollections.productId),
    })
    .from(collections)
    .leftJoin(productCollections, eq(productCollections.collectionId, collections.id))
    .groupBy(collections.id)
    .orderBy(asc(collections.sortOrder), asc(collections.name));
}

export async function createCollection(data: CollectionData): Promise<void> {
  await withUniqueMessage(() => db.insert(collections).values(data), DUPLICATE_MESSAGE);
}

export async function updateCollection(id: string, data: CollectionData): Promise<void> {
  await withUniqueMessage(() => db.update(collections).set(data).where(eq(collections.id, id)), DUPLICATE_MESSAGE);
}

/** Products stay; only their membership in this collection is removed. */
export async function deleteCollection(id: string): Promise<void> {
  await db.delete(collections).where(eq(collections.id, id));
}
