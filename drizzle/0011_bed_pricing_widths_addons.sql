-- Cot price-list widths (inches + 78" extra length) + Additional Storage & Cushion addons.
-- Prime Range = former Cushion / Cushion Back Range (cot_type cushion).

--> statement-breakpoint
UPDATE "coc_bed_ranges"
SET "cot_type" = 'cushion', "name" = 'Prime Range'
WHERE "slug" = 'prime-range';
--> statement-breakpoint
UPDATE "coc_products" p
SET "cot_type" = 'cushion'
FROM "coc_bed_ranges" r
WHERE p."bed_range_id" = r."id" AND r."slug" = 'prime-range';
--> statement-breakpoint
-- Deactivate legacy width slugs (ft labels without inches)
UPDATE "coc_options" o
SET "is_active" = false
FROM "coc_option_groups" g
WHERE o."group_id" = g."id"
  AND g."key" = 'cot_width'
  AND o."slug" IN ('single', 'double-diwan', 'queen', 'king');
--> statement-breakpoint
-- Upsert inch-based widths (labels + new 78" SKUs). Seed script fills prices on variants.
DO $$
DECLARE
  gid uuid;
BEGIN
  SELECT id INTO gid FROM coc_option_groups WHERE key = 'cot_width' LIMIT 1;
  IF gid IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO coc_options (group_id, label, slug, detail, sort_order, is_active)
  VALUES
    (gid, 'Single 75×36 inches', 'single-75x36', '75 × 36 inches', 1, true),
    (gid, 'Singles-Jodi 75×36 inches (2 pcs)', 'singles-jodi-75x36', '75 × 36 inches × 2 pcs', 2, true),
    (gid, 'Double 75×48 inches', 'double-75x48', '75 × 48 inches', 3, true),
    (gid, 'Queen 75×60 inches', 'queen-75x60', '75 × 60 inches', 4, true),
    (gid, 'King 75×72 inches', 'king-75x72', '75 × 72 inches', 5, true),
    (gid, 'Double 78×48 inches', 'double-78x48', '78 × 48 inches · extra length', 6, true),
    (gid, 'Queen 78×60 inches', 'queen-78x60', '78 × 60 inches · extra length', 7, true),
    (gid, 'King 78×72 inches', 'king-78x72', '78 × 72 inches · extra length', 8, true)
  ON CONFLICT (group_id, slug) DO UPDATE SET
    label = EXCLUDED.label,
    detail = EXCLUDED.detail,
    sort_order = EXCLUDED.sort_order,
    is_active = true;
END $$;
--> statement-breakpoint
-- Category addons for beds (standard-tier list prices; shop resolves affordable tier in app)
DO $$
DECLARE
  cid uuid;
BEGIN
  SELECT id INTO cid FROM coc_categories WHERE slug = 'cots' LIMIT 1;
  IF cid IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO coc_category_addons (category_id, key, label, price, sort_order, is_active)
  VALUES
    (cid, 'storage_king', 'Storage box (King)', '7800', 1, true),
    (cid, 'storage_queen', 'Storage box (Queen)', '6800', 2, true),
    (cid, 'hydraulics', 'Hydraulics', '7500', 3, true),
    (cid, 'mobile_top', 'Mobile top', '4500', 4, true),
    (cid, 'headbox_storage', 'Headbox with storage boxes', '6500', 5, true),
    (cid, 'cushion_head', 'Cushion head', '6800', 6, true),
    (cid, 'cushion_foot', 'Cushion foot', '4800', 7, true),
    (cid, 'full_cushion_king', 'Full body cushion (King)', '6800', 8, true),
    (cid, 'full_cushion_queen', 'Full body cushion (Queen)', '4800', 9, true)
  ON CONFLICT (category_id, key) DO UPDATE SET
    label = EXCLUDED.label,
    price = EXCLUDED.price,
    sort_order = EXCLUDED.sort_order,
    is_active = true;
END $$;
