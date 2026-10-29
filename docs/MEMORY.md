# Decisions log

Short record of material choices. See `ARCHITECTURE.md` and `README.md` for current stack and catalogue rules.

## 2026 — Beds category model

- **Slug** stays `cots` in Postgres; **storefront label** is **Beds** (slug unchanged for URLs and FKs).
- Each **range** is a **published product** (max 8), not a free-form option list. Obsolete bed option groups (headboard, wood, polish, etc.) removed in `0007_bed_model_cleanup.sql`.
- **Widths** are shared masters in `cot_width`: display **name** + **size** stored as `coc_options.label` and `coc_options.detail` (`0008_bed_width_detail.sql`).
- **Admin Categories** for beds matches mattresses pattern: range cards + width sheet with two-field modal; generic “Manage options” sheet is not used for `cots`.
- **Collections** Royal Range / Victoria are product tags (ranges 8 / 7 in the normalisation script), separate from product name “Royal Range” on range 6.

## 2026 — `coc_*` database revamp (Phases 1–8)

Postgres revamp uses `coc_*` tables, lead events, multi-line orders, and versioned Drizzle migrations. App code uses **`app-schema` aliases only**. Legacy tables dropped in `0006_drop_legacy.sql`.

Admin IA consolidated: dashboard from `admin-dashboard.ts`, categories/templates, commerce filters, docs trimmed. Manual SQL snippets under `docs/sql/` were removed — **source of truth is `drizzle/*.sql` plus `db:seed` / `db:migrate-bed-ranges`.**

## 2025 — Phase 1 prototype

Frontend-first Digital Window with mock flows before Neon backend. Customer OTP and cart rules evolved into email auth + `coc_profiles` / `coc_cart_lines`.

When adding features, prefer extending existing services and admin patterns over new one-off tables or screens.
