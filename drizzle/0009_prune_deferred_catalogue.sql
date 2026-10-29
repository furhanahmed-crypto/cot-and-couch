-- Client-ready catalogue: mattresses + beds only.
-- Remove archived leftovers and defer sofas / computer tables.

-- 1) Drop products we do not ship (archived, or deferred categories)
DELETE FROM coc_products p
USING coc_categories c
WHERE p.category_id = c.id
  AND (
    p.status = 'archived'
    OR c.slug IN ('sofas', 'computer-tables')
  );

-- 2) Hide deferred categories (kept as rows for a later phase)
UPDATE coc_categories
SET is_active = false
WHERE slug IN ('sofas', 'computer-tables');

-- 3) Admin + shop display name for beds
UPDATE coc_categories
SET name = 'Beds'
WHERE slug = 'cots';

-- 4) Remove sofa / desk option masters (re-seed when those categories ship)
DELETE FROM coc_product_option_values pov
USING coc_options o
JOIN coc_option_groups g ON g.id = o.group_id
WHERE pov.option_id = o.id
  AND (g.key LIKE 'sofa_%' OR g.key LIKE 'desk_%');

DELETE FROM coc_options o
USING coc_option_groups g
WHERE o.group_id = g.id
  AND (g.key LIKE 'sofa_%' OR g.key LIKE 'desk_%');

DELETE FROM coc_category_option_groups cog
USING coc_option_groups g
WHERE cog.option_group_id = g.id
  AND (g.key LIKE 'sofa_%' OR g.key LIKE 'desk_%');

DELETE FROM coc_option_groups
WHERE key LIKE 'sofa_%' OR key LIKE 'desk_%';
