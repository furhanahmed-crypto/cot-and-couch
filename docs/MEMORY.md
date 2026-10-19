# Decisions log (Phase 1)

Chronological-ish record of **why** the prototype is shaped this way. Update when making material scope or architecture choices.

---

## 2025 — Phase 1 kickoff

### Frontend-only Phase 1

**Decision:** Ship Digital Window as a **Next.js frontend prototype** with mock data and client services — no database, no API, no cart/checkout.

**Rationale:** Validate showroom-led UX, admin IA, and visual brand before backend cost. Stakeholders can demo full flows in the browser.

**Implication:** Data resets on reload for in-memory admin edits unless explicitly persisted; document this in demos.

---

### Mock customer OTP

**Decision:** Customer login accepts any valid **10-digit mobile** and any **6-digit OTP** (no SMS).

**Rationale:** No OTP provider or DPDP consent flow in Phase 1.

**Implication:** `SECURITY.md` applies; never present this as secure auth. README may cite `123456` as the demo code for walkthroughs.

---

### Admin vs Team = UI-only RBAC

**Decision:** **Team** and **Admin** roles differ by **visible nav and actions only** (client state), not server enforcement.

**Rationale:** Demonstrate future permission matrix for store staff vs head office without building auth infrastructure.

**Implication:** Do not claim role security in sales materials; label as “prototype behaviour”.

---

### Unsplash for product imagery

**Decision:** Mock catalogue uses **Unsplash** (or similar) URLs for furniture/interior photography.

**Rationale:** No licensed SKU photography pipeline yet; need credible visuals quickly.

**Implication:** Configure Next.js `images.remotePatterns` when using `next/image`; replace with owned assets in production.

---

### In-memory admin catalogue edits

**Decision:** Admin product/category/collection CRUD mutates **in-memory** copies of seed data for the SPA session.

**Rationale:** Simplest credible demo of AD-03–AD-05 without persistence layer.

**Implication:** Hard refresh restores seed JSON; optional future: `localStorage` snapshot flag (off by default to avoid stale demos).

---

### Showroom-first CTAs (no cart)

**Decision:** Primary actions are **Enquire**, **WhatsApp**, and **Visit showroom** — aligned with PRD out-of-scope for cart/checkout/payments.

**Rationale:** Matches Cot & Couch business model for Phase 1 Digital Window PDF intent.

---

### Design direction: ink teal + limestone + brass

**Decision:** Premium palette and Fraunces/Figtree pairing; reject purple gradients and cream/terracotta cliché as primary UI.

**Rationale:** Differentiate from generic D2C furniture templates; see `DESIGN.md`.

**Status:** Tokens specified in docs; root layout may still use Geist until brand fonts land — track in `TASKS.md`.

---

### shadcn Select over native `<select>`

**Decision:** All dropdowns use shadcn `Select` for consistent a11y and styling.

**Rationale:** Native selects clash with brand on mobile; documented in `RULES.md`.

---

### Documentation as source of scope truth

**Decision:** Keep `docs/PRD.md`, `ARCHITECTURE.md`, and `TASKS.md` updated when adding routes or features.

**Rationale:** Prevent accidental backend or commerce scope creep.

---

---

## 2026-10-16 — Neon Auth + profiles (backend phase)

### Auth approach (agreed)

**Decision:**

1. **Neon Auth** for sessions now — **email** (password and/or magic link) for **Admin / Team** immediately.
2. App **`profiles`** table keyed by `auth_user_id` (not by email). Fields include `email`, nullable `phone`, `role` (`admin` | `team` | `customer`), consents.
3. Authorize everywhere by **`profile.id` + `role`** in **server code**; UI role badges are not enough.
4. **Customer phone OTP** = next phase: design tables for phone-first leads now; do **not** implement SMS OTP yet.
5. Stop using **`localStorage` for auth sessions** once Neon Auth is wired (shortlist/theme may still use client storage until migrated).

**Rationale:** Real staff auth without locking customer identity to email; phone OTP can link to the same `profile` later.

