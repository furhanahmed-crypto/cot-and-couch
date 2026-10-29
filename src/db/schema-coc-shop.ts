/**
 * Phase 3 shop tables (coc_*).
 * @see docs/plan.md
 */
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { cocCategoryAddons, cocProductVariants, cocProducts } from "./schema-coc-catalogue";
import { cocProfiles } from "./schema-coc";

export const cocProfileFavourites = pgTable(
  "coc_profile_favourites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => cocProfiles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => cocProducts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("coc_profile_favourites_unique").on(t.profileId, t.productId)],
);

export const cocCartLines = pgTable("coc_cart_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => cocProfiles.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => cocProducts.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => cocProductVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  customLengthIn: integer("custom_length_in"),
  customWidthIn: integer("custom_width_in"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocCartLineAddons = pgTable(
  "coc_cart_line_addons",
  {
    cartLineId: uuid("cart_line_id")
      .notNull()
      .references(() => cocCartLines.id, { onDelete: "cascade" }),
    addonId: uuid("addon_id")
      .notNull()
      .references(() => cocCategoryAddons.id, { onDelete: "cascade" }),
    priceSnapshot: numeric("price_snapshot", { precision: 12, scale: 2 }).notNull(),
    labelSnapshot: text("label_snapshot").notNull(),
  },
  (t) => [unique("coc_cart_line_addons_unique").on(t.cartLineId, t.addonId)],
);

export type CocCartLine = typeof cocCartLines.$inferSelect;
