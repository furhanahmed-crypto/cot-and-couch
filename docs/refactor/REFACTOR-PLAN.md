# Cot & Couch Refactor Plan (Nov 2026)

Source of truth: client files in `docs/client/`. Clean versions in `docs/pricelist/`.
Goal: simplest possible code and DB that a beginner can read, with every edge case handled.
A slightly slower DB is acceptable. Theme, colours and typography stay as they are.

---

## Part 1. Fact-check of the Cursor audit

Checked against the code on `main` (commit `1064176`). The live DB was not queried: `.env.local` values are empty.

### Confirmed true

| Claim | Evidence |
|---|---|
| 209 TS/TSX files, 56 over 120 lines | `find src` count |
| Cart and PDP fall back to the code price sheet | `services/cart-queries.ts:156-160`, `components/shop/pdp-main.tsx:217-221` |
| Shop "from" price always comes from the code sheet | `lib/catalogue-utils.ts:37-60` (`BED_RANGE_PRICING`) |
| Admin add-on prices are ignored for the 9 cot add-ons | `services/cart-mutations.ts:46-48` uses `bedAddonPrice(tier, key)`; DB price only for unknown keys |
| Prices looked up by range slug | `bedRangeAddonTier(range.slug)`, `bedSheetPricesForWidth(meta.slug, …)` |
| Product DTO has fake values | `services/catalogue-map.ts:207-251`: dimensions 78x60x6, warranty fallback 5 / 2 years, delivery "2–12 days within Hyderabad", care text, `popularity: 100 - sortOrder`, `subCategoryId: "sc-queen"` |
| Fake mattress sub-categories | `catalogue-map.ts:39-41` (Orthopaedic / Foam / Spring) |
| Collection fallback is the string `"royal-range"` | `catalogue-map.ts:149` |
| Sofas get a placeholder price | `app/admin/catalogue/product-actions.ts:449-477`: ₹39,999 / ₹34,999, stock 2 |
| Same fact in several places | `products.bed_range_id` + `coc_product_bed_ranges`; `cart_lines.bed_range_id` + `variant.bed_range_id`; `cot_type` on products, ranges and 2 constants |
| Order lines keep no snapshot | `coc_order_lines` has only ids, qty, unit price, total. Add-on lines do keep label + price. |
| No transactions anywhere | no `transaction(` or `db.batch` in `src/` |
| 51 indexes only in SQL, 0 in TS schema | `drizzle/*.sql` vs `src/db/*.ts` |
| Journal skips 0006 and 0007 | `drizzle/meta/_journal.json`; no snapshot files |
| `db:push --force` script | `package.json` |
| No unique rule on variant combinations | only `sku` is unique |
| Dead files | `types/catalogue.ts`, `services/session.ts`, `components/admin/mock-banner.tsx`: 0 importers |
| Dead types | `AuditLog`, `Segment`, `StaffUser`, `AttributeTemplate`: 0 uses. `CustomerSession`, `StaffSession`: used only by dead `services/session.ts` |
| Seed-only table | `coc_category_option_groups`: used only in seed files and schema |
| 8 redirect-stub admin routes | `attributes, audit, masters, pricing, sales, segments, stock, users` |
| Drizzle inside admin server actions | 7 files under `app/admin/*/actions.ts` |
| Mattress brands editable in 2 places | `brands/actions.ts:113-150` and `categories/actions.ts:31-104` |
| "Mattress brands" page manages 4 things | `brands/actions.ts`: colours, brands, collections, sizes |
| `admin/team/page.tsx` queries DB directly | imports `db` at line 12 |
| Magic slugs | `"cots"` / `"mattresses"` appear 36 times in 15 files |
| Docs drift | `docs/RULES.md` lines 34, 53: PascalCase filenames, `utils/` |
| Oversized files | sizes match within a few lines |

### Needs correction or nuance

- **Cart/PDP fallback is narrower than stated.** It only triggers when a cot variant has no `bed_range_id`. The PLP "from" price, however, always uses the code sheet.
- **`services/ops.ts`** reads store settings, collections, gallery, reels, and also imports leads and orders. Claim holds.
- **Warranty also appears as a hardcoded fallback** in `catalogue-map.ts:200-205` (5 years mattresses, 2 years otherwise). This is separate from the cot sheet values in `bed-pricing.ts`.
- **Admin UI scores** are opinion. They were not tested by using the admin.

### Not verifiable here

- Live DB state (row counts, real orders, real customers).

**Verdict:** the audit is accurate. Its recommended order of work is sound.

### Cot prices in code vs the client sheets

Compared `src/constants/bed-pricing.ts` with the two cot sheet photos in `docs/client/`. Discounted prices for Ideal, Optimum, Essential, Premium and Royal match. These do not:

