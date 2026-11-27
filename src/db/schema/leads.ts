import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";
import { leadEventTypeEnum, leadIntentEnum } from "./enums";
import { products } from "./products";
import { profiles } from "./users";

/** One lead per customer profile. Staff follow up from the Leads screen. */
export const leads = pgTable(
  "leads",
  {
    id: id(),
    profileId: uuid("profile_id")
      .unique()
      .references(() => profiles.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    phone: text("phone"),
    area: text("area"),
    intent: leadIntentEnum("intent").notNull().default("cold"),
    assignedToId: uuid("assigned_to_id").references(() => profiles.id, { onDelete: "set null" }),
    wantsWhatsappOffers: boolean("wants_whatsapp_offers").notNull().default(false),
    followUpDone: boolean("follow_up_done").notNull().default(false),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    index("leads_intent_idx").on(table.intent),
    index("leads_assigned_to_id_idx").on(table.assignedToId),
    index("leads_last_seen_at_idx").on(table.lastSeenAt),
  ],
).enableRLS();

/** What a lead did: viewed a product, shortlisted, tapped Call / WhatsApp… */
export const leadEvents = pgTable(
  "lead_events",
  {
    id: id(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    type: leadEventTypeEnum("type").notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    details: jsonb("details").$type<Record<string, string>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("lead_events_lead_occurred_idx").on(table.leadId, table.occurredAt),
    index("lead_events_product_id_idx").on(table.productId),
  ],
).enableRLS();
