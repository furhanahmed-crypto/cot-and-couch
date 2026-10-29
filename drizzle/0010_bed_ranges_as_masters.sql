-- Bed ranges as masters (like mattress brands). Products belong to a range.

CREATE TABLE IF NOT EXISTS coc_bed_ranges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer DEFAULT 0 NOT NULL,
  cot_type coc_cot_type DEFAULT 'non_cushion' NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

INSERT INTO coc_bed_ranges (name, slug, sort_order, cot_type)
VALUES
  ('Ideal Range', 'ideal-range', 1, 'non_cushion'),
  ('Optimum Range', 'optimum-range', 2, 'non_cushion'),
  ('Essential Range', 'essential-range', 3, 'non_cushion'),
  ('Prime Range', 'prime-range', 4, 'non_cushion'),
  ('Premium Range', 'premium-range', 5, 'non_cushion'),
  ('Royal Range', 'royal-range', 6, 'non_cushion'),
  ('Range 7', 'range-7', 7, 'cushion'),
  ('Range 8', 'range-8', 8, 'cushion')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  cot_type = EXCLUDED.cot_type;

ALTER TABLE coc_products
  ADD COLUMN IF NOT EXISTS bed_range_id uuid REFERENCES coc_bed_ranges(id);

-- Remove old "range = product" rows (and any other cot products before re-seed)
DELETE FROM coc_products p
USING coc_categories c
WHERE p.category_id = c.id AND c.slug = 'cots';

-- Stop using denormalised range_number on products
ALTER TABLE coc_products DROP COLUMN IF EXISTS range_number;
