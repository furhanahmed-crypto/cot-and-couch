# Architecture — Cot & Couch

Next.js App Router storefront + staff admin on Neon Postgres.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind 4, shadcn/ui |
| DB | Neon + Drizzle ORM |
| Auth | Neon Auth → `coc_profiles` (`auth_user_id`) |

Path alias: `@/*` → `src/*`.

## Database

| Piece | Location |
|-------|----------|
| Runtime schema | `src/db/app-schema.ts` (aliases to `coc_*`) |
| Drizzle table defs | `schema-coc*.ts`, shared enums in `schema-enums.ts` |
| Migrations | `drizzle/0001` … `0008` (see `docs/README.md`) |
| Legacy (migrate-only) | `schema-legacy.ts`, `migrate-legacy-to-coc.ts` |

**Commands**

| Command | Use |
|---------|-----|
| `bun run db:migrate` | Apply all SQL migrations (unpooled URL in drizzle config) |
| `bun run db:seed` | Demo catalogue + ops into `coc_*` (dev) |
| `bun run db:migrate-bed-ranges` | Normalise 8 bed ranges, widths, variants, collection tags |
| `bun run db:studio` | Drizzle Studio |

Migration `0006_drop_legacy.sql` removes pre-revamp tables. `0007` / `0008` specialise the bed catalogue (width-only axes, `options.detail` for dimensions).

### Catalogue highlights

| Category (slug) | Shop label | Admin pattern |
|-----------------|------------|---------------|
| `mattresses` | Mattresses | Brands grid + per-brand option sheet |
| `cots` | Beds | Range cards; Edit sheet = name + shared widths (name + size) |
| Other furniture | Per category | Category config sheet (option groups from `category-config`) |

Product variants for beds: **width** (`cot_width`, label + detail) × **colour** when colour group is linked. Mapping for PDP/PLP: `src/services/catalogue-map.ts`.

Bed constants: `src/constants/bed-model.ts`. Category admin data: `src/services/admin-categories.ts`.

## Auth

| Piece | Location |
|-------|----------|
| Server | `src/lib/auth/server.ts` |
| Profile load/create | `src/lib/auth/profile.ts` |
| API | `src/app/api/auth/[...path]/route.ts` |
| Guard | `src/proxy.ts` |

Authorize by **`profile.id` and `role`**, not email alone.

## App layout

```
src/
├── app/           # Routes (shop, auth, admin)
├── components/    # ui/, shop/, admin/
├── services/      # DB reads/writes for pages
├── constants/     # routes, nav, config, bed-model
├── types/
└── db/            # schema, migrate-bed-ranges, seed
```

Admin dashboard metrics: `src/services/admin-dashboard.ts` (lead events, orders, catalogue health).

Shop category display names: `src/lib/shop-category-label.ts` and category fetch helpers in services.

## Admin IA

Overview · Catalogue (products, categories, mattress brands) · Commerce (orders, leads) · Content (gallery, reels) · Settings (store, team).

Old URLs redirect to the routes in `src/constants/routes.ts`.
