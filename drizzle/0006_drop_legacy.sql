-- Phase 8: remove pre-revamp tables after app reads/writes coc_* only.
-- Shared enums (user_role, product_status, …) are kept.

DROP TABLE IF EXISTS coc_migration_id_map CASCADE;

DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS segments CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;
DROP TABLE IF EXISTS reels CASCADE;
DROP TABLE IF EXISTS product_collections CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS profile_favourites CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS mattress_brand_options CASCADE;
DROP TABLE IF EXISTS size_dimensions CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS option_groups CASCADE;
DROP TABLE IF EXISTS mattress_brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
