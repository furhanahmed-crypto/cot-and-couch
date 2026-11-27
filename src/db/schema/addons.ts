import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { categories, qualities } from "./catalogue";
import { id, money, timestamps } from "./columns";
import { addonKindEnum, priceUnitEnum } from "./enums";
import { products } from "./products";

/**
 * Extras a customer can add (storage, hydraulics, add bed, recliners…).
 * product_id null = whole category (cots); set = one product only (sofas).
 * size_label set = only for variants of that size (King storage).
 */
export const addons = pgTable(
  "addons",
  {
    id: id(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: addonKindEnum("kind").notNull().default("addon"),
    priceUnit: priceUnitEnum("price_unit").notNull().default("fixed"),
    sizeLabel: text("size_label"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("addons_category_id_idx").on(table.categoryId),
    index("addons_product_id_idx").on(table.productId),
  ],
).enableRLS();

/** Price of an add-on for one quality. No row = not offered for that quality. */
export const addonPrices = pgTable(
  "addon_prices",
  {
    addonId: uuid("addon_id")
      .notNull()
      .references(() => addons.id, { onDelete: "cascade" }),
    qualityId: uuid("quality_id")
      .notNull()
      .references(() => qualities.id, { onDelete: "cascade" }),
    price: money("price").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.addonId, table.qualityId] }),
    index("addon_prices_quality_id_idx").on(table.qualityId),
    check("addon_prices_price_check", sql`${table.price} >= 0`),
  ],
).enableRLS();
