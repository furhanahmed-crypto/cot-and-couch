# Decisions log

Short record of material choices. See `ARCHITECTURE.md` and `README.md`.

## 2026 — Multi-range bed products (Ideal / Optimum / Essential)

- Junction `coc_product_bed_ranges`: one style product (Classic / Storage / Platform) can link many ranges.
- Admin: **Available ranges** multiselect; variants UI has **one tab per range** with editable MRP/price/stock.
- Variants: `coc_product_variants.bed_range_id` — width × colour × range SKUs (`0014`). Generate / range-save fills missing ranges from the sheet without overwriting edits.
- Shop PLP: one card per product×range; “from” uses that range’s SKUs. PDP Change quality swaps to that range’s SKUs (DB prices).
- Cart: `coc_cart_lines.bed_range_id` + range-scoped `variantId`.
- Migrations `0013` + `0014`; seed: 3 shared styles + per-range products for Prime…Range 8.

## 2026 — Cot storage: Manual vs Hydraulics

- PDP: **Storage type** = None / Manual / Hydraulic (King/Queen). Manual = storage price; Hydraulic = storage + hydraulics surcharge.
- Other addons stay independent: mobile top, headbox, cushion head/foot, full body cushion.

## 2026 — Product colour allowlist

- Table `coc_product_options` (product_id + option_id). V1 UI: Available colors on non-mattress products.
- Variant generate for cots/furniture uses only selected colours. Unchecking deactivates those SKUs.

## 2026 — Single login for shop + admin

- No `/admin/login`. Use `/login` (and register).
- `/admin` layout: `getStaffProfile()` → else `redirect("/")` before render.

## 2026 — Admin “Cots” / shop “Beds”

- Admin UI + DB category name: **Cots** (slug `cots`).
- Customer shop: `shopCategoryDisplayName` maps `cots` → **Beds**.
- Admin reads categories via **`getAdminCategories`** (uncached). Shop uses cached `getCategories` + shop label map.

## 2026 — Cot price lists + addons

- Widths show inches (`King 75×72 inches`) plus 78″ extra-length SKUs with per-size surcharges.
- **Prime Range** = former Cushion / Cushion Back (never use those names in UI). `cot_type = cushion`.
- Addon prices: Ideal/Optimum/Prime = affordable sheet; Essential+ = standard sheet. Cushion head/foot only on non-cushion ranges.
- Constants: `src/constants/bed-pricing.ts`. Reseed: `bun run db:seed-beds` after migrate `0011`.

## 2026 — Bed ranges as masters

- **`coc_bed_ranges`** mirrors **`coc_mattress_brands`**. Products use `bed_range_id` (not “one product per range”).
- Categories → Beds manages **range masters** (+ shared widths). Products page creates sellable beds and filters by range.
- Seed: 8 ranges × 3 styles (Classic / Storage / Platform) = 24 products. `bun run db:seed-beds`.
- Shop PLP filters are derived from loaded products (range, width, mattress attrs) — no static dummy filter lists.

## 2026 — Client-ready prune

- Live catalogue: mattresses + beds. Sofas / computer tables inactive (`0009`).
- Removed Phase-1 mock catalogue and legacy migrator.

## 2026 — `coc_*` database revamp

App uses **`app-schema` aliases only**. Prefer extending services/admin patterns over one-off tables.
