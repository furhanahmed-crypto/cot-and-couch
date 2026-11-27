import { boolean, index, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";
import { products } from "./products";

/** Hand-picked groups of products shown on the home page. */
export const collections = pgTable("collections", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
}).enableRLS();

export const productCollections = pgTable(
  "product_collections",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (table) => [
    // The primary key starts with product_id, so only collection_id needs its own index.
    primaryKey({ columns: [table.productId, table.collectionId] }),
    index("product_collections_collection_id_idx").on(table.collectionId),
  ],
).enableRLS();
