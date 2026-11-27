# Database design

A fresh database. The current DB holds seed data only, so we drop it and start again.
Data comes from [../client/](../client/) via the clean price lists in [../pricelist/](../pricelist/).

## 1. Rules for every table

- Table names: plural snake_case, no prefix (`products`, not `coc_products`).
- Primary key: `id uuid primary key default gen_random_uuid()`.
- Timestamps: `created_at` and `updated_at` (`timestamptz not null default now()`). `updated_at` is set by the shared trigger, never by app code.
- Every foreign key has an explicit `on delete` rule and an index (Postgres does not index FKs automatically).
- Money: `numeric(12,2)` with a `check (… >= 0)`.
- Enum-like columns use Postgres enums built from the `constants/` arrays (one source).
- Catalogue rows that orders may point to are **deactivated** (`is_active = false`), not deleted, once they are in use. Delete is blocked by `on delete restrict` and the UI explains why.
- Row level security is **enabled on every table with no policies**. The app connects as the table owner, which bypasses RLS; any other role (e.g. a future Neon Data API role) is denied by default. Access control lives in services (`requireStaff`).
- Multi-statement writes use `db.batch([...])`, which Neon runs as one transaction.

## 2. Enums

| Enum | Values |
|---|---|
| `user_role` | admin, team, customer |
| `product_status` | draft, published, archived |
| `order_status` | confirmed, in_production, out_for_delivery, delivered, closed, issue |
| `lead_intent` | hot, warm, cold |
| `lead_event_type` | view, shortlist, cta, login |
| `addon_kind` | addon, recliner |
| `price_unit` | fixed, per_seat |
| `media_type` | gallery, reel |

## 3. Tables

### Users and settings
| Table | Columns | Keys and checks |
|---|---|---|
| `profiles` | id, auth_user_id, name, email, phone, address, role, timestamps | `auth_user_id` unique (Neon Auth user id); index `role`. Dummy seed customers get a random auth id |
| `store_settings` | id, name, address, map_url, timings, phone, whatsapp, privacy_notice, updated_at | `id smallint primary key default 1 check (id = 1)`: exactly one row |

### Catalogue
| Table | Columns | Keys and checks |
|---|---|---|
| `categories` | id, name, slug, sort_order, is_active, timestamps | `slug` unique |
| `brands` | id, category_id, name, slug, sort_order, is_active, timestamps | FK category restrict; unique (category_id, slug) |
| `qualities` | id, category_id, name, slug, description, warranty_years, sort_order, is_active, timestamps | FK category restrict; unique (category_id, slug); `warranty_years > 0` or null |
| `colours` | id, name, hex, sort_order, is_active, timestamps | `name` unique; hex matches `^#[0-9A-Fa-f]{6}$` |
| `products` | id, category_id, brand_id, name, slug, description, status, is_featured, sort_order, timestamps | `slug` unique; FK category restrict, brand restrict; index (category_id, status), brand_id |
| `product_images` | id, product_id, url, alt, sort_order, created_at | FK product cascade; index (product_id, sort_order) |
| `product_specs` | id, product_id, label, value, sort_order | FK product cascade; unique (product_id, label) |
| `product_variants` | id, product_id, sku, size_label, length_in, width_in, thickness_in, seats, quality_id, colour_id, mrp, price, is_active, sort_order, timestamps | `sku` unique; FK product cascade, quality restrict, colour restrict; `price > 0`; `mrp is null or mrp >= price`; inches and seats `> 0` when set; **unique nulls not distinct (product_id, size_label, length_in, width_in, thickness_in, quality_id, colour_id)** (its leading product_id also indexes the FK); index quality_id, colour_id |
| `addons` | id, category_id, product_id, name, kind, price_unit, size_label, sort_order, is_active, timestamps | FK category restrict, product cascade; index category_id, product_id. `product_id` null = category-wide (cots); set = one product only (sofas). `size_label` set = only for that size (e.g. King storage) |
| `addon_prices` | addon_id, quality_id, price | PK (addon_id, quality_id); FKs cascade; `price >= 0`. No row = add-on not offered for that quality |
| `collections` | id, name, slug, description, is_featured, sort_order, is_active, timestamps | `slug` unique |
| `product_collections` | product_id, collection_id | PK both; FKs cascade; index collection_id |

