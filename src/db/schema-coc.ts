/**
 * Revamp schema (COC). See docs/ARCHITECTURE.md.
 * @see docs/plan.md
 */
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./schema-enums";

export const cocProfiles = pgTable("coc_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  name: text("name"),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocCategories = pgTable("coc_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocStoreSettings = pgTable("coc_store_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  mapUrl: text("map_url").notNull(),
  timings: text("timings").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  privacyNotice: text("privacy_notice").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CocProfile = typeof cocProfiles.$inferSelect;
export type CocCategory = typeof cocCategories.$inferSelect;
export type CocStoreSettings = typeof cocStoreSettings.$inferSelect;
