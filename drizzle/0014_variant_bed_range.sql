-- Cot variants are scoped to a bed range (Ideal / Optimum / Essential, …).
ALTER TABLE "coc_product_variants"
  ADD COLUMN IF NOT EXISTS "bed_range_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "coc_product_variants"
    ADD CONSTRAINT "coc_product_variants_bed_range_id_fk"
    FOREIGN KEY ("bed_range_id") REFERENCES "coc_bed_ranges"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coc_product_variants_bed_range_id_idx"
  ON "coc_product_variants" ("bed_range_id");
--> statement-breakpoint
-- Existing SKUs belong to the product’s primary range
UPDATE "coc_product_variants" v
SET "bed_range_id" = p."bed_range_id"
FROM "coc_products" p
WHERE v."product_id" = p."id"
  AND p."bed_range_id" IS NOT NULL
  AND v."bed_range_id" IS NULL;
