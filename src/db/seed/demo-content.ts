import * as schema from "@/db/schema";
import { DEMO_COLLECTIONS, DEMO_GALLERY, DEMO_REELS, STORE_SETTINGS } from "./data/demo";
import { db } from "./db";
import { newId } from "./helpers";

/** Store details, two demo collections and published gallery photos / reels. */
export async function seedDemoContent(collectionProductIds: string[][]) {
  const collections = DEMO_COLLECTIONS.map((collection, index) => ({
    ...collection,
    id: newId(),
    sortOrder: index + 1,
  }));
  const memberships = collections.flatMap((collection, index) =>
    (collectionProductIds[index] ?? []).map((productId) => ({ productId, collectionId: collection.id })),
  );

  await db.batch([
    db.insert(schema.storeSettings).values(STORE_SETTINGS),
    db.insert(schema.collections).values(collections),
    db.insert(schema.productCollections).values(memberships),
    db.insert(schema.media).values([
      ...DEMO_GALLERY.map((photo, index) => ({
        ...photo, type: "gallery" as const, isPublished: true, sortOrder: index + 1,
      })),
      ...DEMO_REELS.map((reel, index) => ({
        ...reel, type: "reel" as const, isPublished: true, sortOrder: index + 1,
      })),
    ]),
  ]);
}
