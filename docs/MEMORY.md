# Decisions log

Short record of material choices. See `ARCHITECTURE.md` and `README.md`.

## 2026 — Client-ready prune

- **Live catalogue:** mattresses + beds only. Sofas and computer tables stay as inactive category rows for a later phase; their products and option groups were removed (`0009_prune_deferred_catalogue.sql`).
- Deleted Phase-1 **mock catalogue** (`src/data/mock/`), legacy migrator (`migrate-legacy-to-coc`, `schema-legacy`), and unused `admin-mock`.
- PLP filter templates live in `src/constants/plp-filters.ts` (not mock data).

## 2026 — Beds category model

- **Slug** stays `cots`; storefront / admin display name **Beds**.
- Each **range** is a published product (max 8). Widths are shared masters (`label` + `detail`).
- Admin Categories: range cards; **Edit** opens a sheet (rename + shared widths). No separate “Manage bed widths” button.
- Collections Royal Range / Victoria are product tags (typically ranges 8 / 7), separate from product name “Royal Range” on range 6.

## 2026 — `coc_*` database revamp

Postgres revamp uses `coc_*` tables and versioned Drizzle migrations. App code uses **`app-schema` aliases only**. Legacy tables dropped in `0006_drop_legacy.sql`.

When adding features, prefer extending existing services and admin patterns over new one-off tables or screens.
