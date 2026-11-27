-- Cot & Couch: complete database setup.
-- Made by `drizzle-kit generate` from src/db/schema/*.ts, then reordered into
-- sections with triggers added. See docs/refactor/database.md.
-- Each section: tables (+ foreign keys) -> indexes -> row level security -> triggers.

-- ==========================================================================
-- 0. Extensions, enums, set_updated_at()
-- gen_random_uuid() is built into Postgres 13+, so no extension is needed.
-- Enum values come from the arrays in src/constants/*.ts.
-- ==========================================================================

CREATE TYPE "public"."addon_kind" AS ENUM('addon', 'recliner');
--> statement-breakpoint
CREATE TYPE "public"."lead_event_type" AS ENUM('view', 'shortlist', 'cta', 'login');
--> statement-breakpoint
CREATE TYPE "public"."lead_intent" AS ENUM('hot', 'warm', 'cold');
--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('gallery', 'reel');
--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('confirmed', 'in_production', 'out_for_delivery', 'delivered', 'closed', 'issue');
--> statement-breakpoint
CREATE TYPE "public"."price_unit" AS ENUM('fixed', 'per_seat');
--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'published', 'archived');
--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'team', 'customer');
--> statement-breakpoint
-- Keeps updated_at current on every UPDATE. App code never sets it.
CREATE FUNCTION "public"."set_updated_at"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint
-- ==========================================================================
-- 1. Users and settings
-- profiles: one row per signed-in person (Neon Auth user id).
-- store_settings: the single row of store details shown in the shop.
-- ==========================================================================

-- profiles
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
-- store_settings
CREATE TABLE "store_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"map_url" text NOT NULL,
	"timings" text NOT NULL,
	"phone" text NOT NULL,
	"whatsapp" text NOT NULL,
	"privacy_notice" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_settings_single_row" CHECK (id = 1)
);
--> statement-breakpoint
-- Indexes: users and settings
CREATE INDEX "profiles_role_idx" ON "profiles" USING btree ("role");
--> statement-breakpoint
-- Row level security: on, with no policies. The app connects as the
-- table owner (bypasses RLS); any other role is denied.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "store_settings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
-- Triggers: users and settings
CREATE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "profiles"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "store_settings_set_updated_at" BEFORE UPDATE ON "store_settings"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
-- ==========================================================================
-- 2. Catalogue
-- categories > brands / qualities / colours > products > images, specs, variants.
-- Variants hold every price. Add-ons are priced per quality in addon_prices.
-- Catalogue rows used by orders are deactivated, not deleted (on delete restrict).
-- ==========================================================================

-- categories
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
-- brands
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_category_slug_key" UNIQUE("category_id","slug")
);
--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
-- qualities
CREATE TABLE "qualities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"warranty_years" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qualities_category_slug_key" UNIQUE("category_id","slug"),
	CONSTRAINT "qualities_warranty_years_check" CHECK ("qualities"."warranty_years" is null or "qualities"."warranty_years" > 0)
);
--> statement-breakpoint
ALTER TABLE "qualities" ADD CONSTRAINT "qualities_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
-- colours
CREATE TABLE "colours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"hex" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colours_name_unique" UNIQUE("name"),
	CONSTRAINT "colours_hex_check" CHECK ("colours"."hex" ~ '^#[0-9A-Fa-f]{6}$')
);
--> statement-breakpoint
-- products
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"brand_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
-- product_images
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- product_specs
CREATE TABLE "product_specs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_specs_product_label_key" UNIQUE("product_id","label")
);
--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- product_variants
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"size_label" text NOT NULL,
	"length_in" integer,
	"width_in" integer,
	"thickness_in" integer,
	"seats" integer,
	"quality_id" uuid,
	"colour_id" uuid,
	"mrp" numeric(12, 2),
	"price" numeric(12, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_variants_choice_key" UNIQUE NULLS NOT DISTINCT("product_id","size_label","length_in","width_in","thickness_in","quality_id","colour_id"),
	CONSTRAINT "product_variants_price_check" CHECK ("product_variants"."price" > 0),
	CONSTRAINT "product_variants_mrp_check" CHECK ("product_variants"."mrp" is null or "product_variants"."mrp" >= "product_variants"."price"),
	CONSTRAINT "product_variants_inches_check" CHECK (coalesce("product_variants"."length_in", 1) > 0 and coalesce("product_variants"."width_in", 1) > 0 and coalesce("product_variants"."thickness_in", 1) > 0),
	CONSTRAINT "product_variants_seats_check" CHECK ("product_variants"."seats" is null or "product_variants"."seats" > 0)
);
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_quality_id_qualities_id_fk" FOREIGN KEY ("quality_id") REFERENCES "public"."qualities"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_colour_id_colours_id_fk" FOREIGN KEY ("colour_id") REFERENCES "public"."colours"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
-- addons
CREATE TABLE "addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"product_id" uuid,
	"name" text NOT NULL,
	"kind" "addon_kind" DEFAULT 'addon' NOT NULL,
	"price_unit" "price_unit" DEFAULT 'fixed' NOT NULL,
	"size_label" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "addons_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "addons_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- addon_prices
CREATE TABLE "addon_prices" (
	"addon_id" uuid NOT NULL,
	"quality_id" uuid NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	CONSTRAINT "addon_prices_addon_id_quality_id_pk" PRIMARY KEY("addon_id","quality_id"),
	CONSTRAINT "addon_prices_price_check" CHECK ("addon_prices"."price" >= 0)
);
--> statement-breakpoint
ALTER TABLE "addon_prices" ADD CONSTRAINT "addon_prices_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "addon_prices" ADD CONSTRAINT "addon_prices_quality_id_qualities_id_fk" FOREIGN KEY ("quality_id") REFERENCES "public"."qualities"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- collections
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
-- product_collections
CREATE TABLE "product_collections" (
	"product_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	CONSTRAINT "product_collections_product_id_collection_id_pk" PRIMARY KEY("product_id","collection_id")
);
--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Indexes: catalogue
CREATE INDEX "products_category_status_idx" ON "products" USING btree ("category_id","status");
--> statement-breakpoint
CREATE INDEX "products_brand_id_idx" ON "products" USING btree ("brand_id");
--> statement-breakpoint
CREATE INDEX "product_images_product_sort_idx" ON "product_images" USING btree ("product_id","sort_order");
--> statement-breakpoint
CREATE INDEX "product_variants_quality_id_idx" ON "product_variants" USING btree ("quality_id");
--> statement-breakpoint
CREATE INDEX "product_variants_colour_id_idx" ON "product_variants" USING btree ("colour_id");
--> statement-breakpoint
CREATE INDEX "addons_category_id_idx" ON "addons" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX "addons_product_id_idx" ON "addons" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "addon_prices_quality_id_idx" ON "addon_prices" USING btree ("quality_id");
--> statement-breakpoint
CREATE INDEX "product_collections_collection_id_idx" ON "product_collections" USING btree ("collection_id");
--> statement-breakpoint
-- Row level security: on, with no policies. The app connects as the
-- table owner (bypasses RLS); any other role is denied.
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "brands" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qualities" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "colours" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "product_specs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "addons" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "addon_prices" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "collections" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "product_collections" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
-- Triggers: catalogue
CREATE TRIGGER "categories_set_updated_at" BEFORE UPDATE ON "categories"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "brands_set_updated_at" BEFORE UPDATE ON "brands"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "qualities_set_updated_at" BEFORE UPDATE ON "qualities"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "colours_set_updated_at" BEFORE UPDATE ON "colours"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "products_set_updated_at" BEFORE UPDATE ON "products"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "product_variants_set_updated_at" BEFORE UPDATE ON "product_variants"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "addons_set_updated_at" BEFORE UPDATE ON "addons"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "collections_set_updated_at" BEFORE UPDATE ON "collections"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
-- ==========================================================================
-- 3. Shop
-- Shortlist and cart of a signed-in customer. Cart rows store no prices:
-- the shop reads current prices on every cart view.
-- ==========================================================================

-- shortlist_items
CREATE TABLE "shortlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shortlist_items_profile_product_key" UNIQUE("profile_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "shortlist_items" ADD CONSTRAINT "shortlist_items_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shortlist_items" ADD CONSTRAINT "shortlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- cart_items
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"custom_length_in" integer,
	"custom_width_in" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_quantity_check" CHECK ("cart_items"."quantity" between 1 and 20),
	CONSTRAINT "cart_items_custom_size_check" CHECK (("cart_items"."custom_length_in" is null and "cart_items"."custom_width_in" is null) or ("cart_items"."custom_length_in" is not null and "cart_items"."custom_width_in" is not null and "cart_items"."custom_length_in" > 0 and "cart_items"."custom_width_in" > 0))
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- cart_item_addons
CREATE TABLE "cart_item_addons" (
	"cart_item_id" uuid NOT NULL,
	"addon_id" uuid NOT NULL,
	CONSTRAINT "cart_item_addons_cart_item_id_addon_id_pk" PRIMARY KEY("cart_item_id","addon_id")
);
--> statement-breakpoint
ALTER TABLE "cart_item_addons" ADD CONSTRAINT "cart_item_addons_cart_item_id_cart_items_id_fk" FOREIGN KEY ("cart_item_id") REFERENCES "public"."cart_items"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cart_item_addons" ADD CONSTRAINT "cart_item_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Indexes: shop
CREATE INDEX "shortlist_items_product_id_idx" ON "shortlist_items" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "cart_items_profile_id_idx" ON "cart_items" USING btree ("profile_id");
--> statement-breakpoint
CREATE INDEX "cart_items_variant_id_idx" ON "cart_items" USING btree ("variant_id");
--> statement-breakpoint
CREATE INDEX "cart_item_addons_addon_id_idx" ON "cart_item_addons" USING btree ("addon_id");
--> statement-breakpoint
-- Row level security: on, with no policies. The app connects as the
-- table owner (bypasses RLS); any other role is denied.
ALTER TABLE "shortlist_items" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "cart_items" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "cart_item_addons" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
-- Triggers: shop
CREATE TRIGGER "cart_items_set_updated_at" BEFORE UPDATE ON "cart_items"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
-- ==========================================================================
-- 4. Orders
-- Order items copy name, SKU, size, quality, colour and prices at sale time,
-- so an order never changes when the catalogue does.
-- order_status_history is written only by the log_order_status() trigger.
-- ==========================================================================

-- Feeds order numbers CC-00001, CC-00002…
CREATE SEQUENCE "public"."order_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
--> statement-breakpoint
-- orders
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text DEFAULT 'CC-' || lpad(nextval('order_number_seq')::text, 5, '0') NOT NULL,
	"profile_id" uuid,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"address" text NOT NULL,
	"status" "order_status" DEFAULT 'confirmed' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"advance_paid" numeric(12, 2) DEFAULT '0' NOT NULL,
	"expected_delivery" date,
	"salesperson_id" uuid,
	"updated_by_id" uuid,
	"delivery_photo_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "orders_subtotal_check" CHECK ("orders"."subtotal" >= 0),
	CONSTRAINT "orders_advance_paid_check" CHECK ("orders"."advance_paid" >= 0 and "orders"."advance_paid" <= "orders"."subtotal")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_salesperson_id_profiles_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_updated_by_id_profiles_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- order_items
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid,
	"product_name" text NOT NULL,
	"sku" text NOT NULL,
	"size_label" text NOT NULL,
	"quality_name" text,
	"colour_name" text,
	"custom_length_in" integer,
	"custom_width_in" integer,
	"quantity" integer NOT NULL,
	"unit_mrp" numeric(12, 2),
	"unit_price" numeric(12, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "order_items_quantity_check" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_prices_check" CHECK ("order_items"."unit_price" >= 0 and "order_items"."line_total" >= 0)
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- order_item_addons
CREATE TABLE "order_item_addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_id" uuid NOT NULL,
	"addon_id" uuid,
	"name" text NOT NULL,
	"price_unit" "price_unit" NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	CONSTRAINT "order_item_addons_price_check" CHECK ("order_item_addons"."price" >= 0)
);
--> statement-breakpoint
ALTER TABLE "order_item_addons" ADD CONSTRAINT "order_item_addons_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "order_item_addons" ADD CONSTRAINT "order_item_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- order_status_history
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "order_status" NOT NULL,
	"note" text,
	"changed_by_id" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_id_profiles_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- Indexes: orders
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "orders_profile_id_idx" ON "orders" USING btree ("profile_id");
--> statement-breakpoint
CREATE INDEX "orders_salesperson_id_idx" ON "orders" USING btree ("salesperson_id");
--> statement-breakpoint
CREATE INDEX "orders_updated_by_id_idx" ON "orders" USING btree ("updated_by_id");
--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX "order_items_variant_id_idx" ON "order_items" USING btree ("variant_id");
--> statement-breakpoint
CREATE INDEX "order_item_addons_order_item_id_idx" ON "order_item_addons" USING btree ("order_item_id");
--> statement-breakpoint
CREATE INDEX "order_item_addons_addon_id_idx" ON "order_item_addons" USING btree ("addon_id");
--> statement-breakpoint
CREATE INDEX "order_status_history_order_changed_idx" ON "order_status_history" USING btree ("order_id","changed_at");
--> statement-breakpoint
CREATE INDEX "order_status_history_changed_by_id_idx" ON "order_status_history" USING btree ("changed_by_id");
--> statement-breakpoint
-- Row level security: on, with no policies. The app connects as the
-- table owner (bypasses RLS); any other role is denied.
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "order_item_addons" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "order_status_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
-- Triggers: orders
CREATE TRIGGER "orders_set_updated_at" BEFORE UPDATE ON "orders"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
-- Writes one history row when an order is created and each time its status changes.
CREATE FUNCTION "public"."log_order_status"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO "order_status_history" ("order_id", "status", "changed_by_id")
  VALUES (NEW.id, NEW.status, NEW.updated_by_id);
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "orders_log_status_on_insert" AFTER INSERT ON "orders"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_order_status"();
--> statement-breakpoint
CREATE TRIGGER "orders_log_status_on_update" AFTER UPDATE OF "status" ON "orders"
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION "public"."log_order_status"();
--> statement-breakpoint
-- ==========================================================================
-- 5. CRM and content
-- leads: one per customer, with their activity in lead_events.
-- media: gallery photos and reels in one table.
-- ==========================================================================

-- leads
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"name" text NOT NULL,
	"phone" text,
	"area" text,
	"intent" "lead_intent" DEFAULT 'cold' NOT NULL,
	"assigned_to_id" uuid,
	"wants_whatsapp_offers" boolean DEFAULT false NOT NULL,
	"follow_up_done" boolean DEFAULT false NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_profiles_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- lead_events
CREATE TABLE "lead_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" "lead_event_type" NOT NULL,
	"product_id" uuid,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- media
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "media_type" NOT NULL,
	"title" text,
	"image_url" text NOT NULL,
	"video_url" text,
	"instagram_url" text,
	"product_id" uuid,
	"area" text,
	"delivery_month" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_reel_video_check" CHECK ("media"."type" <> 'reel' or "media"."video_url" is not null)
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- Indexes: crm and content
CREATE INDEX "leads_intent_idx" ON "leads" USING btree ("intent");
--> statement-breakpoint
CREATE INDEX "leads_assigned_to_id_idx" ON "leads" USING btree ("assigned_to_id");
--> statement-breakpoint
CREATE INDEX "leads_last_seen_at_idx" ON "leads" USING btree ("last_seen_at");
--> statement-breakpoint
CREATE INDEX "lead_events_lead_occurred_idx" ON "lead_events" USING btree ("lead_id","occurred_at");
--> statement-breakpoint
CREATE INDEX "lead_events_product_id_idx" ON "lead_events" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "media_type_published_sort_idx" ON "media" USING btree ("type","is_published","sort_order");
--> statement-breakpoint
CREATE INDEX "media_product_id_idx" ON "media" USING btree ("product_id");
--> statement-breakpoint
-- Row level security: on, with no policies. The app connects as the
-- table owner (bypasses RLS); any other role is denied.
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "lead_events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
-- Triggers: crm and content
CREATE TRIGGER "leads_set_updated_at" BEFORE UPDATE ON "leads"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "media_set_updated_at" BEFORE UPDATE ON "media"
  FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
