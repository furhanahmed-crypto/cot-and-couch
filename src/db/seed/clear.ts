import { getTableName, sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { db } from "./db";

const APP_TABLES = [
  schema.profiles, schema.storeSettings,
  schema.categories, schema.brands, schema.qualities, schema.colours,
  schema.products, schema.productImages, schema.productSpecs, schema.productVariants,
  schema.addons, schema.addonPrices, schema.collections, schema.productCollections,
  schema.shortlistItems, schema.cartItems, schema.cartItemAddons,
  schema.orders, schema.orderItems, schema.orderItemAddons, schema.orderStatusHistory,
  schema.leads, schema.leadEvents, schema.media,
];

/** Empties every app table and restarts order numbers at CC-00001. */
export async function clearAppTables() {
  const tableList = APP_TABLES.map((table) => `"${getTableName(table)}"`).join(", ");
  await db.batch([
    db.execute(sql.raw(`TRUNCATE ${tableList} CASCADE`)),
    db.execute(sql`ALTER SEQUENCE order_number_seq RESTART WITH 1`),
  ]);
}
