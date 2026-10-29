-- Phase 1: coc_* foundation (legacy tables unchanged)
-- @see docs/plan.md

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "auth_user_id" uuid NOT NULL,
  "name" text,
  "email" text NOT NULL,
  "role" "user_role" DEFAULT 'customer' NOT NULL,
  "phone" text,
  "address" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_profiles_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_profiles_auth_user_id_idx" ON "coc_profiles" ("auth_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_profiles_email_idx" ON "coc_profiles" ("email");
--> statement-breakpoint
CREATE TRIGGER "coc_profiles_touch_updated_at"
  BEFORE UPDATE ON "coc_profiles"
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_categories_slug_idx" ON "coc_categories" ("slug");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_store_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "address" text NOT NULL,
  "map_url" text NOT NULL,
  "timings" text NOT NULL,
  "phone" text NOT NULL,
  "whatsapp" text NOT NULL,
  "privacy_notice" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TRIGGER "coc_store_settings_touch_updated_at"
  BEFORE UPDATE ON "coc_store_settings"
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();
