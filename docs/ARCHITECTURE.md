# Architecture

Showroom website for Cot & Couch: a shop for customers and a staff console at `/admin`.
This page describes the code **as it is today**. Planned changes are in [refactor/](./refactor/README.md).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router). This version has breaking changes: read `node_modules/next/dist/docs/` first. |
| UI | React 19, Tailwind 4, shadcn/ui |
| Database | Neon Postgres + Drizzle ORM (`neon-http` driver) |
| Auth | Neon Auth (email + password, cookie sessions) |
| Validation | Zod (`src/validation/`) |
| Client state | One Zustand store (`src/stores/shop-store.ts`): cart count and shortlist ids |

## Folders

```
src/
  app/          (shop) pages + actions.ts, (auth) login/register, admin/ (dashboard, products, categories, colours, collections, orders, leads; media, settings, team "Being rebuilt" until Phase 7)
  components/   ui/ (shadcn), shop/, admin/ (shell, common/, one folder per screen), shared/
  services/     <area>/queries.ts, mutations.ts, mappers.ts (catalogue, cart, shortlist, orders, leads, users, settings, media, collections, auth); admin-only files are named admin-queries.ts / admin-mutations.ts
  validation/   Zod schemas for user input (common, shop, catalogue, products)
  types/        DTOs (catalogue, cart, shop), action.ts, db.ts (row types inferred from the schema)
  constants/    routes, categories, enum value lists (products, orders, leads, media, users)
  db/           index.ts (client), schema/, seed/
  lib/          pure helpers: format, money, pricing, variant-picker, product-filters (unit tested)
  stores/  hooks/
  proxy.ts      Next.js request proxy (auth)
  proxy.ts      Next.js request proxy (auth)
drizzle/        SQL migrations
docs/           see docs/README.md
```

## Catalogue today

- **Categories:** Mattresses, Cots, Sofas. The shop shows Cots as "Beds".
- Every price is in `product_variants` (and `addon_prices`). Nothing is priced in code.
- **Mattresses:** product = brand + model. Variants = size x thickness.
- **Cots:** product = style. Variants = quality x size (75 and 78 in) x colour. Add-ons are category-wide, priced per quality.
- **Sofas:** product = range. Variants = model x quality. Add-ons and recliners belong to the product. They show in the shop with the generic product page; the sofa-specific polish is Phase 8.
- **Product page:** `lib/variant-picker.ts` picks one variant from quality, size, thickness and colour. A choice the current quality does not have is shown disabled.
- **Product cards** have no "add to cart" button: cots and sofas need choices first, so adding happens on the product page.
- **Category filters** live in the URL (`lib/product-filter-params.ts`) and run in the browser over the category's cards.
- **Customer activity** (views, shortlist, call / WhatsApp / visit / callback taps, logins) is saved as lead events for staff.

## Database

- New design: 24 tables, no prefix, schema in `src/db/schema/`, one migration `drizzle/0000_init.sql`. Full design: [refactor/database.md](./refactor/database.md).
- Seed: `src/db/seed/` (client price lists + dummy people, orders, leads, media).
- Public shop reads are cached (`"use cache"` + `tagShopCache()`); cart, shortlist and orders are read per request.
- The DB holds seed data only. There are no real customers or orders.

## Auth and roles

- One login page, `/login`, for customers and staff.
- `profiles.role` is `admin`, `team` or `customer`.
- `/admin` checks the role on the server (`getStaffProfile()` in `services/auth/require-staff.ts`) and redirects everyone else to `/`.
- Team users do not see Categories, Colours, Collections, Store or Team in the sidebar; those pages call `requireAdminPage()` and admin-only actions call `requireStaff("admin")`.
- Shop actions call `requireProfile()`; an expired session returns "Please sign in again".
- Authorise by `profile.id` and `role`, never by comparing email strings.
- Secrets live in `.env.local` (git-ignored). Never commit them.

## Environment variables

`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `NEON_AUTH_JWKS_URL`, `NEON_BRANCH`, `NEXT_PUBLIC_DEV_MODE`.
Optional: `SEED_STAFF_EMAILS` (comma-separated Neon Auth emails that `db:seed` makes admin; default `test@cotandcouch.com`).

## Commands

```bash
bun run dev            # dev server
bun run build          # production build
bun run lint
bun run test           # unit tests (Vitest)
bun run db:generate    # SQL migration from schema changes
bun run db:migrate     # apply migrations
bun run db:reset --yes # drop all app tables, then migrate (Neon Auth untouched)
bun run db:seed        # clear app tables and seed
bun run db:check       # constraint and trigger smoke test (saves nothing)
bun run db:studio      # browse tables
```

## Decisions still in force

- Admin and DB call the category **Cots**; the shop calls it **Beds**.
- Customers can save a cart. There is no online payment.
- Theme, colours and fonts stay as they are ([DESIGN.md](./DESIGN.md)).
