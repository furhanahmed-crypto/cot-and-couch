import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { media, products } from "@/db/schema";
import { tagShopCache } from "@/lib/cache-tags";
import type { GalleryPhoto, ReelItem } from "@/types/shop";

/** Published delivery photos for the home page hero. */
export async function listGalleryPhotos(): Promise<GalleryPhoto[]> {
  "use cache";
  tagShopCache();
  const rows = await db
    .select({
      id: media.id, imageUrl: media.imageUrl, area: media.area, deliveryMonth: media.deliveryMonth,
      productSlug: products.slug, productName: products.name,
    })
    .from(media)
    .leftJoin(products, and(eq(products.id, media.productId), eq(products.status, "published")))
    .where(and(eq(media.type, "gallery"), eq(media.isPublished, true)))
    .orderBy(asc(media.sortOrder));
  return rows;
}

/** Published reels. With a tag (category slug, product slug…), only reels carrying it. */
export async function listReels(tag?: string): Promise<ReelItem[]> {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(media)
    .where(and(eq(media.type, "reel"), eq(media.isPublished, true)))
    .orderBy(asc(media.sortOrder));
  return rows
    .filter((row) => !tag || row.tags.includes(tag))
    .flatMap((row) =>
      row.videoUrl
        ? [{ id: row.id, title: row.title ?? "", coverUrl: row.imageUrl, videoUrl: row.videoUrl, instagramUrl: row.instagramUrl }]
        : [],
    );
}
