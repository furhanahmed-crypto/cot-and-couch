import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";
import { mediaTypeEnum } from "./enums";
import { products } from "./products";

/**
 * Gallery photos and reels in one table.
 * `image_url` is the photo (gallery) or the cover (reel).
 */
export const media = pgTable(
  "media",
  {
    id: id(),
    type: mediaTypeEnum("type").notNull(),
    title: text("title"),
    imageUrl: text("image_url").notNull(),
    videoUrl: text("video_url"),
    instagramUrl: text("instagram_url"),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    area: text("area"),
    deliveryMonth: text("delivery_month"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    isPublished: boolean("is_published").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("media_type_published_sort_idx").on(table.type, table.isPublished, table.sortOrder),
    index("media_product_id_idx").on(table.productId),
    check("media_reel_video_check", sql`${table.type} <> 'reel' or ${table.videoUrl} is not null`),
  ],
).enableRLS();