| Problem in code | Client sheet says |
|---|---|
| MRPs for Ideal, Optimum and code "Prime" are too low (e.g. Ideal King 22,800) | Ideal King 26,800, Queen 24,800, Double 22,800, Jodi 27,800. Optimum and Cushion also higher. |
| Code "Prime Range" has the Cushion Range prices and features | Affordable sheet calls it **Cushion Range** (4 years) |
| The real **Prime Range** is missing | All Categories sheet: Teakwood body, 5 years, King 27,800 (MRP 33,800) … Single 14,800 |
| **Cushion Back Range** is missing | King 37,800, Queen 35,800, Double 31,800, plus "Premium 2,800 / Royal 6,800 / Heavy cushion 6,800 extra" (meaning to confirm) |
| Single MRPs for every range | Sheets give no Single MRP, only the discounted price |
| Royal Singles-Jodi and Single prices | Royal has no Jodi or Single on the sheet |
| Range 7 and Range 8 | Not on any sheet |
| "Prime" uses the Affordable add-on prices | Real Prime is on the All Categories sheet, so it uses those add-on prices |

Fix: seed cots from `docs/pricelist/cot-pricelist` (built from the photos), not from `bed-pricing.ts`.

Other leftovers found while cleaning docs:
- `src/constants/brand.ts` holds a hardcoded demo admin password (`DEMO`), used only by the dead `services/session.ts`.
- Schema files reference `docs/plan.md`, which does not exist.
- The repo has both `bun.lock` and `package-lock.json`.

---

## Part 2. Design decisions (recommended)

### D1. Pricing lives in the DB only
Code constants (`bed-pricing.ts`, `seed-data.ts` prices) become seed input only. Runtime code never reads them.

### D2. One simple variant table for all categories
No generic option-join tables. Every variant is one flat row:

| Column | Mattress | Cot | Sofa |
|---|---|---|---|
| `size_label` | Single, Queen | Single, King, King 78 in | 3+1+1 / 3+2, 3-Seater |
| `length_in`, `width_in` | yes | yes | null |
| `thickness_in` | 6, 8 | null | null |
| `quality_id` (FK) | null | Ideal … Royal | Affordable, Premium |
| `colour` (text) | null | Teak, Walnut… | null or fabric |
| `mrp`, `price`, `stock_qty`, `is_active` | yes | yes | yes |

Unique constraint on `(product_id, size_label, thickness_in, quality_id, colour)`.
A sofa does not need new columns. A new category later also does not.

### D3. One "groups" idea, two tables with plain names
- `brands`: mattress brands (Wake Fit, Sleepwell…). Product belongs to one brand.
- `qualities`: per category. Cots: Ideal, Optimum, Cushion, Essential, Prime, Premium, Royal, Cushion Back (names from the client sheets). Sofas: Affordable, Premium. Holds facts that belong to the quality: `warranty_years`, `features`, `cot_type`.

### D4. Add-ons priced per quality in the DB
`addons` (category_id, optional product_id, name, kind, price_unit, size rule, cushion rule)
+ `addon_prices` (addon_id, quality_id, price).

- `kind`: `addon` or `recliner` (sofa sheet shows recliners in their own column).
- `price_unit`: `fixed` or `per_seat` (Luxury High Back recliners are ₹9,000 per seat).
- Cots: add-ons are category-wide (`product_id` null), priced per quality (Ideal … Royal). The "Affordable / Standard" grades become plain price rows.
- Sofas: add-ons belong to one product (`product_id` set), because the same add-on costs different amounts per sofa range (Add bed ₹14,500 on Classic, ₹16,500 on Luxury High Back).

### D5. Product specs as plain key/value rows
`product_specs` (product_id, label, value), e.g. "Comfort: Firm", "Warranty: 5 years".
Only real values are shown. No hardcoded fallbacks in the DTO.

### D6. Orders store a full snapshot
`order_items`: product name, SKU, size label, quality name, colour, custom L x W, unit price, MRP.
An order still reads correctly after a product is edited or deleted.

### D7. One name per feature
Pick **Shortlist** (the word the shop UI shows). Rename store, service and table.

---

## Part 3. Target tables (about 18, down from ~29)

```
profiles, store_settings
categories, brands, qualities
products, product_specs, product_images?, product_collections, collections
product_variants
addons, addon_prices
cart_items, cart_item_addons
orders, order_items, order_item_addons, order_status_history
leads, lead_events
media            (gallery + reels in one table, with a `type` column)
shortlist_items
```

Dropped: `option_groups`, `options`, `category_option_groups`, `brand_option_links`, `size_dimensions`,
`product_option_values`, `product_options`, `product_bed_ranges`, `mattress_brands` (→ `brands`),
`bed_ranges` (→ `qualities`), `category_addons` (→ `addons`), `gallery_items` + `reels` (→ `media`).