How each category fits the same tables:

| | Mattress | Cot | Sofa |
|---|---|---|---|
| product | Brand + model | Range (Ideal Range Cot … Cushion Back Range Cot): one per range on the client sheets | Range (Affordable Sofa … 3-Step Extend Sofa – Premium): one per row of the client sheet |
| `brand_id` | Wake Fit… | null | null |
| variant `size_label` | Single, Queen… | King, Queen, Double, Singles-Jodi, Single | Model column: 3+1+1 / 3+2, 3-Seater… |
| variant `length_in` x `width_in` | 72 x 36… | 75 x 72 and 78 x 72 (two variants), null for Single | null |
| variant `seats` | null | null | 5, 3; null for "3 + lounger" |
| variant `quality_id` | null | the product's own range (one per product; holds warranty, construction and add-on prices) | the product's own range (one per product; holds its add-on prices) |
| variant `thickness_in` | 6, 8 | null | null |
| variant `colour_id` | null | Teak, Walnut… | null |
| add-ons | none | category-wide, priced per quality | per product, priced per quality; recliners are `kind = recliner` |

### Shop
| Table | Columns | Keys and checks |
|---|---|---|
| `shortlist_items` | id, profile_id, product_id, created_at | FKs cascade; unique (profile_id, product_id) |
| `cart_items` | id, profile_id, variant_id, quantity, custom_length_in, custom_width_in, timestamps | FKs cascade; `quantity between 1 and 20`; custom L and W both null or both `> 0`; index profile_id |
| `cart_item_addons` | cart_item_id, addon_id | PK both; FKs cascade |

Cart rows store no prices. Prices are read fresh from the DB on every cart view.

### Orders
| Table | Columns | Keys and checks |
|---|---|---|
| `orders` | id, order_number, profile_id, customer_name, customer_phone, address, status, subtotal, advance_paid, expected_delivery (date), salesperson_id, updated_by_id, delivery_photo_url, notes, timestamps | `order_number` unique, default `'CC-' \|\| lpad(nextval('order_number_seq')::text, 5, '0')`; FKs to profiles set null; `advance_paid <= subtotal`; index status, created_at, profile_id |
| `order_items` | id, order_id, variant_id, product_name, sku, size_label, quality_name, colour_name, custom_length_in, custom_width_in, quantity, unit_mrp, unit_price, line_total, sort_order | FK order cascade, variant set null; `quantity > 0`; index order_id. Name/SKU/size/quality/colour are **snapshots** |
| `order_item_addons` | id, order_item_id, addon_id, name, price_unit, price | FK item cascade, addon set null |
| `order_status_history` | id, order_id, status, note, changed_by_id, changed_at | FK order cascade; index (order_id, changed_at). Filled by trigger |

### CRM and content
| Table | Columns | Keys and checks |
|---|---|---|
| `leads` | id, profile_id, name, phone (nullable), area, intent, assigned_to_id, wants_whatsapp_offers, follow_up_done, first_seen_at, last_seen_at, timestamps | `profile_id` unique (one lead per customer), set null; index intent, assigned_to_id, last_seen_at |
| `lead_events` | id, lead_id, type, product_id, details (jsonb), occurred_at | FK lead cascade, product set null; index (lead_id, occurred_at) |
| `media` | id, type, title, image_url, video_url, instagram_url, product_id, area, delivery_month, tags (text[]), is_published, sort_order, timestamps | FK product set null; `type <> 'reel' or video_url is not null`; index (type, is_published, sort_order) |

24 tables. Removed compared with today: option groups, options, size dimensions, brand-option links, product option values, product options, product-bed-ranges, category option groups, separate gallery and reels tables, stock columns (client sheets have no stock; furniture is made to order).

## 4. Triggers

| Function | Fires | Job |
|---|---|---|
| `set_updated_at()` | `before update` on every table with `updated_at` | `new.updated_at = now()` |
| `log_order_status()` | `after insert` on `orders`, and `after update of status` when status changed | Inserts a row into `order_status_history` with `new.status` and `new.updated_by_id` |

## 5. Migration file

