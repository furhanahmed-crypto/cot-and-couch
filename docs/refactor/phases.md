# Phases

## How every phase ends

1. `bun run lint`, `bun run test`, `bun run build` pass.
2. I check the phase's screens in the built-in browser.
3. I stop and give you: what changed, the checklist below, and a suggested commit message.
4. You test in Chrome (Claude extension, `localhost:3000`) and commit to `main` yourself.
5. You say **proceed** → next phase. Nothing starts before that.

The app is not live, so admin screens may show "Being rebuilt" between Phase 3 and the phase that rebuilds them.

---

## Phase 0 — Plan (this folder)
- Write `docs/refactor/*`.
- **Check:** you read and agree.

## Phase 1 — Clean-up and foundations (old DB still in use)
- Delete dead files, dead types, `DEMO` credentials, 8 redirect-stub routes, `package-lock.json`.
- Remove `db:push` script.
- Add `zod` and `vitest`; add `test` script.
- Add shared pieces: `types/action.ts`, `lib/action-result.ts`, `lib/money.ts`, `lib/format.ts`, `hooks/use-action-toast.ts`, `constants/categories.ts` (replace 36 magic slugs).
- Unit tests for money and format helpers.
- **Check:** build passes; shop and admin behave exactly as before.

## Phase 2 — New database
- TS schema in `src/db/schema/` (24 tables, [database.md](./database.md)).
- `drizzle/0000_init.sql` in commented sections with indexes, RLS, triggers. Old migrations deleted.
- Scripts: `db:reset`, `db:migrate`, `db:seed`, `db:check`.
- Seed from the client price lists + dummy data.
- **Check:** `db:check` passes; row counts match the price lists (e.g. cot variants = sizes × qualities × colours per style); `drizzle-kit generate` reports no changes.

## Phase 3 — Shop on the new database
- Services: `catalogue`, `pricing`, `shortlist`, `cart`, `orders` (customer read), `leads` (event tracking), `settings`, `media`.
- Rewrite DTOs in `types/` to real fields only. Delete `bed-pricing.ts` runtime use, `catalogue-map.ts` fakes, old schema files.
- Rename wishlist / favourites → shortlist everywhere.
- Old admin pages replaced by a "Being rebuilt" placeholder.
- **Check (browser):** home, catalogue, category, product page (mattress, cot quality switch, 78-inch sizes, add-ons), search, collections, shortlist, cart (add, change qty, remove, custom size), my orders. Prices match the PDFs.
- **Done as:** old schema, `data/`, old services, all admin code, `constants/bed-*`, `catalogue-utils` deleted. Search is a server page (`?q=`). Category filters are in the URL. Pure logic in `lib/` (pricing, variant picker, filters) has unit tests. The 11 old lint errors are gone with the rewritten files.

## Phase 4 — Admin foundation + Dashboard
- New shell and navigation ([admin-ux.md §5](./admin-ux.md#5-navigation)), `requireStaff`.
- All shared components in `components/admin/common/`.
- Dashboard screen.
- **Check:** sidebar on desktop and mobile, role-based nav, dashboard numbers match DB, range switch, loading and empty states.
- **Done as:** nav in `constants/admin-nav.ts` (tested); `requireStaff` / `requireAdminPage`; shared components in `components/admin/common/`; dashboard in `services/dashboard/queries.ts`. Screens of Phases 5–7 show "Being rebuilt" through a temporary catch-all route.

## Phase 5 — Admin catalogue
- Products list + editor (all 5 tabs), Categories (Details, Qualities, Brands, Add-ons price grid), Colours, Collections.
- **Check:** create / edit / publish / archive a product in each category; add variants singly and with "Add many"; duplicate variant blocked; delete-in-use blocked; every action toasts; every destructive action confirms; shop reflects changes.
- **Done as:** validation in `validation/{common,catalogue,products}.ts` (tested); services in `services/{colours,collections,categories,addons,products}/`; the add-on tab and price grid are shared by categories (cots) and products (sofas). Every rule above was run against the seeded DB.

## Phase 6 — Admin sales
- Orders list, detail, new order. Leads list + side sheet.
- **Check:** create an order with add-ons and a custom size; totals; status change writes history; advance > subtotal rejected; lead filters, edit, delete.

## Phase 7 — Admin content and settings
- Media (Gallery, Reels), Store settings, Team.
- **Check:** publish / reorder media and see it in the shop; edit store info; role change with confirm; last-admin and self-change blocked.

## Phase 8 — Sofas in the shop
- Sofa PDP: size + quality switch, recliners and additional options (fixed and per-seat), seed images.
- **Check:** every sofa price and option matches `docs/pricelist/sofa-pricelist.pdf`.

## Phase 9 — Final pass
- Update `docs/ARCHITECTURE.md` to the new design; remove anything left from the old model.
- Every file ≤ 120 lines; no unused exports.
- Full regression run of all checklists above.
