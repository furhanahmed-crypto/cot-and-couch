import { sql } from "drizzle-orm";
import { check, index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";
import { userRoleEnum } from "./enums";

/** One row per signed-in person. `auth_user_id` is the Neon Auth user id. */
export const profiles = pgTable(
  "profiles",
  {
    id: id(),
    authUserId: uuid("auth_user_id").notNull().unique(),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    role: userRoleEnum("role").notNull().default("customer"),
    ...timestamps,
  },
  (table) => [index("profiles_role_idx").on(table.role)],
).enableRLS();

/** Store details shown in the shop. Exactly one row (id = 1). */
export const storeSettings = pgTable(
  "store_settings",
  {
    id: smallint("id").primaryKey().default(1),
    name: text("name").notNull(),
    address: text("address").notNull(),
    mapUrl: text("map_url").notNull(),
    timings: text("timings").notNull(),
    phone: text("phone").notNull(),
    whatsapp: text("whatsapp").notNull(),
    privacyNotice: text("privacy_notice").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  () => [check("store_settings_single_row", sql`id = 1`)],
).enableRLS();