**Implication:** Update `ARCHITECTURE.md`, `SECURITY.md`, `PRD.md`, and `TASKS.md` as Neon + Postgres land. Mattress filters stay in catalogue tables only.

---

## 2026-10-16 — Neon Auth wired (email only)

**Done:**

- `@neondatabase/auth` + Drizzle + `profiles` table (phone/OTP columns present, unused).
- Custom `/login` + `/register` (email/password server actions).
- `/admin/login` uses same Neon Auth; requires `profiles.role` in (`admin`,`team`).
- Route protection via `src/proxy.ts` (Next.js 16).
- App authorize by `profile.id` + `role` helpers in `src/lib/auth/profile.ts` / `src/services/profile.ts`.

**Not done yet:** SMS OTP provider, RLS policies.

---

## 2026-10-16 — Shop catalogue + favourites from Neon

**Done:**

- Shop + admin catalogue reads from Neon (`products`, variants, options, mattress_brands, categories).
- `profile_favourites` table; shortlist is DB-backed (login required).
- Admin products / categories / pricing / stock write selected fields to DB.

**Also done (ops pass):** `collections`, `product_collections`, `store_settings`, `gallery_items`, `reels`, `leads`, `orders`, `order_status_history`, `audit_logs`, `segments` — seeded + shop/admin reads + CRUD on masters/attributes/categories/products/gallery/reels/leads/settings.

**PDF alignment (2026-10-16):** Colour master seed = teak / walnut / honey / natural (PDF wood finishes). Collections = Royal Range + Victoria only (Everyday Comfort / Work Studio removed). Admin nav = AD-01–AD-13 (Segments under Leads).

---

## 2026-10-16 — PLP filters: no duplicate colour

**Bug:** Cots (and sofas/tables) showed **Colour / finish** twice — once from `FilterPanel` common colour master, once from `attributeTemplates` extra fields.

**Fix:** Remove colour from category attribute templates; `FilterPanel` skips any extra field whose key/label is colour/finish/collection/availability/price/discount. Sticky filter column scrolls independently (`max-h` + `overflow-y-auto`); no nested colour scrollbar.

---

## 2026-10-16 — Favourites: one fetch per layout

**Bug:** Each `ProductCard` + header called `getFavouriteIdsAction` on mount → dozens of POSTs and long “Rendering…” on PLP.

**Fix:** Shop layout loads favourite IDs once server-side; `ShortlistProvider` shares them. `useShortlist` is context-only (no per-card server action).

---

## 2026-10-16 — PDP variants: Wakefit-style axes

**Bug:** Sparse seed tied each colour to a different size/price; PDP filtered size by colour → switching colour jumped SKU and price.

**Fix:** Seed full size × dimension × thickness × colour matrix; price = size + thickness only. PDP pickers are independent chips (size → dimension → thickness → colour); colour never resets other axes.

---

## 2026-10-16 — Catalogue RSC too slow (~5s+)

**Cause:** PLP loaded every product with the full variant matrix (~14k SKUs) into the client RSC payload.

**Fix:** `list` mode = `DISTINCT ON (product_id, colour_option_id)` cheapest SKU per colour; category pages load that category only. `full` mode only for PDP + admin.

**Follow-up (still slow after deploy):** Network showed product `_rsc` prefetches (Link default) each loading full mattress SKUs; layout also blocked on auth+favourites every nav.

**Fix 2:** `prefetch={false}` on product cards; favourites load once client-side (layout only fetches categories); dedupe variant images in RSC payload; `cache()` on `getCurrentProfile`.

---

## 2026-10-16 — Catalogue DTOs (mattress-first)

**Decision:** Shared filter tables + lean products/variants (not one table per filter).

| Table | Role |
|-------|------|
| `categories` | mattresses, cots, sofas, computer-tables |
| `mattress_brands` | 6 mattress brands; null `mattress_brand_id` = house-made |
| `option_groups` + `options` | Admin-editable filters (purpose, size, thickness, …) |
| `size_dimensions` | Inch presets under Single/Diwan/Queen/King |
| `products` | Model + purpose/cover/filling/comfort |
| `product_variants` | SKU = size + dimension/custom + thickness + colour + price |

