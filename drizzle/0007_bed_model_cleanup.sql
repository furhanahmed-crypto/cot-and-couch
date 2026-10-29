-- Remove obsolete bed spec option groups (headboard, wood type, etc.).
-- Beds use coc_width + colour on variants; 8 range products hold range_number.

DELETE FROM coc_product_option_values
WHERE option_group_id IN (
  SELECT id FROM coc_option_groups
  WHERE key IN (
    'cot_storage_type',
    'cot_headboard',
    'cot_wood_type',
    'cot_polish_type',
    'cot_mattress_size',
    'cot_wood_grade'
  )
);

DELETE FROM coc_category_option_groups
WHERE option_group_id IN (
  SELECT id FROM coc_option_groups
  WHERE key IN (
    'cot_storage_type',
    'cot_headboard',
    'cot_wood_type',
    'cot_polish_type',
    'cot_mattress_size',
    'cot_wood_grade'
  )
);

DELETE FROM coc_options
WHERE group_id IN (
  SELECT id FROM coc_option_groups
  WHERE key IN (
    'cot_storage_type',
    'cot_headboard',
    'cot_wood_type',
    'cot_polish_type',
    'cot_mattress_size',
    'cot_wood_grade'
  )
);

DELETE FROM coc_option_groups
WHERE key IN (
  'cot_storage_type',
  'cot_headboard',
  'cot_wood_type',
  'cot_polish_type',
  'cot_mattress_size',
  'cot_wood_grade'
);
