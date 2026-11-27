import { sql } from "drizzle-orm";
import { check, date, index, integer, pgSequence, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { addons } from "./addons";
import { id, money, timestamps } from "./columns";
import { orderStatusEnum, priceUnitEnum } from "./enums";
import { productVariants } from "./products";
import { profiles } from "./users";

/** Feeds order numbers CC-00001, CC-00002… */
export const orderNumberSeq = pgSequence("order_number_seq");

export const orders = pgTable(
  "orders",
  {
    id: id(),
    orderNumber: text("order_number")
      .notNull()
      .unique()
      .default(sql`'CC-' || lpad(nextval('order_number_seq')::text, 5, '0')`),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    address: text("address").notNull(),
    status: orderStatusEnum("status").notNull().default("confirmed"),
    subtotal: money("subtotal").notNull(),
    advancePaid: money("advance_paid").notNull().default("0"),
    expectedDelivery: date("expected_delivery", { mode: "string" }),
    salespersonId: uuid("salesperson_id").references(() => profiles.id, { onDelete: "set null" }),
    updatedById: uuid("updated_by_id").references(() => profiles.id, { onDelete: "set null" }),
    deliveryPhotoUrl: text("delivery_photo_url"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_profile_id_idx").on(table.profileId),
    index("orders_salesperson_id_idx").on(table.salespersonId),
    index("orders_updated_by_id_idx").on(table.updatedById),
    check("orders_subtotal_check", sql`${table.subtotal} >= 0`),
    check("orders_advance_paid_check", sql`${table.advancePaid} >= 0 and ${table.advancePaid} <= ${table.subtotal}`),
  ],
).enableRLS();

/** Name, SKU, size, quality and colour are copied at sale time (snapshot). */
export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    sku: text("sku").notNull(),
    sizeLabel: text("size_label").notNull(),
    qualityName: text("quality_name"),
    colourName: text("colour_name"),
    customLengthIn: integer("custom_length_in"),
    customWidthIn: integer("custom_width_in"),
    quantity: integer("quantity").notNull(),
    unitMrp: money("unit_mrp"),
    unitPrice: money("unit_price").notNull(),
    lineTotal: money("line_total").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_variant_id_idx").on(table.variantId),
    check("order_items_quantity_check", sql`${table.quantity} > 0`),
    check("order_items_prices_check", sql`${table.unitPrice} >= 0 and ${table.lineTotal} >= 0`),
  ],
).enableRLS();

/** `price` is what was charged for one unit of the item (per-seat already multiplied). */
export const orderItemAddons = pgTable(
  "order_item_addons",
  {
    id: id(),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    addonId: uuid("addon_id").references(() => addons.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    priceUnit: priceUnitEnum("price_unit").notNull(),
    price: money("price").notNull(),
  },
  (table) => [
    index("order_item_addons_order_item_id_idx").on(table.orderItemId),
    index("order_item_addons_addon_id_idx").on(table.addonId),
    check("order_item_addons_price_check", sql`${table.price} >= 0`),
  ],
).enableRLS();

/** Written only by the `log_order_status()` trigger. */
export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    note: text("note"),
    changedById: uuid("changed_by_id").references(() => profiles.id, { onDelete: "set null" }),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("order_status_history_order_changed_idx").on(table.orderId, table.changedAt),
    index("order_status_history_changed_by_id_idx").on(table.changedById),
  ],
).enableRLS();
