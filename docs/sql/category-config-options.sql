-- Category config option masters for Beds (cots), Sofas, Computer tables.
-- Run in Neon SQL Editor (or psql). Safe to re-run.
-- After this, Admin → Categories & templates → Manage options on each card.
-- Already applied on the project Neon via seed script (2026-10-19).

-- —— Beds (DB slug: cots) ——
INSERT INTO option_groups (key, label, sort_order) VALUES
  ('cot_storage_type', 'Storage type', 20),
  ('cot_headboard', 'Headboard', 21),
  ('cot_wood_type', 'Wood type', 22),
  ('cot_polish_type', 'Polish type', 23),
  ('cot_mattress_size', 'Recommended mattress size', 24),
  ('cot_wood_grade', 'Wood grade', 25)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label;

-- —— Sofas ——
INSERT INTO option_groups (key, label, sort_order) VALUES
  ('sofa_seating_capacity', 'Seating capacity', 30),
  ('sofa_configuration', 'Configuration', 31),
  ('sofa_upholstery', 'Upholstery', 32),
  ('sofa_frame_wood', 'Frame wood', 33),
  ('sofa_foam_density', 'Foam density', 34),
  ('sofa_seating_mechanism', 'Seating mechanism', 35),
  ('sofa_seat_height', 'Seat height', 36),
  ('sofa_seat_depth', 'Seat depth', 37),
  ('sofa_cushion_type', 'Cushion type', 38),
  ('sofa_firmness', 'Firmness', 39),
  ('sofa_legs', 'Legs', 40)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label;

-- —— Computer tables ——
INSERT INTO option_groups (key, label, sort_order) VALUES
  ('desk_shape', 'Shape', 50),
  ('desk_top_size', 'Top size', 51),
  ('desk_height', 'Height', 52),
  ('desk_load_capacity', 'Load capacity (kg)', 53),
  ('desk_material', 'Material', 54),
  ('desk_keyboard_tray', 'Keyboard tray', 55),
  ('desk_width_band', 'Width band', 56),
  ('desk_cpu_bay', 'CPU / UPS bay', 57),
  ('desk_drawers', 'Drawers', 58),
  ('desk_shelves', 'Shelves', 59),
  ('desk_cable_management', 'Cable management', 60)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label;

