-- Phase 2: coc_* unified catalogue
-- @see docs/plan.md

CREATE TYPE "coc_cot_type" AS ENUM ('non_cushion', 'cushion');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_option_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" text NOT NULL,
  "label" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "coc_option_groups_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_options" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "group_id" uuid NOT NULL,
  "label" text NOT NULL,
  "slug" text NOT NULL,
  "hex" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  CONSTRAINT "coc_options_group_id_coc_option_groups_id_fk"
    FOREIGN KEY ("group_id") REFERENCES "coc_option_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_options_group_slug" UNIQUE("group_id","slug")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_options_group_id_idx" ON "coc_options" ("group_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_category_option_groups" (
  "category_id" uuid NOT NULL,
  "option_group_id" uuid NOT NULL,
  "required" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "coc_category_option_groups_pkey" PRIMARY KEY("category_id","option_group_id"),
  CONSTRAINT "coc_category_option_groups_category_id_coc_categories_id_fk"
    FOREIGN KEY ("category_id") REFERENCES "coc_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_category_option_groups_option_group_id_coc_option_groups_id_fk"
    FOREIGN KEY ("option_group_id") REFERENCES "coc_option_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_category_option_groups_category_id_idx"
  ON "coc_category_option_groups" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_category_option_groups_option_group_id_idx"
  ON "coc_category_option_groups" ("option_group_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_mattress_brands" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "defaults" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_mattress_brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_mattress_brands_slug_idx" ON "coc_mattress_brands" ("slug");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_brand_option_links" (
  "brand_id" uuid NOT NULL,
  "option_id" uuid NOT NULL,
  CONSTRAINT "coc_brand_option_links_pkey" PRIMARY KEY("brand_id","option_id"),
  CONSTRAINT "coc_brand_option_links_brand_id_coc_mattress_brands_id_fk"
    FOREIGN KEY ("brand_id") REFERENCES "coc_mattress_brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_brand_option_links_option_id_coc_options_id_fk"
    FOREIGN KEY ("option_id") REFERENCES "coc_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_brand_option_links_brand_id_idx" ON "coc_brand_option_links" ("brand_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_brand_option_links_option_id_idx" ON "coc_brand_option_links" ("option_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_size_dimensions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "size_group_option_id" uuid NOT NULL,
  "length_in" integer NOT NULL,
  "width_in" integer NOT NULL,
  "label" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  CONSTRAINT "coc_size_dimensions_size_group_option_id_coc_options_id_fk"
    FOREIGN KEY ("size_group_option_id") REFERENCES "coc_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_size_dimensions_unique" UNIQUE("size_group_option_id","length_in","width_in")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_size_dimensions_size_group_option_id_idx"
  ON "coc_size_dimensions" ("size_group_option_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "category_id" uuid NOT NULL,
  "mattress_brand_id" uuid,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "image_url" text,
  "range_number" integer,
  "cot_type" "coc_cot_type",
  "status" "product_status" DEFAULT 'draft' NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_products_slug_unique" UNIQUE("slug"),
  CONSTRAINT "coc_products_category_id_coc_categories_id_fk"
    FOREIGN KEY ("category_id") REFERENCES "coc_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "coc_products_mattress_brand_id_coc_mattress_brands_id_fk"
    FOREIGN KEY ("mattress_brand_id") REFERENCES "coc_mattress_brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "coc_products_cot_pair_check" CHECK (
    ("range_number" IS NULL AND "cot_type" IS NULL)
    OR ("range_number" IS NOT NULL AND "cot_type" IS NOT NULL AND "range_number" >= 1)
  )
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_products_category_id_idx" ON "coc_products" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_products_mattress_brand_id_idx" ON "coc_products" ("mattress_brand_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_products_range_number_idx" ON "coc_products" ("range_number")
  WHERE "range_number" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_products_cot_type_idx" ON "coc_products" ("cot_type")
  WHERE "cot_type" IS NOT NULL;
--> statement-breakpoint
CREATE TRIGGER "coc_products_touch_updated_at"
  BEFORE UPDATE ON "coc_products"
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_product_option_values" (
  "product_id" uuid NOT NULL,
  "option_group_id" uuid NOT NULL,
  "option_id" uuid,
  "text_value" text,
  CONSTRAINT "coc_product_option_values_pkey" PRIMARY KEY("product_id","option_group_id"),
  CONSTRAINT "coc_product_option_values_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_option_values_option_group_id_coc_option_groups_id_fk"
    FOREIGN KEY ("option_group_id") REFERENCES "coc_option_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_option_values_option_id_coc_options_id_fk"
    FOREIGN KEY ("option_id") REFERENCES "coc_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_option_values_value_check" CHECK (
    ("option_id" IS NOT NULL AND "text_value" IS NULL)
    OR ("option_id" IS NULL AND "text_value" IS NOT NULL AND length(trim("text_value")) > 0)
  )
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_option_values_product_id_idx"
  ON "coc_product_option_values" ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_option_values_option_id_idx"
  ON "coc_product_option_values" ("option_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_product_variants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "sku" text NOT NULL,
  "size_group_option_id" uuid,
  "size_dimension_id" uuid,
  "width_option_id" uuid,
  "is_custom_size" boolean DEFAULT false NOT NULL,
  "thickness_option_id" uuid,
  "colour_option_id" uuid,
  "mrp" numeric(12, 2) NOT NULL,
  "price" numeric(12, 2) NOT NULL,
  "stock_qty" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coc_product_variants_sku_unique" UNIQUE("sku"),
  CONSTRAINT "coc_product_variants_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_variants_size_group_option_id_coc_options_id_fk"
    FOREIGN KEY ("size_group_option_id") REFERENCES "coc_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_variants_size_dimension_id_coc_size_dimensions_id_fk"
    FOREIGN KEY ("size_dimension_id") REFERENCES "coc_size_dimensions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_variants_width_option_id_coc_options_id_fk"
    FOREIGN KEY ("width_option_id") REFERENCES "coc_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_variants_thickness_option_id_coc_options_id_fk"
    FOREIGN KEY ("thickness_option_id") REFERENCES "coc_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_variants_colour_option_id_coc_options_id_fk"
    FOREIGN KEY ("colour_option_id") REFERENCES "coc_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_variants_product_id_idx" ON "coc_product_variants" ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_variants_size_group_option_id_idx"
  ON "coc_product_variants" ("size_group_option_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_variants_size_dimension_id_idx"
  ON "coc_product_variants" ("size_dimension_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_variants_width_option_id_idx"
  ON "coc_product_variants" ("width_option_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_variants_thickness_option_id_idx"
  ON "coc_product_variants" ("thickness_option_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_variants_colour_option_id_idx"
  ON "coc_product_variants" ("colour_option_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_category_addons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "category_id" uuid NOT NULL,
  "key" text NOT NULL,
  "label" text NOT NULL,
  "price" numeric(12, 2) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  CONSTRAINT "coc_category_addons_category_id_coc_categories_id_fk"
    FOREIGN KEY ("category_id") REFERENCES "coc_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_category_addons_category_key_unique" UNIQUE("category_id","key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_category_addons_category_id_idx" ON "coc_category_addons" ("category_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "featured" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  CONSTRAINT "coc_collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_collections_slug_idx" ON "coc_collections" ("slug");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coc_product_collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "collection_id" uuid NOT NULL,
  CONSTRAINT "coc_product_collections_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_collections_collection_id_coc_collections_id_fk"
    FOREIGN KEY ("collection_id") REFERENCES "coc_collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_collections_unique" UNIQUE("product_id","collection_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_collections_product_id_idx"
  ON "coc_product_collections" ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_collections_collection_id_idx"
  ON "coc_product_collections" ("collection_id");
