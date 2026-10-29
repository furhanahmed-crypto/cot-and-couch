-- Bed width options: display name + dimensions (detail).

ALTER TABLE coc_options ADD COLUMN IF NOT EXISTS detail text;

UPDATE coc_options o
SET label = 'Single', detail = '3 ft × 6 ft', slug = 'single', sort_order = 1
FROM coc_option_groups g
WHERE g.key = 'cot_width' AND o.group_id = g.id AND o.slug IN ('3-1-ft', 'single');

UPDATE coc_options o
SET
  label = 'Double / Diwan Bed Width',
  detail = '4 ft × 6 ft',
  slug = 'double-diwan',
  sort_order = 2
FROM coc_option_groups g
WHERE g.key = 'cot_width' AND o.group_id = g.id AND o.slug IN ('3-6-ft', 'double-diwan');

UPDATE coc_options o
SET label = 'Queen Size', detail = '5 ft × 6 ft', slug = 'queen', sort_order = 3
FROM coc_option_groups g
WHERE g.key = 'cot_width' AND o.group_id = g.id AND o.slug IN ('4-2-ft', 'queen');

UPDATE coc_options o
SET label = 'King Size', detail = '6 ft × 6 ft', slug = 'king', sort_order = 4
FROM coc_option_groups g
WHERE g.key = 'cot_width' AND o.group_id = g.id AND o.slug IN ('4-6-ft', 'king');

UPDATE coc_products SET name = 'Ideal Range', updated_at = now() WHERE slug = 'cot-range-1';
UPDATE coc_products SET name = 'Optimum Range', updated_at = now() WHERE slug = 'cot-range-2';
UPDATE coc_products SET name = 'Essential Range', updated_at = now() WHERE slug = 'cot-range-3';
UPDATE coc_products SET name = 'Prime Range', updated_at = now() WHERE slug = 'cot-range-4';
UPDATE coc_products SET name = 'Premium Range', updated_at = now() WHERE slug = 'cot-range-5';
UPDATE coc_products SET name = 'Royal Range', updated_at = now() WHERE slug = 'cot-range-6';
