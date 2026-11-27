import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { media, products } from "@/db/schema";
import type { MediaType } from "@/constants/media";
import type { MediaAdminItem } from "@/types/admin-content";

/** All photos or reels, published or not, in shop order. */
export async function listMediaForAdmin(type: MediaType): Promise<MediaAdminItem[]> {
  const rows = await db
    .select({ item: media, productName: products.name })
    .from(media)
    .leftJoin(products, eq(products.id, media.productId))
    .where(eq(media.type, type))
    .orderBy(asc(media.sortOrder), asc(media.createdAt));
  return rows.map(({ item, productName }) => ({
    id: item.id, type: item.type, title: item.title, imageUrl: item.imageUrl, videoUrl: item.videoUrl,
    instagramUrl: item.instagramUrl, productId: item.productId, productName, area: item.area,
    deliveryMonth: item.deliveryMonth, tags: item.tags, isPublished: item.isPublished,
  }));
}