One file: `drizzle/0000_init.sql`. (Drizzle numbers migrations from 0000; the next change becomes 0001.)

How it is made, so the TS schema and SQL never drift:
1. Write the TS schema in `src/db/schema/*.ts` (tables use `.enableRLS()`).
2. `bunx drizzle-kit generate --name init` creates the SQL and the snapshot.
3. Reorder the SQL into the sections below with comments, and append triggers in each section.
4. Run `bunx drizzle-kit generate` again: it must say **no changes**. That is the drift check.

Sections, in order (each: tables + foreign keys → indexes → RLS → triggers, with a comment block on top):
```
-- 0. Extensions, enums, set_updated_at()
-- 1. Users and settings
-- 2. Catalogue
-- 3. Shop
-- 4. Orders (+ order_number_seq, log_order_status())
-- 5. CRM and content
```

Later schema changes: edit `src/db/schema/`, run `bun run db:generate`, review the new `drizzle/0001_*.sql`, run `bun run db:migrate`.

Scripts in `package.json` (all read `.env.local`):

| Script | Does |
|---|---|
| `db:generate` | `drizzle-kit generate` |
| `db:migrate` | `drizzle-kit migrate` |
| `db:reset` | `scripts/db-reset.ts`: drops every app table, sequence, enum and function in `public` plus the `drizzle` schema, then migrates. Keeps `neon_auth` and extension objects (`pg_session_jwt` lives in `public`, so the schema itself is not dropped). Refuses to run without `--yes`. |
| `db:seed` | `src/db/seed/index.ts`: truncates app tables, restarts order numbers, inserts seed data in one batch per area |
| `db:check` | `scripts/db-check.ts` runs `scripts/db-smoke.sql` as one block: 13 bad rows must be rejected, `updated_at` must change, the order trigger must write history (16 checks). It always ends with an error so nothing is saved. |

Gotcha found by `db:check`: a check like `a > 0 and b > 0` passes when `b` is null (`null` is not `false`). Write `b is not null and b > 0` when null must fail.

`db:push` is removed.

## 6. Seed data

Files in `src/db/seed/`, one per area, data in `src/db/seed/data/`. Ids are made in JS (`crypto.randomUUID()`) so related rows go in one batch.

| Data | Source |
|---|---|
| Categories: Mattresses, Cots, Sofas | client |
| Cot qualities, prices, add-ons | `docs/pricelist/cot-pricelist` (from client photos) |
| Sofa ranges, prices, recliners, additional options | `docs/client/sofa-price-list-nov-2026.pdf` (clean copy: `docs/pricelist/sofa-pricelist`) |
| Mattress brands, models, prices | current code (demo, flagged) |
| Colours: Teak, Walnut, Honey, Natural | requirements PDF |
| Staff profiles | Neon Auth users whose email is in `SEED_STAFF_EMAILS` (default `test@cotandcouch.com`) become admin |
| Profiles, orders, leads, media, collections | dummy, clearly fake names (e.g. "Test Customer 1") |

Seeded counts (checked after `db:seed`):

| | Count |
|---|---|
| Cot products / variants | 8 (one per range) / 228 = 4 finishes x 57 size rows (6 ranges x 8, Royal 6, Cushion Back 3) |
| Sofa products / variants | 12 (one per range row) / 15 (every model row of the sofa price list) |
| Mattress variants | 240 = 30 products x 4 sizes x 2 thicknesses |
| Qualities | 20 (8 cot ranges, 12 sofa ranges) |
| Add-ons / prices | 34 / 97 (cot: 12 add-ons, 75 prices = 9 x 8 ranges + 3 Cushion Back extras; sofa: 22 add-ons, 22 prices) |
| Orders | 3 (CC-00001 to CC-00003), 5 history rows written by the trigger |

Not seeded: Range 7, Range 8 (on no client sheet). The Cushion Back "Premium 2,800 / Royal 6,800 / Heavy cushion 6,800" extras are seeded as add-ons offered only on the Cushion Back Range Cot, named as on the sheet; their meaning is still to confirm. 78-inch variants have no MRP (price = base price + the sheet's extra). The sofa "per seat" column is not stored (it is information, not a price anyone pays).
