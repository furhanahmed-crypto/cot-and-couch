/**
 * Phase 2 catalogue tables (coc_*).
 * @see docs/plan.md
 */
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { productStatusEnum } from "./schema-enums";
import { cocCategories } from "./schema-coc";

export const cocCotTypeEnum = pgEnum("coc_cot_type", ["non_cushion", "cushion"]);

export const cocOptionGroups = pgTable("coc_option_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const cocOptions = pgTable(
  "coc_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => cocOptionGroups.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    slug: text("slug").notNull(),
    /** e.g. bed width dimensions — `3 ft × 6 ft` */
    detail: text("detail"),
    hex: text("hex"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [unique("coc_options_group_slug").on(t.groupId, t.slug)],
);

export const cocCategoryOptionGroups = pgTable(
  "coc_category_option_groups",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => cocCategories.id, { onDelete: "cascade" }),
    optionGroupId: uuid("option_group_id")
      .notNull()
      .references(() => cocOptionGroups.id, { onDelete: "cascade" }),
    required: boolean("required").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.categoryId, t.optionGroupId] })],
);

export const cocMattressBrands = pgTable("coc_mattress_brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  defaults: jsonb("defaults")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Bed range masters — products belong to a range (like mattress brands). */
export const cocBedRanges = pgTable("coc_bed_ranges", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  cotType: cocCotTypeEnum("cot_type").notNull().default("non_cushion"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocBrandOptionLinks = pgTable(
  "coc_brand_option_links",
  {
    brandId: uuid("brand_id")
      .notNull()
      .references(() => cocMattressBrands.id, { onDelete: "cascade" }),
    optionId: uuid("option_id")
      .notNull()
      .references(() => cocOptions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.brandId, t.optionId] })],
);

export const cocSizeDimensions = pgTable(
  "coc_size_dimensions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sizeGroupOptionId: uuid("size_group_option_id")
      .notNull()
      .references(() => cocOptions.id, { onDelete: "cascade" }),
    lengthIn: integer("length_in").notNull(),
    widthIn: integer("width_in").notNull(),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    unique("coc_size_dimensions_unique").on(
      t.sizeGroupOptionId,
      t.lengthIn,
      t.widthIn,
    ),
  ],
);

export const cocProducts = pgTable("coc_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => cocCategories.id),
  mattressBrandId: uuid("mattress_brand_id").references(() => cocMattressBrands.id),
  bedRangeId: uuid("bed_range_id").references(() => cocBedRanges.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  cotType: cocCotTypeEnum("cot_type"),
  status: productStatusEnum("status").notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocProductOptionValues = pgTable(
  "coc_product_option_values",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => cocProducts.id, { onDelete: "cascade" }),
    optionGroupId: uuid("option_group_id")
      .notNull()
      .references(() => cocOptionGroups.id, { onDelete: "cascade" }),
    optionId: uuid("option_id").references(() => cocOptions.id),
    textValue: text("text_value"),
  },
  (t) => [primaryKey({ columns: [t.productId, t.optionGroupId] })],
);

export const cocProductVariants = pgTable("coc_product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => cocProducts.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  sizeGroupOptionId: uuid("size_group_option_id").references(() => cocOptions.id),
  sizeDimensionId: uuid("size_dimension_id").references(() => cocSizeDimensions.id),
  widthOptionId: uuid("width_option_id").references(() => cocOptions.id),
  isCustomSize: boolean("is_custom_size").notNull().default(false),
  thicknessOptionId: uuid("thickness_option_id").references(() => cocOptions.id),
  colourOptionId: uuid("colour_option_id").references(() => cocOptions.id),
  mrp: numeric("mrp", { precision: 12, scale: 2 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stockQty: integer("stock_qty").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocCategoryAddons = pgTable("coc_category_addons", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => cocCategories.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: text("label").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const cocCollections = pgTable("coc_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const cocProductCollections = pgTable(
  "coc_product_collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => cocProducts.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => cocCollections.id, { onDelete: "cascade" }),
  },
  (t) => [
    unique("coc_product_collections_unique").on(t.productId, t.collectionId),
  ],
);

export type CocProduct = typeof cocProducts.$inferSelect;
export type CocProductVariant = typeof cocProductVariants.$inferSelect;
export type CocMattressBrand = typeof cocMattressBrands.$inferSelect;
export type CocBedRange = typeof cocBedRanges.$inferSelect;
export type CocOption = typeof cocOptions.$inferSelect;
export type CocOptionGroup = typeof cocOptionGroups.$inferSelect;
export type CocSizeDimension = typeof cocSizeDimensions.$inferSelect;
