-- Product ↔ bed range (many-to-many). Shared styles can span Ideal/Optimum/Essential.
CREATE TABLE IF NOT EXISTS "coc_product_bed_ranges" (
  "product_id" uuid NOT NULL,
  "bed_range_id" uuid NOT NULL,
  CONSTRAINT "coc_product_bed_ranges_pkey" PRIMARY KEY("product_id","bed_range_id"),
  CONSTRAINT "coc_product_bed_ranges_product_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "coc_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "coc_product_bed_ranges_bed_range_id_fk"
    FOREIGN KEY ("bed_range_id") REFERENCES "coc_bed_ranges"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_bed_ranges_product_id_idx"
  ON "coc_product_bed_ranges" ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_bed_ranges_bed_range_id_idx"
  ON "coc_product_bed_ranges" ("bed_range_id");
--> statement-breakpoint
-- Cart line stores selected quality/range for runtime sheet pricing
ALTER TABLE "coc_cart_lines"
  ADD COLUMN IF NOT EXISTS "bed_range_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "coc_cart_lines"
    ADD CONSTRAINT "coc_cart_lines_bed_range_id_fk"
    FOREIGN KEY ("bed_range_id") REFERENCES "coc_bed_ranges"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
-- Backfill junction from primary bed_range_id
INSERT INTO "coc_product_bed_ranges" ("product_id", "bed_range_id")
SELECT p."id", p."bed_range_id"
FROM "coc_products" p
WHERE p."bed_range_id" IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Ideal Classic/Storage/Platform also available in Optimum + Essential
INSERT INTO "coc_product_bed_ranges" ("product_id", "bed_range_id")
SELECT p."id", r."id"
FROM "coc_products" p
CROSS JOIN "coc_bed_ranges" r
WHERE p."slug" IN (
  'ideal-range-classic',
  'ideal-range-storage',
  'ideal-range-platform'
)
AND r."slug" IN ('optimum-range', 'essential-range')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Drop Optimum / Essential style duplicates (variants + cart cascade)
DELETE FROM "coc_products"
WHERE "slug" LIKE 'optimum-range-%'
   OR "slug" LIKE 'essential-range-%';
--> statement-breakpoint
-- Rename keepers to style-only names/slugs
UPDATE "coc_products" SET "name" = 'Classic', "slug" = 'classic', "updated_at" = now()
WHERE "slug" = 'ideal-range-classic';
--> statement-breakpoint
UPDATE "coc_products" SET "name" = 'Storage', "slug" = 'storage', "updated_at" = now()
WHERE "slug" = 'ideal-range-storage';
--> statement-breakpoint
UPDATE "coc_products" SET "name" = 'Platform', "slug" = 'platform', "updated_at" = now()
WHERE "slug" = 'ideal-range-platform';