Table names drop the `coc_` prefix only if we reset the DB (see Q1).

---

## Part 4. Phases

Each phase ends with: `bun run build` passes, lint passes, tests for that phase pass, manual check in the browser.

### Phase 0. Safety net (small)
- Snapshot or branch the Neon DB before anything.
- Add Vitest. Write tests for current price logic so we can prove prices stay the same.
- Remove `--force` from `db:push`.
- Delete dead files, dead types, the `DEMO` credentials constant and the 8 redirect stubs.
- Keep one lockfile (Bun).

### Phase 1. New schema + migration
- Write the new TS schema (Part 3), with every index declared in TS.
- Generate the migration with `drizzle-kit generate`. Fix the journal.
- Seed script loads the client prices (sofa and cot price lists) into the DB.
- The DB holds no real customers or orders, so we drop everything and reseed. No data-copy script.

### Phase 2. Services layer (shop read path)
- One service per area: `products`, `pricing`, `cart`, `orders`, `shortlist`, `leads`, `media`, `settings`.
- Shop reads prices only from the DB. Remove every runtime import of `bed-pricing.ts`.
- Trim the Product type to real fields.
- Replace magic slugs with constants: `CATEGORY.cots`, `CATEGORY.mattresses`, `CATEGORY.sofas`.

### Phase 3. Cart + checkout correctness
- Cart stores only `variant_id`, `quantity`, custom size, add-on ids.
- Price is recalculated from the DB on every cart read. Snapshot taken at order time.
- Multi-step writes use `db.batch` so they are all-or-nothing.

### Phase 4. Admin services
- Move all Drizzle code from `app/admin/**/actions.ts` into `services/admin-*.ts`.
- Actions become thin: check staff, validate input, call service, revalidate.
- Input validation with Zod at every action.

### Phase 5. Admin UI revamp
- **Products:** list (filters: category, status, brand/quality, search) → editor with the same tabs for every category: Basics · Specs · Variants & prices · Media.
- **Categories:** list → detail with tabs: Sizes · Qualities · Brands (mattresses only) · Add-ons & prices.
- **Colours, Collections, Media, Orders, Leads, Settings, Team:** one small page each.
- Plain words only: "Quality", "Size", "Add-on". No "masters", "option groups", "allowlist".
- Files ≤ 120 lines.

### Phase 6. Sofas
- Seed sofa qualities, products, variants, recliners and additional options from `docs/pricelist/sofa-pricelist`.
- Shop PDP: size + quality switch + add-ons. Reuses cot/mattress components.

### Phase 7. Clean-up
- Update `docs/ARCHITECTURE.md` with the new tables and remove the "Catalogue today" section.
- (`docs/RULES.md` was already rewritten to match the repo on 2026-11-27.)

---

## Part 5. Edge cases to handle

**Prices**
- Price changed after an item was added to the cart: cart shows the new price; order snapshots the price at checkout.
- MRP lower than price, zero or negative price: rejected by validation and a DB `CHECK`.
- Quality renamed: nothing breaks, because everything uses ids, never slugs.

**Variants**
- Duplicate variant (same size, thickness, quality, colour): blocked by the unique constraint, with a clear admin error.
- Variant made inactive or deleted while in a cart: the cart line shows "No longer available" and checkout blocks it.
- PDP quality switch where one quality has no variant for the chosen size: that option shows as unavailable.
- 78-inch length only for Double, Queen and King cots.

**Add-ons**
- Add-on not valid for the size (e.g. King storage on a Queen cot): hidden in the shop and rejected on the server.
- Cushion add-ons on cushion cots: hidden and rejected.
- Add-on with no price for a quality: not offered for that quality.

**Custom sizes**
- Length and width must be whole inches within set limits. Validated on client and server.

**Orders**
- Product or variant deleted after an order: the order still shows the full snapshot.
- Stock: decrement inside the same batch as the order insert; block if stock would go below 0.

**Admin writes**
- Half-saved product: prevented with `db.batch`.
- Two staff editing the same product: last save wins, with `updated_at` shown in the editor.
- Slug collision on create: auto-suffix (`-2`) and show it.

**Migration**
- DB is seed data only: drop and reseed. Take a Neon snapshot first anyway.

---

## Part 6. Open questions

1. ~~Real customers or orders in the DB?~~ **No.** Reset and reseed.
2. **Sofa range name** for the first rows ("Classic Sofa" is a placeholder).
3. **Range 7 and Range 8 cots**: not on any client sheet. Remove?
4. **Cushion Back Range**: what do "Premium 2,800 / Royal 6,800 / Heavy cushion 6,800 extra" mean?
5. **Mattress prices**: wait for the client sheet, or launch with the demo prices?
6. **Shortlist** as the single feature name: OK?