**Seed:** `npm run db:seed` — 6 mattress brands × 5 models + house-made cots/sofas/tables, options + dimensions, sample variants.

**Images:** `public/images/{category}/` and `public/images/mattresses/{brand-slug}/{model}.jpg`. Shared seed data: `src/data/catalogue/seed-data.ts` (DB + mock).

---

## 2026-10-19 — Cart (DB) + custom size L×W

**Decision:** Enquiry-first shop now has a **saved cart** (no checkout). Table `carts` stores one line per profile + variant + optional custom inches.

**Custom size:** On PDP, Custom size group shows Length/Width inputs (shadcn). Values persist on the cart line.

**Badge:** Header cart badge = **distinct line count**, not quantity sum.

---

## 2026-10-19 — Zustand for cart + wishlist client state

**Decision:** Replace React Context providers (`CartProvider`, `ShortlistProvider`) with Zustand stores:

| Store | File | DB source of truth |
|-------|------|--------------------|
| Cart | `src/stores/cart-store.ts` | `carts` |
| Wishlist | `src/stores/wishlist-store.ts` | `profile_favourites` (UI still “shortlist”) |

**Boot:** `ShopStoresBoot` in shop layout calls `load()` once. Hooks `useCart` / `useShortlist` read stores. Server actions still mutate Neon; stores refresh after mutations.

**Rationale:** Same pattern for cart and wishlist; no Context nesting; badge/cards/PDP share one client snapshot without per-card DB spam.

---

## 2026-10-19 — ConfirmationModal for destructive actions

**Decision:** Reusable `ConfirmationModal` (`src/components/ui/confirmation-modal.tsx`) wraps shadcn `Dialog`. Use it for careful destructive actions (remove cart line, clear cart, and similar). Controlled via `open` / `onOpenChange`; supports `pending` and destructive confirm styling.

---

## 2026-10-19 — Admin console rebuild strategy

**Sources:** Figma [Admin Console UI](https://www.figma.com/design/JzSUIqiH2lQ0Ev85iv2P2y/Cot---Couch-%E2%80%94-Admin-Console-UI) (sidebar/nav/chrome) + Downloads HTML “Product editor by category” (field lists, variants, publish checklist).

**Client need:** Credible admin demo now; full DTO/schema finalization can follow.

**Primary path (build first):** Complete phased admin — real Neon CRUD, category-aware product editor per HTML, Figma shell. Images stay **read-only placeholders** (no upload/edit) until a later media phase.

**Fallback (if primary fails):** Revert code + DB migrations; keep UI from Figma/HTML; fetch products from DB into Zustand; demo create/edit/delete/archive in the store only (no schema expansion). Document as contingency — do not start here.

**Phase order locked:**

1. **Shell** — Figma sidebar, nav groups, admin chrome (match labels/order; keep existing Neon Auth).
2. **Product editor** — HTML category templates (Beds, Mattresses, Sofas, Computer tables, Dining, Wardrobes, TV units); list + create/edit; variants/pricing/stock; media placeholders; draft/publish UX as designed.
3. **Schema** — Extend Neon for category specs + variant axes **category-by-category**, starting with Mattresses (closest to current schema), then Beds/Sofas/… until HTML templates are backed.
4. **Rest of console** — Categories, Attributes, Masters, Pricing, Stock, Gallery, Reels, Sales, Leads, Users, Settings, Audit: align UI to Figma and finish missing CRUD where still mock/read-only.
5. **Hardening** — ConfirmationModal on destructive actions; server-side admin vs team where required; docs/`TASKS.md` sync.

**Out of scope until later:** Product image upload/edit; checkout; customer phone OTP.

---

## Open questions (future)

- Customer gate until phone OTP: temporary Neon Auth email vs light/public browse.
- Checkout / payments remain out of scope until PRD authorizes.
- CRM destination for enquiries (WhatsApp Business API, etc.).
- DPDP consent capture copy and storage region (Neon region choice).

Record answers here when decided.
