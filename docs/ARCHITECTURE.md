# Architecture

Showroom website for Cot & Couch: a shop for customers and a staff console at `/admin`.
This page describes the code **as it is today**. Planned changes are in [refactor/REFACTOR-PLAN.md](./refactor/REFACTOR-PLAN.md).

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
  db/           schema files, seed scripts
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
- Cot prices are read from `src/constants/bed-pricing.ts` in some places, and from the DB in others. This is being fixed (refactor plan, Phase 2).

## Database

- Tables are prefixed `coc_`. Schema files: `src/db/schema-coc*.ts`, re-exported with short names from `src/db/app-schema.ts`.
- Migrations: `drizzle/0001` … `0014`.
- The DB holds seed data only. There are no real customers or orders.

## Auth and roles

- One login page, `/login`, for customers and staff.
- `coc_profiles.role` is `admin`, `team` or `customer`.
- `/admin` checks the role on the server (`getStaffProfile()`) and redirects everyone else to `/`.
- Authorise by `profile.id` and `role`, never by comparing email strings.
- Secrets live in `.env.local` (git-ignored). Never commit them.

## Environment variables

`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `NEON_AUTH_JWKS_URL`, `NEON_BRANCH`, `NEXT_PUBLIC_DEV_MODE`.

## Commands

```bash
bun run dev            # dev server
bun run build          # production build
bun run lint
bun run db:migrate     # apply migrations
bun run db:seed        # full catalogue seed
bun run db:seed-beds   # cots only
bun run db:studio      # browse tables
```

## Decisions still in force

- Admin and DB call the category **Cots**; the shop calls it **Beds**.
- Customers can save a cart. There is no online payment.
- Theme, colours and fonts stay as they are ([DESIGN.md](./DESIGN.md)).
