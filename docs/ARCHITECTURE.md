# Architecture

Showroom website for Cot & Couch: a shop for customers and a staff console at `/admin`.
This page describes the code as it is. How it got here (the 2026 refactor, Phases 0–9) is in [refactor/](./refactor/README.md).

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
  app/          (shop) pages + actions.ts, (auth) login/register, admin/<screen>/ page.tsx + actions.ts
                (dashboard, products, categories, colours, collections, orders, leads, media, settings, team)
  components/   ui/ (shadcn), shop/, admin/ (shell, common/, one folder per screen), shared/
  services/     one folder per area: queries.ts / mutations.ts for the shop, admin-queries.ts / admin-mutations.ts
                for the admin (catalogue, cart, shortlist, orders, leads, products, categories, addons, colours,
                collections, media, settings, users, dashboard, auth)
  validation/   Zod schemas for user input, one file per area (common, shop, catalogue, products, orders, leads,
                media, settings, team)
  types/        DTOs per area (catalogue, cart, shop, admin-*), action.ts, pagination.ts, db.ts (row types from the schema)
  constants/    routes, categories, admin-nav, enum value lists with labels and badge tones (products, orders, leads, media, users)
  db/           index.ts (client), schema/, seed/
  lib/          pure helpers: format, money, pricing, order-lines, variant-picker, product-filters, list and URL params (unit tested)
  stores/  hooks/
  proxy.ts      Next.js request proxy (auth)
drizzle/        SQL migration
scripts/        db-reset, db-check (+ db-smoke.sql)
docs/           see docs/README.md
```
## Catalogue

- **Categories:** Mattresses, Cots, Sofas. The shop shows Cots as "Beds".
- Every price is in `product_variants` (and `addon_prices`). Nothing is priced in code.
- **Mattresses:** product = brand + model. Variants = size x thickness.
- **Cots:** product = range (8, one per range on the two client sheets). Variants = size (75 and 78 in) x wood finish. Each product's quality is its range, which holds the warranty, the construction and the add-on prices (Affordable sheet or All Categories sheet). Add-ons are category-wide.
- **Sofas:** product = range (12, one per row of the client sheet). Variants = model (3+1+1 / 3+2, 3-Seater, Bed + Lounger…). Each product's quality is its range; its add-ons and recliners belong to the product (fixed or per seat). Sofa pages title the size "Model", show the seat count and the notes from the client's sofa sheet.
- **Product page:** `lib/variant-picker.ts` picks one variant from quality, size, thickness and colour. A choice the current quality does not have is shown disabled.
- **Order:** products show in `products.sort_order` order (shop "Recommended" and the admin default). The seed numbers each category by lowest price, cheapest first; staff can change it per product.
- **Product cards** have no "add to cart" button: cots and sofas need choices first, so adding happens on the product page.
- **Category filters** live in the URL (`lib/product-filter-params.ts`) and run in the browser over the category's cards.
- **Customer activity** (views, shortlist, call / WhatsApp / visit / callback taps, logins) is saved as lead events for staff.

## Database

- 24 tables, no prefix, schema in `src/db/schema/`, one migration `drizzle/0000_init.sql`. Full design: [refactor/database.md](./refactor/database.md).
- Seed: `src/db/seed/` (client price lists + dummy people, orders, leads, media).
- Public shop reads are cached (`"use cache"` + `tagShopCache()`); cart, shortlist and orders are read per request.
- The DB holds seed data only. There are no real customers or orders.

## Admin

- Every list: page header, toolbar (search + filters in the URL), table, pagination (20 per page). Shared pieces are in `components/admin/common/`.
- Every change goes through a server action: Zod check, `requireStaff()`, service, then refresh. The browser runs it with `useActionToast` (loading, then success or error toast); field errors show under the field.
- Deletes and other hard-to-undo actions ask first (`ConfirmationModal`).
- Order prices are worked out on the server (`lib/order-lines.ts`, same add-on rules as the cart). Order status history is written by a database trigger.
- Full screen list and rules: [refactor/admin-ux.md](./refactor/admin-ux.md) and [refactor/edge-cases.md](./refactor/edge-cases.md).

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
