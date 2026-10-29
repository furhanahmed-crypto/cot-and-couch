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
| Drizzle table defs | `schema-coc*.ts`, enums in `schema-enums.ts` |
| Migrations | `drizzle/0001` … `0009` (see `docs/README.md`) |
| Seed | `src/db/seed.ts` + `src/data/catalogue/seed-data.ts` |

**Commands:** `bun run db:migrate` · `bun run db:seed` · `bun run db:migrate-bed-ranges` · `bun run db:studio`

### Catalogue (live vs deferred)

| Category (slug) | Shop label | Status |
|-----------------|------------|--------|
| `mattresses` | Mattresses | Live — brand sheets on Categories |
| `cots` | Beds | Live — range products + shared widths |
| `sofas` | Sofas | Deferred — `is_active = false`, no products |
| `computer-tables` | Computer tables | Deferred — same |

Bed constants: `src/constants/bed-model.ts`. PLP filters: `src/constants/plp-filters.ts`.

## Auth

| Piece | Location |
|-------|----------|
| Server | `src/lib/auth/server.ts` |
| Profile | `src/lib/auth/profile.ts` |
| API | `src/app/api/auth/[...path]/route.ts` |
| Guard | `src/proxy.ts` |

Authorize by **`profile.id` and `role`**, not email alone.

## App layout

```
src/
├── app/           # Routes (shop, auth, admin)
├── components/    # ui/, shop/, admin/
├── services/      # DB reads/writes
├── constants/     # routes, nav, bed-model, category-config, plp-filters
├── data/catalogue # Seed masters (not mock UI data)
├── types/
└── db/
```

Admin dashboard: `src/services/admin-dashboard.ts`. Shop category labels: `src/lib/shop-category-label.ts`.

## Admin IA

Overview · Catalogue (products, categories, mattress brands) · Commerce (orders, leads) · Content (gallery, reels) · Settings (store, team).
