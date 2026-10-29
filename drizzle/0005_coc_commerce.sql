-- Phase 5: coc_* orders + CMS
-- @see docs/plan.md

CREATE TABLE IF NOT EXISTS "coc_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid,
  "customer_name" text NOT NULL,
  "customer_mobile" text NOT NULL,
  "address" text NOT NULL,
  "subtotal" numeric(12, 2) NOT NULL,
  "advance_paid" numeric(12, 2) DEFAULT 0 NOT NULL,
  "expected_delivery" text,
  "salesperson_profile_id" uuid,
  "status" "order_status" DEFAULT 'confirmed' NOT NULL,
  "delivery_photo_url" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_orders_profile_id_coc_profiles_id_fk"
    FOREIGN KEY ("profile_id") REFERENCES "coc_profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT "coc_orders_salesperson_profile_id_coc_profiles_id_fk"
    FOREIGN KEY ("salesperson_profile_id") REFERENCES "coc_profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_orders_profile_id_idx" ON "coc_orders" ("profile_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_orders_status_created_at_idx"
  ON "coc_orders" ("status", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_orders_salesperson_profile_id_idx"
  ON "coc_orders" ("salesperson_profile_id");
--> statement-breakpoint
CREATE TRIGGER "coc_orders_touch_updated_at"
  BEFORE UPDATE ON "coc_orders"
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_order_lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "product_id" uuid,
  "variant_id" uuid,
  "quantity" integer DEFAULT 1 NOT NULL,
  "unit_price" numeric(12, 2) NOT NULL,
  "line_total" numeric(12, 2) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "coc_order_lines_order_id_coc_orders_id_fk"
    FOREIGN KEY ("order_id") REFERENCES "coc_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_order_lines_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT "coc_order_lines_variant_id_coc_product_variants_id_fk"
    FOREIGN KEY ("variant_id") REFERENCES "coc_product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_order_lines_order_id_idx" ON "coc_order_lines" ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_order_lines_product_id_idx" ON "coc_order_lines" ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_order_lines_variant_id_idx" ON "coc_order_lines" ("variant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_order_line_addons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_line_id" uuid NOT NULL,
  "addon_id" uuid,
  "label_snapshot" text NOT NULL,
  "price" numeric(12, 2) NOT NULL,
  CONSTRAINT "coc_order_line_addons_order_line_id_coc_order_lines_id_fk"
    FOREIGN KEY ("order_line_id") REFERENCES "coc_order_lines"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_order_line_addons_addon_id_coc_category_addons_id_fk"
    FOREIGN KEY ("addon_id") REFERENCES "coc_category_addons"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_order_line_addons_order_line_id_idx"
  ON "coc_order_line_addons" ("order_line_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_order_status_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "status" "order_status" NOT NULL,
  "note" text,
  "by_name" text,
  "at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_order_status_history_order_id_coc_orders_id_fk"
    FOREIGN KEY ("order_id") REFERENCES "coc_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_order_status_history_order_id_idx"
  ON "coc_order_status_history" ("order_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_gallery_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "image_url" text NOT NULL,
  "product_id" uuid,
  "area" text NOT NULL,
  "delivery_month" text NOT NULL,
  "approved" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_gallery_items_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_gallery_items_product_id_idx" ON "coc_gallery_items" ("product_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_reels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "cover_url" text NOT NULL,
  "video_url" text NOT NULL,
  "instagram_url" text,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
