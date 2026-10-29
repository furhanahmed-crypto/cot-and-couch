# Cot & Couch — docs

Minimal engineering docs for this repo.

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, folders, database, auth, commands |
| [RULES.md](./RULES.md) | Coding standards (read before large changes) |
| [DESIGN.md](./DESIGN.md) | UI tokens and patterns |
| [PRD.md](./PRD.md) | Product scope (original Phase 1 brief; app now has real DB + admin) |
| [SECURITY.md](./SECURITY.md) | Auth and data handling notes |
| [MEMORY.md](./MEMORY.md) | Short decisions log |

## Current platform (2026)

The app runs on **Neon Postgres** with **`coc_*` tables**, a **storefront**, and a **staff admin**. Legacy pre-revamp tables were removed in migration `0006_drop_legacy.sql`.

| Area | Summary |
|------|---------|
| **Migrations** | Versioned SQL in `drizzle/` — apply with `bun run db:migrate` (`DATABASE_URL_UNPOOLED`) |
| **Seed** | `bun run db:seed` — demo catalogue and ops (dev) |
| **Runtime schema** | `src/db/app-schema.ts` aliases only (no legacy table names in app code) |
| **Admin** | Dashboard with live metrics, catalogue (products, categories, mattress brands), orders, leads, gallery/reels, settings |
| **Shop labels** | DB slug `cots` displays as **Beds** on the storefront (`src/lib/shop-category-label.ts`) |

### Database migrations (order)

| File | Purpose |
|------|---------|
| `0001_coc_foundation` | Profiles, categories, store settings |
| `0002_coc_catalogue` | Option groups, products, variants, collections |
| `0003_coc_shop` | Favourites, cart |
| `0004_coc_crm` | Leads and lead events |
| `0005_coc_commerce` | Orders, gallery, reels, seed hooks |
| `0006_drop_legacy` | Drop old `products` / `profiles` / … tables |
| `0007_bed_model_cleanup` | Beds: drop obsolete cot option groups; width-only variant axis |
| `0008_bed_width_detail` | `coc_options.detail` for width dimensions; rename ranges 1–6 |

**Beds data normalisation** (after migrations): `bun run db:migrate-bed-ranges` — ensures 8 published range products, 4 shared widths, variants (width × colour), Royal Range / Victoria collection tags on ranges 8 and 7. Script: `src/db/migrate-bed-ranges.ts`.

**One-time legacy copy** (only if migrating an old DB before Phase 8): `src/db/migrate-legacy-to-coc.ts` + `schema-legacy.ts` — not needed on fresh environments.

### Catalogue model (admin + shop)

**Mattresses** — Category slug `mattresses`. Brands are managed on **Admin → Categories** (add brand, per-brand option sheet for types / firmness / layers / covers). Brand master list also under **Mattress brands**.

**Beds** — Category slug `cots` (shop: **Beds**). Not configured like sofa option groups:

- **8 range products** (`cot-range-1` … `cot-range-8`), each a product with its own pricing in the product editor.
- Default names: ranges **1–6** Ideal / Optimum / Essential / Prime / Premium / Royal Range; **7–8** stay **Range 7** / **Range 8**.
- **4 shared width options** (`cot_width`): name in `label`, dimensions in `detail` (e.g. Queen Size + `5 ft × 6 ft`). Admin: Categories → Beds → **Manage bed widths** (add/edit via name + size modal).
- **Ranges UI** on Categories mirrors mattresses: **Add range**, cards with edit/delete (archive).
- Collections: tag **Royal Range** and **Victoria** on products (typically range 8 and 7) under product editor.

Constants and seeds: `src/constants/bed-model.ts`. Server actions: `src/app/admin/categories/bed-actions.ts`. UI: `src/components/admin/beds-category-section.tsx`, `bed-width-options-sheet.tsx`.

### Commands (quick reference)

```bash
bun run dev
bun run db:migrate
bun run db:seed          # dev demo data
bun run db:migrate-bed-ranges
bun run db:studio
```
