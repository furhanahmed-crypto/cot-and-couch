import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, primaryKey, unique, uuid } from "drizzle-orm/pg-core";
import { addons } from "./addons";
import { createdAt, id, timestamps } from "./columns";
import { productVariants, products } from "./products";
import { profiles } from "./users";

export const shortlistItems = pgTable(
  "shortlist_items",
  {
    id: id(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    unique("shortlist_items_profile_product_key").on(table.profileId, table.productId),
    index("shortlist_items_product_id_idx").on(table.productId),
  ],
).enableRLS();

/** Cart rows store no prices: prices are read fresh on every cart view. */
export const cartItems = pgTable(
  "cart_items",
  {
    id: id(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    customLengthIn: integer("custom_length_in"),
    customWidthIn: integer("custom_width_in"),
    ...timestamps,
  },
  (table) => [
    index("cart_items_profile_id_idx").on(table.profileId),
    index("cart_items_variant_id_idx").on(table.variantId),
    check("cart_items_quantity_check", sql`${table.quantity} between 1 and 20`),
    // "is not null" is needed: `78 > 0 and null > 0` is null, and a null check passes.
    check(
      "cart_items_custom_size_check",
      sql`(${table.customLengthIn} is null and ${table.customWidthIn} is null) or (${table.customLengthIn} is not null and ${table.customWidthIn} is not null and ${table.customLengthIn} > 0 and ${table.customWidthIn} > 0)`,
    ),
  ],
).enableRLS();

export const cartItemAddons = pgTable(
  "cart_item_addons",
  {
    cartItemId: uuid("cart_item_id")
      .notNull()
      .references(() => cartItems.id, { onDelete: "cascade" }),
    addonId: uuid("addon_id")
      .notNull()
      .references(() => addons.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.cartItemId, table.addonId] }),
    index("cart_item_addons_addon_id_idx").on(table.addonId),
  ],
).enableRLS();
