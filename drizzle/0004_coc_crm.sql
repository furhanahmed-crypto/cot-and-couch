-- Phase 4: coc_* leads + events
-- @see docs/plan.md

CREATE TYPE "coc_lead_event_type" AS ENUM ('view', 'shortlist', 'cta', 'login');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid,
  "name" text NOT NULL,
  "mobile" text NOT NULL,
  "area" text,
  "intent" "intent_score" DEFAULT 'cold' NOT NULL,
  "assigned_to_profile_id" uuid,
  "whatsapp_offers" boolean DEFAULT false NOT NULL,
  "follow_up_done" boolean DEFAULT false NOT NULL,
  "first_seen_at" timestamptz DEFAULT now() NOT NULL,
  "last_seen_at" timestamptz DEFAULT now() NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_leads_profile_id_coc_profiles_id_fk"
    FOREIGN KEY ("profile_id") REFERENCES "coc_profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT "coc_leads_assigned_to_profile_id_coc_profiles_id_fk"
    FOREIGN KEY ("assigned_to_profile_id") REFERENCES "coc_profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coc_leads_profile_id_unique"
  ON "coc_leads" ("profile_id") WHERE "profile_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_leads_mobile_idx" ON "coc_leads" ("mobile");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_leads_assigned_to_profile_id_idx"
  ON "coc_leads" ("assigned_to_profile_id");
--> statement-breakpoint
CREATE TRIGGER "coc_leads_touch_updated_at"
  BEFORE UPDATE ON "coc_leads"
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_lead_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "event_type" "coc_lead_event_type" NOT NULL,
  "product_id" uuid,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "occurred_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_lead_events_lead_id_coc_leads_id_fk"
    FOREIGN KEY ("lead_id") REFERENCES "coc_leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_lead_events_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_lead_events_lead_id_occurred_at_idx"
  ON "coc_lead_events" ("lead_id", "occurred_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_lead_events_product_id_idx" ON "coc_lead_events" ("product_id");
