-- Product-level option allowlist (v1: colours). Works for all categories.
CREATE TABLE IF NOT EXISTS "coc_product_options" (
  "product_id" uuid NOT NULL,
  "option_id" uuid NOT NULL,
  CONSTRAINT "coc_product_options_pkey" PRIMARY KEY("product_id","option_id"),
  CONSTRAINT "coc_product_options_product_id_coc_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_options_option_id_coc_options_id_fk"
    FOREIGN KEY ("option_id") REFERENCES "coc_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_options_product_id_idx"
  ON "coc_product_options" ("product_id");
--> statement-breakpoint
-- Backfill colours already used on variants
INSERT INTO "coc_product_options" ("product_id", "option_id")
SELECT DISTINCT v."product_id", v."colour_option_id"
FROM "coc_product_variants" v
WHERE v."colour_option_id" IS NOT NULL
ON CONFLICT DO NOTHING;
