import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { brands, categories, colours, qualities } from "./catalogue";
import { createdAt, id, money, timestamps } from "./columns";
import { productStatusEnum } from "./enums";

/** A mattress model, a cot style or a sofa range. Prices live on its variants. */
export const products = pgTable(
  "products",
  {
    id: id(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    status: productStatusEnum("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("products_category_status_idx").on(table.categoryId, table.status),
    index("products_brand_id_idx").on(table.brandId),
  ],
).enableRLS();

export const productImages = pgTable(
  "product_images",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [index("product_images_product_sort_idx").on(table.productId, table.sortOrder)],
).enableRLS();

/** Label / value facts shown on the product page (Comfort: Firm…). */
export const productSpecs = pgTable(
  "product_specs",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [unique("product_specs_product_label_key").on(table.productId, table.label)],
).enableRLS();

/**
 * One sellable choice of a product with its price.
 * Unused columns stay null (mattress: no quality; sofa: no size in inches).
 */
export const productVariants = pgTable(
  "product_variants",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    sizeLabel: text("size_label").notNull(),
    lengthIn: integer("length_in"),
    widthIn: integer("width_in"),
    thicknessIn: integer("thickness_in"),
    seats: integer("seats"),
    qualityId: uuid("quality_id").references(() => qualities.id, { onDelete: "restrict" }),
    colourId: uuid("colour_id").references(() => colours.id, { onDelete: "restrict" }),
    mrp: money("mrp"),
    price: money("price").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    // Leading product_id also serves as the index for the product FK.
    unique("product_variants_choice_key")
      .on(table.productId, table.sizeLabel, table.lengthIn, table.widthIn, table.thicknessIn, table.qualityId, table.colourId)
      .nullsNotDistinct(),
    index("product_variants_quality_id_idx").on(table.qualityId),
    index("product_variants_colour_id_idx").on(table.colourId),
    check("product_variants_price_check", sql`${table.price} > 0`),
    check("product_variants_mrp_check", sql`${table.mrp} is null or ${table.mrp} >= ${table.price}`),
    check(
      "product_variants_inches_check",
      sql`coalesce(${table.lengthIn}, 1) > 0 and coalesce(${table.widthIn}, 1) > 0 and coalesce(${table.thicknessIn}, 1) > 0`,
    ),
    check("product_variants_seats_check", sql`${table.seats} is null or ${table.seats} > 0`),
  ],
).enableRLS();
