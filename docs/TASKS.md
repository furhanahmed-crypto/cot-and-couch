# Phase 1 task checklist

Legend: `[x]` done · `[ ]` deferred / optional polish

Update this file when completing work (see `RULES.md`).

---

## Foundation

- [x] Next.js App Router scaffold (`src/app`, TypeScript strict)
- [x] Tailwind CSS 4 + shadcn/ui primitives (`src/components/ui/*`)
- [x] Path alias `@/*` → `src/*`
- [x] Dependencies: `next-themes`, `sonner`, `lucide-react`
- [x] Phase 1 documentation (`docs/*`, root README)
- [x] Brand tokens in `globals.css` (ink teal, limestone, brass)
- [x] Fraunces + Figtree via `next/font` in root layout
- [x] Theme provider (`next-themes`) wired in layout
- [x] Route group `(shop)` with shared header shell
- [x] Route group `(auth)` for customer login/verify/register
- [x] `admin` layout + sidebar navigation
- [x] `src/constants/` (routes, storage keys, demo credentials)
- [x] `src/types/` domain models
- [x] `src/data/mock/` seed catalogue + ops data
- [x] `src/services/` catalogue + session + storage
- [x] `src/hooks/` (shortlist, cart, recently viewed)
- [x] `src/stores/` Zustand cart + wishlist (shortlist) client state
- [x] Production `npm run build` green

---

## Customer (CF-xx)

- [x] CF-01 Landing / login gate (mobile + consent)
- [x] CF-02 Mock OTP verify (resend timer, max resends UI)
- [x] CF-03 First-time register (name, area)
- [x] CF-04 Consent + WhatsApp offers opt-in
- [x] CF-05 Session in localStorage + logout
- [x] CF-06 Lead-shaped mock data on login (demo numbers)
- [x] CF-07 Home hero — delivered gallery carousel
- [x] CF-08 Category tiles
- [x] CF-09 Featured / new / Royal Range strips
- [x] CF-10 Instagram reels strip (home + tagged pages)
- [x] CF-11 Store block (address, map, call, WhatsApp)
- [x] CF-12 Category page with subcategory chips
- [x] CF-13 Product cards (price, MRP, discount, swatches, stock)
- [x] CF-14 Sort (popularity, price, newest, discount)
- [x] CF-15 Filters + mobile sheet + clear all
- [x] CF-16 Search
- [x] CF-17–CF-24 PDP (gallery, variants, specs, accordion, sticky CTAs, related, shortlist)
- [x] CF-25 Reels on pages via tags

---

## Personalisation (PB-xx)

- [x] PB-01 Recently viewed rail
- [x] PB-02 Continue where you left off
- [x] PB-03 Inspired by browsing
- [x] PB-04 Shortlist + WhatsApp share
- [x] PB-05 Cart (DB `carts`, custom L×W, qty controls, `/cart` page — no checkout)
- [x] PB-06 Clear history from menu
- [x] Admin leads / segments / intent (mock UI)

---

## Sales & delivery (SD-xx)

- [x] Pricing / stock / delivery content on PDP
- [x] Visit Store + Contact sticky CTAs
- [x] My orders (read-only mock)
- [x] Admin sales status workflow (mock)

---

## Admin (AD-xx)

- [x] AD-01 Dashboard
- [x] AD-02 Categories
- [x] AD-03 Attribute templates
- [x] AD-04 Products list (duplicate/archive mock)
- [x] AD-05 Masters
- [x] AD-06 Pricing (admin-only UI)
- [x] AD-07 Stock grid
- [x] AD-08 Gallery approve
- [x] AD-09 Reels
- [x] AD-10 Sales & deliveries
- [x] AD-11 Leads (+ team assigned-only)
- [x] AD-12 Users & roles (admin-only)
- [x] AD-13 Settings + audit log
- [x] Admin vs Team permission differences in UI

---

## Polish

- [x] Responsive layouts (mobile-first grids / sheets)
- [x] Empty states (search, shortlist, filters)
- [x] Unsplash `images.remotePatterns`
- [x] README demo credentials
- [ ] Optional: loading skeletons, deeper a11y audit, PWA

---

## Explicitly not on this list (Phase 1)

Checkout, payments, real OTP/SMS, production RBAC, ERP/PIM sync, WhatsApp Cloud API — see `PRD.md` / `SECURITY.md`.

---

## Admin console rebuild (post Phase 1)

Strategy and fallback: see `MEMORY.md` → “Admin console rebuild strategy”.
Images: placeholders only (no upload/edit) until a later media phase.

### Phase A — Shell (Figma)

- [ ] Match Figma sidebar groups, nav labels/order, chrome
- [ ] Keep Neon Auth; preserve admin vs team locks (improve server enforcement later)

### Phase B — Product editor (HTML spec)

- [ ] Products list aligned to design (filters, status, actions)
- [ ] Category-aware editor shell (swap template by category)
- [ ] Common fields + category specs UI (Beds → TV units per HTML)
- [ ] Variants & pricing matrix + stock status
- [ ] Media placeholders (read-only; no add/edit images)
- [ ] Draft / publish checklist UX
- [ ] Duplicate / archive / delete with `ConfirmationModal`

### Phase C — Schema (category-by-category)

- [ ] Mattresses specs + variant axes fully Neon-backed
- [ ] Beds → Sofas → Computer tables → Dining → Wardrobes → TV units
- [ ] Server actions + services for create/update/delete (no mock-only)

### Phase D — Rest of console

- [ ] Categories / Attributes / Masters UI ↔ Figma + full CRUD gaps
- [ ] Pricing / Stock grids aligned
- [ ] Gallery / Reels / Sales / Leads / Users / Settings / Audit

### Fallback Z (only if primary path reverted)

- [ ] Fetch products from DB → Zustand admin store
- [ ] Demo mutations in Zustand only; no further schema expansion

