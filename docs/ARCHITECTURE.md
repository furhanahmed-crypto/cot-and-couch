# Architecture — Cot & Couch

Next.js App Router storefront + staff admin on Neon Postgres.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind 4, shadcn/ui |
| DB | Neon + Drizzle ORM |
| Auth | Neon Auth → `coc_profiles` |

## Database

| Piece | Location |
|-------|----------|
| Runtime schema | `src/db/app-schema.ts` |
| Tables | `schema-coc*.ts` |
| Migrations | `drizzle/0001` … `0010` |
| Seed | `seed.ts`, `seed-bed-catalogue.ts` |

**Commands:** `db:migrate` · `db:seed` · `db:seed-beds` · `db:studio`

### Catalogue pattern

| Category | Master | Product FK |
|----------|--------|------------|
| Mattresses | `coc_mattress_brands` | `mattress_brand_id` |
| Beds (`cots`) | `coc_bed_ranges` | `bed_range_id` |

Categories admin edits masters. Products admin edits sellable SKUs. Shop filters use fields present on hydrated products/variants.

## App layout

```
src/
├── app/           # shop, auth, admin
├── components/    # ui/, shop/, admin/
├── services/
├── constants/     # routes, bed-model, category-config
├── data/catalogue # seed masters
└── db/
```