-- Helper: insert option if missing (by group key + slug)
-- Beds seeds
INSERT INTO options (group_id, label, slug, sort_order, is_active)
SELECT g.id, v.label, v.slug, v.sort_order, true
FROM option_groups g
JOIN (VALUES
  ('cot_storage_type', 'None', 'none', 1),
  ('cot_storage_type', 'Drawer', 'drawer', 2),
  ('cot_storage_type', 'Box', 'box', 3),
  ('cot_storage_type', 'Hydraulic', 'hydraulic', 4),
  ('cot_headboard', 'Wooden', 'wooden', 1),
  ('cot_headboard', 'Upholstered', 'upholstered', 2),
  ('cot_headboard', 'Carved', 'carved', 3),
  ('cot_headboard', 'Softback', 'softback', 4),
  ('cot_headboard', 'None', 'none', 5),
  ('cot_wood_type', 'Teak', 'teak', 1),
  ('cot_wood_type', 'Sheesham', 'sheesham', 2),
  ('cot_wood_type', 'Engineered wood', 'engineered-wood', 3),
  ('cot_wood_type', 'Solid wood mix', 'solid-wood-mix', 4),
  ('cot_polish_type', 'Natural', 'natural', 1),
  ('cot_polish_type', 'Melamine', 'melamine', 2),
  ('cot_polish_type', 'PU', 'pu', 3),
  ('cot_polish_type', 'Wax', 'wax', 4),
  ('cot_mattress_size', 'Single', 'single', 1),
  ('cot_mattress_size', 'Diwan', 'diwan', 2),
  ('cot_mattress_size', 'Queen', 'queen', 3),
  ('cot_mattress_size', 'King', 'king', 4),
  ('cot_wood_grade', 'Standard', 'standard', 1),
  ('cot_wood_grade', 'Grade A', 'grade-a', 2),
  ('cot_wood_grade', 'Premium', 'premium', 3),
  -- Sofas
  ('sofa_seating_capacity', '1', '1', 1),
  ('sofa_seating_capacity', '2', '2', 2),
  ('sofa_seating_capacity', '3', '3', 3),
  ('sofa_seating_capacity', '4', '4', 4),
  ('sofa_seating_capacity', '5+', '5-plus', 5),
  ('sofa_configuration', '1-seater', '1-seater', 1),
  ('sofa_configuration', '2-seater', '2-seater', 2),
  ('sofa_configuration', '3-seater', '3-seater', 3),
  ('sofa_configuration', 'L-shape', 'l-shape', 4),
  ('sofa_configuration', 'Sofa-cum-bed', 'sofa-cum-bed', 5),
  ('sofa_configuration', 'Recliner', 'recliner', 6),
  ('sofa_configuration', 'Set', 'set', 7),
  ('sofa_upholstery', 'Fabric', 'fabric', 1),
  ('sofa_upholstery', 'Leatherette', 'leatherette', 2),
  ('sofa_upholstery', 'Genuine leather', 'genuine-leather', 3),
  ('sofa_frame_wood', 'Teak', 'teak', 1),
  ('sofa_frame_wood', 'Hardwood', 'hardwood', 2),
  ('sofa_frame_wood', 'Plywood', 'plywood', 3),
  ('sofa_frame_wood', 'Metal', 'metal', 4),
  ('sofa_foam_density', 'Soft', 'soft', 1),
  ('sofa_foam_density', 'Medium', 'medium', 2),
  ('sofa_foam_density', 'High density', 'high-density', 3),
  ('sofa_seating_mechanism', 'Fixed', 'fixed', 1),
  ('sofa_seating_mechanism', 'Recliner', 'recliner', 2),
  ('sofa_seating_mechanism', 'Pull-out', 'pull-out', 3),
  ('sofa_seat_height', '16 in', '16-in', 1),
  ('sofa_seat_height', '17 in', '17-in', 2),
  ('sofa_seat_height', '18 in', '18-in', 3),
  ('sofa_seat_height', '19 in', '19-in', 4),
  ('sofa_seat_height', '20 in', '20-in', 5),
  ('sofa_seat_depth', '20 in', '20-in', 1),
  ('sofa_seat_depth', '22 in', '22-in', 2),
  ('sofa_seat_depth', '24 in', '24-in', 3),
  ('sofa_seat_depth', '26 in', '26-in', 4),
  ('sofa_cushion_type', 'Foam', 'foam', 1),
  ('sofa_cushion_type', 'Feather', 'feather', 2),
  ('sofa_cushion_type', 'Fibre', 'fibre', 3),
  ('sofa_firmness', 'Soft', 'soft', 1),
  ('sofa_firmness', 'Medium', 'medium', 2),
  ('sofa_firmness', 'Firm', 'firm', 3),
  ('sofa_legs', 'Wooden', 'wooden', 1),
  ('sofa_legs', 'Metal', 'metal', 2),
  ('sofa_legs', 'Hidden', 'hidden', 3),
  -- Computer tables
  ('desk_shape', 'Straight', 'straight', 1),
  ('desk_shape', 'L-shape', 'l-shape', 2),
  ('desk_shape', 'Corner', 'corner', 3),
  ('desk_top_size', 'Compact', 'compact', 1),
  ('desk_top_size', 'Medium', 'medium', 2),
  ('desk_top_size', 'Large', 'large', 3),
  ('desk_height', 'Standard (30 in)', 'standard-30-in', 1),
  ('desk_height', 'Sit-stand', 'sit-stand', 2),
  ('desk_load_capacity', '20 kg', '20-kg', 1),
  ('desk_load_capacity', '40 kg', '40-kg', 2),
  ('desk_load_capacity', '60 kg+', '60-kg-plus', 3),
  ('desk_material', 'Engineered wood', 'engineered-wood', 1),
  ('desk_material', 'Solid wood', 'solid-wood', 2),
  ('desk_material', 'Metal + wood', 'metal-wood', 3),
  ('desk_keyboard_tray', 'Yes', 'yes', 1),
  ('desk_keyboard_tray', 'No', 'no', 2),
  ('desk_width_band', 'Under 100 cm', 'under-100-cm', 1),
  ('desk_width_band', '100–140 cm', '100-140-cm', 2),
  ('desk_width_band', '140 cm+', '140-cm-plus', 3),
  ('desk_cpu_bay', 'Yes', 'yes', 1),
  ('desk_cpu_bay', 'No', 'no', 2),
  ('desk_drawers', 'None', 'none', 1),
  ('desk_drawers', '1', '1', 2),
  ('desk_drawers', '2', '2', 3),
  ('desk_drawers', '3+', '3-plus', 4),
  ('desk_shelves', 'None', 'none', 1),
  ('desk_shelves', '1', '1', 2),
  ('desk_shelves', '2+', '2-plus', 3),
  ('desk_cable_management', 'Yes', 'yes', 1),
  ('desk_cable_management', 'No', 'no', 2)
) AS v(group_key, label, slug, sort_order) ON g.key = v.group_key
WHERE NOT EXISTS (
  SELECT 1 FROM options o
  WHERE o.group_id = g.id AND o.slug = v.slug
);
