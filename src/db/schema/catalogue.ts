import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";

/** Mattresses, Cots, Sofas. */
export const categories = pgTable("categories", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
}).enableRLS();

/** Mattress makers (Wake Fit, Sleepwell…). Cots and sofas have none. */
export const brands = pgTable(
  "brands",
  {
    id: id(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [unique("brands_category_slug_key").on(table.categoryId, table.slug)],
).enableRLS();

/** Client's quality names: Ideal Range… for cots, Affordable / Premium for sofas. */
export const qualities = pgTable(
  "qualities",
  {
    id: id(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    warrantyYears: integer("warranty_years"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    unique("qualities_category_slug_key").on(table.categoryId, table.slug),
    check("qualities_warranty_years_check", sql`${table.warrantyYears} is null or ${table.warrantyYears} > 0`),
  ],
).enableRLS();

export const colours = pgTable(
  "colours",
  {
    id: id(),
    name: text("name").notNull().unique(),
    hex: text("hex").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [check("colours_hex_check", sql`${table.hex} ~ '^#[0-9A-Fa-f]{6}$'`)],
).enableRLS();
