# Decisions log

Short record of material choices. See `ARCHITECTURE.md` and `README.md`.

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
