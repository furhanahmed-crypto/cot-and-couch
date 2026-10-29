-- Phase 3: coc_* cart + favourites
-- @see docs/plan.md

CREATE TABLE IF NOT EXISTS "coc_profile_favourites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_profile_favourites_profile_id_coc_profiles_id_fk"
    FOREIGN KEY ("profile_id") REFERENCES "coc_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_profile_favourites_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_profile_favourites_unique" UNIQUE("profile_id","product_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_profile_favourites_profile_id_idx"
  ON "coc_profile_favourites" ("profile_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_profile_favourites_product_id_idx"
  ON "coc_profile_favourites" ("product_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_cart_lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "variant_id" uuid NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "custom_length_in" integer,
  "custom_width_in" integer,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_cart_lines_profile_id_coc_profiles_id_fk"
    FOREIGN KEY ("profile_id") REFERENCES "coc_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_cart_lines_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_cart_lines_variant_id_coc_product_variants_id_fk"
    FOREIGN KEY ("variant_id") REFERENCES "coc_product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_cart_lines_profile_id_idx" ON "coc_cart_lines" ("profile_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_cart_lines_product_id_idx" ON "coc_cart_lines" ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_cart_lines_variant_id_idx" ON "coc_cart_lines" ("variant_id");
--> statement-breakpoint
CREATE TRIGGER "coc_cart_lines_touch_updated_at"
  BEFORE UPDATE ON "coc_cart_lines"
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_cart_line_addons" (
  "cart_line_id" uuid NOT NULL,
  "addon_id" uuid NOT NULL,
  "price_snapshot" numeric(12, 2) NOT NULL,
  "label_snapshot" text NOT NULL,
  CONSTRAINT "coc_cart_line_addons_cart_line_id_coc_cart_lines_id_fk"
    FOREIGN KEY ("cart_line_id") REFERENCES "coc_cart_lines"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_cart_line_addons_addon_id_coc_category_addons_id_fk"
    FOREIGN KEY ("addon_id") REFERENCES "coc_category_addons"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_cart_line_addons_unique" UNIQUE("cart_line_id","addon_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_cart_line_addons_cart_line_id_idx"
  ON "coc_cart_line_addons" ("cart_line_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_cart_line_addons_addon_id_idx"
  ON "coc_cart_line_addons" ("addon_id");
