/**
 * Phase 4 CRM tables (coc_*).
 * @see docs/plan.md
 */
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { intentScoreEnum } from "./schema-enums";
import { cocProducts } from "./schema-coc-catalogue";
import { cocProfiles } from "./schema-coc";

export const cocLeadEventTypeEnum = pgEnum("coc_lead_event_type", [
  "view",
  "shortlist",
  "cta",
  "login",
]);

export const cocLeads = pgTable("coc_leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => cocProfiles.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  area: text("area"),
  intent: intentScoreEnum("intent").notNull().default("cold"),
  assignedToProfileId: uuid("assigned_to_profile_id").references(
    () => cocProfiles.id,
    { onDelete: "set null" },
  ),
  whatsappOffers: boolean("whatsapp_offers").notNull().default(false),
  followUpDone: boolean("follow_up_done").notNull().default(false),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cocLeadEvents = pgTable("coc_lead_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => cocLeads.id, { onDelete: "cascade" }),
  eventType: cocLeadEventTypeEnum("event_type").notNull(),
  productId: uuid("product_id").references(() => cocProducts.id, {
    onDelete: "set null",
  }),
  payload: jsonb("payload").$type<Record<string, string>>().notNull().default({}),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CocLead = typeof cocLeads.$inferSelect;
export type CocLeadEvent = typeof cocLeadEvents.$inferSelect;
