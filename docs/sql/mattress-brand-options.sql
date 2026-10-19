-- Optional manual apply if you cannot run the Node migrator.
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT).

ALTER TABLE mattress_brands
  ADD COLUMN IF NOT EXISTS defaults jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS mattress_brand_options (
  brand_id uuid NOT NULL REFERENCES mattress_brands(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  PRIMARY KEY (brand_id, option_id)
);

-- Prefer: npm run db:seed (or the agent Node script) to attach
-- per-brand mattress types / firmness / layers / covers.
-- Categories → Mattresses → edit brand sheet also manages these live.

