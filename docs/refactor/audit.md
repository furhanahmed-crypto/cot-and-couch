# Audit (verified, Nov 2026)

Why we refactor. Checked against the code on `main` (commit `1064176`). Each line was confirmed in the code.

## Data layer

| Problem | Where |
|---|---|
| Prices live in code **and** DB. PLP "from" price always uses the code sheet; cart and PDP fall back to it when a cot variant has no range | `lib/catalogue-utils.ts:37-60`, `services/cart-queries.ts:156-160`, `components/shop/pdp-main.tsx:217-221` |
| Admin add-on prices never reach customers (code prices win for the 9 cot add-ons) | `services/cart-mutations.ts:46-48` |
| Prices looked up by range **slug**: renaming a range breaks prices | `bedRangeAddonTier(range.slug)` |
| Product DTO is half fake: every product shows 78x60x6 in, same delivery/care text, warranty fallback 5 / 2 years, `popularity = 100 - sortOrder`, fake mattress sub-categories, `"royal-range"` collection fallback | `services/catalogue-map.ts:39-41, 149, 200-251` |
| Sofas get a placeholder price ₹39,999 / ₹34,999, stock 2 | `app/admin/catalogue/product-actions.ts:449-477` |
| Each category adds its own columns (`mattress_brand_id`, `bed_range_id`, `cot_type`, `width_option_id`, `thickness_option_id`…) | `src/db/schema-coc-catalogue.ts` |
| Same fact in several places (`bed_range_id` on product + junction table + variant + cart line; `cot_type` in 4 places) | schema + constants |
| Order lines keep only ids and prices: no name, SKU, size, range | `coc_order_lines` |
| No transactions: saving a product is ~20 separate queries | no `db.batch` / `transaction` in `src/` |
| 51 indexes exist only in SQL, 0 in the TS schema; journal skips 0006 and 0007; `db:push --force` script | `drizzle/`, `package.json` |
| No unique rule on variant combinations | only `sku` is unique |

## Cot prices in code vs client sheets

Discounted prices for Ideal, Optimum, Essential, Premium and Royal match. These do not:

- MRPs for Ideal, Optimum and Cushion Range are too low in code.
- Code "Prime Range" is really the sheet's **Cushion Range**. The real **Prime Range** and the **Cushion Back Range** are missing.
- Code invents Single MRPs, Royal Jodi/Single prices, and Range 7 / Range 8.

## Code structure

- Drizzle queries inside 7 admin action files and `admin/team/page.tsx`. The shop cart (page → action → service) is the pattern to copy.
- Oversized files: `admin-category-templates.tsx` 936 lines, `brands-manager.tsx` 696, `services/catalogue.ts` 601, `pdp-main.tsx` 584, `admin-products-table.tsx` 569. 56 files are over 120 lines.
- One feature, three names: shortlist (UI) / wishlist (store) / favourites (DB).
- `"cots"` / `"mattresses"` hardcoded 36 times in 15 files.
- Dead: `types/catalogue.ts`, `services/session.ts`, `components/admin/mock-banner.tsx`, 6 unused types, `DEMO` credentials in `constants/brand.ts`, 8 redirect-stub admin routes, seed-only table `coc_category_option_groups`.
- Two lockfiles (`bun.lock`, `package-lock.json`). Schema comments point to a missing `docs/plan.md`.

## Admin UI

- "Mattress brands" page manages 4 unrelated things: colours, brands, collections, sizes.
- Categories page mixes mattress brands, cot ranges and widths in one 936-line screen.
- Mattress brands editable from two pages.
- Product editor changes layout per category; variants are a large range-tabbed grid.
- No answer to "where do I manage X?"
