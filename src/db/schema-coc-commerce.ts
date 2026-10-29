/**
 * Phase 5 commerce + CMS tables (coc_*).
 * @see docs/plan.md
 */
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { orderStatusEnum } from "./schema-enums";
import {
  cocCategoryAddons,
  cocProductVariants,
  cocProducts,
} from "./schema-coc-catalogue";
import { cocProfiles } from "./schema-coc";

export const cocOrders = pgTable("coc_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => cocProfiles.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull(),
  customerMobile: text("customer_mobile").notNull(),
  address: text("address").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  advancePaid: numeric("advance_paid", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  expectedDelivery: text("expected_delivery"),
  salespersonProfileId: uuid("salesperson_profile_id").references(
    () => cocProfiles.id,
    { onDelete: "set null" },
  ),
  status: orderStatusEnum("status").notNull().default("confirmed"),
  deliveryPhotoUrl: text("delivery_photo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocOrderLines = pgTable("coc_order_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => cocOrders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => cocProducts.id, {
    onDelete: "set null",
  }),
  variantId: uuid("variant_id").references(() => cocProductVariants.id, {
    onDelete: "set null",
  }),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const cocOrderLineAddons = pgTable("coc_order_line_addons", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderLineId: uuid("order_line_id")
    .notNull()
    .references(() => cocOrderLines.id, { onDelete: "cascade" }),
  addonId: uuid("addon_id").references(() => cocCategoryAddons.id, {
    onDelete: "set null",
  }),
  labelSnapshot: text("label_snapshot").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
});

export const cocOrderStatusHistory = pgTable("coc_order_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => cocOrders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  byName: text("by_name"),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocGalleryItems = pgTable("coc_gallery_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageUrl: text("image_url").notNull(),
  productId: uuid("product_id").references(() => cocProducts.id, {
    onDelete: "set null",
  }),
  area: text("area").notNull(),
  deliveryMonth: text("delivery_month").notNull(),
  approved: boolean("approved").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocReels = pgTable("coc_reels", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  coverUrl: text("cover_url").notNull(),
  videoUrl: text("video_url").notNull(),
  instagramUrl: text("instagram_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CocOrder = typeof cocOrders.$inferSelect;
