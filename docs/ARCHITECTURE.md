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
| Client state | Zustand (`src/stores/`) for cart and shortlist |

## Folders

```
src/
  app/          (shop) pages, (auth) login/register, admin/ staff console
  components/   ui/ (shadcn), shop/, admin/, shared/
  services/     DB reads and writes
  constants/    routes, nav, category and cot config, cot price sheet
  data/         seed input (mattress brands, models, demo prices)
  db/           schema/ (new tables), seed/ (seed script + data), old coc_* schema until Phase 3
  stores/       Zustand stores
  hooks/  lib/  types/
  proxy.ts      Next.js request proxy (auth)
drizzle/        SQL migrations
docs/           see docs/README.md
```

## Catalogue today

- **Live categories:** Mattresses, Cots. The shop shows Cots as "Beds".
- **Mattresses:** product belongs to a brand. Variants = size x thickness.
- **Cots:** product belongs to a range (Ideal, Optimum, …). Variants = width x colour x range.
- **Sofas:** not built yet.
- Cot prices are read from `src/constants/bed-pricing.ts` in some places, and from the DB in others. This is being fixed (refactor Phase 3).

## Database

- New design: 24 tables, no prefix, schema in `src/db/schema/`, one migration `drizzle/0000_init.sql`. Full design: [refactor/database.md](./refactor/database.md).
- Seed: `src/db/seed/` (client price lists + dummy people, orders, leads, media).
- **Until refactor Phase 3**, the app code still reads the old `coc_*` schema files (`src/db/schema-coc*.ts`, `src/db/app-schema.ts`), whose tables no longer exist. Pages that read the DB fail and `bun run build` fails until Phase 3.
- The DB holds seed data only. There are no real customers or orders.

## Auth and roles

- One login page, `/login`, for customers and staff.
- `profiles.role` is `admin`, `team` or `customer`.
- `/admin` checks the role on the server (`getStaffProfile()`) and redirects everyone else to `/`.
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
