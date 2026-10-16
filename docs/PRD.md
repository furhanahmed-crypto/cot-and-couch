# Cot & Couch — Digital Window Phase 1 PRD

**Product:** Cot & Couch Digital Window (frontend prototype)  
**Phase:** 1 — showroom catalogue & lead experience (no commerce backend)  
**Status:** Requirements reference for mock UI; not a production spec.

---

## 1. Vision & business goals

Cot & Couch is a premium furniture showroom. Phase 1 **Digital Window** extends the in-store experience online: customers discover collections, compare pieces, and take **showroom-first actions** (visit, enquire, WhatsApp) rather than checking out on the web.

| Goal | Phase 1 outcome (mock) |
|------|-------------------------|
| Brand presence | Premium catalogue that feels like a curated showroom, not a discount marketplace |
| Discovery | Browse by room, category, collection; search and filter with clear product storytelling |
| Lead generation | Enquiry and contact flows that hand off to store team (UI + mock persistence only) |
| Operational preview | Admin/Team consoles demonstrate how staff would manage catalogue and view leads |
| Validation | Stakeholder walkthroughs and UX testing before backend investment |

**Success signals (prototype):** complete customer journeys on mock data, credible admin demos, design system applied consistently, documentation that keeps scope honest.

---

## 2. Users & roles

### Customer (public shop)

- Browses catalogue without login; optional mobile OTP for profile shell and synced shortlist (localStorage in Phase 1).
- Primary CTAs: **Visit showroom**, **Enquire**, **WhatsApp** — not Add to cart / Pay now.

### Team (store staff)

- Signs into a **reduced admin** experience (UI-only permission demo).
- Can view catalogue context and mock enquiries; limited or hidden destructive/settings areas compared to Admin.

### Admin (operations / marketing)

- Full **admin** route group: dashboard, catalogue CRUD (in-memory), mock enquiry list, role demo toggles.
- Password-based mock login separate from customer OTP.

---

## 3. Phase 1 scope boundary

### In scope (frontend mock)

- Next.js App Router UI for shop, auth, and admin.
- Static/mock product catalogue (JSON + Unsplash imagery).
- Client-side services simulating API latency and mutations held in memory for the session.
- `localStorage` for session token, shortlist, recently viewed, theme preference.
- Responsive layouts, accessibility baseline, light/dark themes.

### Explicitly out of scope

| Area | Notes |
|------|--------|
| Shopping cart | No basket, quantities, or checkout |
| Payments | No gateways, invoices, or order payment |
| Real backend / DB | No Supabase, REST, or GraphQL in Phase 1 |
| Real OTP / SMS | Any 6-digit code accepted in mock auth |
| Inventory sync | Stock figures are illustrative copy or mock flags |
| Production RBAC | Team vs Admin is a **UI demonstration**, not enforced server-side |
| PIM / ERP integration | Future phase |

---

## 4. Customer features (CF-xx)

| ID | Feature | Description | Mock notes |
|----|---------|-------------|------------|
| CF-01 | Homepage | Hero, featured collections, showroom story, primary CTAs | Content from mock CMS constants |
| CF-02 | Category navigation | Room/category taxonomy (e.g. living, bedroom, dining) | Links to filtered PLP |
| CF-03 | Product listing (PLP) | Grid/list, sort, filters (price band, material, colour) | Client-side filter on mock array |
| CF-04 | Product detail (PDP) | Gallery, dimensions, materials, care, related products | Unsplash images; enquiry CTA |
| CF-05 | Search | Query bar, empty states, mock suggestions | Debounced client search |
| CF-06 | Shortlist | Save/remove products; badge in header | `localStorage` + optional session tie-in |
| CF-07 | Recently viewed | Track last N PDP visits | `localStorage` |
| CF-08 | Customer auth | 10-digit mobile → OTP step → minimal profile | Mock OTP; session in `localStorage` |
| CF-09 | Showroom & contact | Store hours, map placeholder, click-to-call/WhatsApp links | Static content |
| CF-10 | Enquiry on PDP | Form: name, phone, message; success toast | Appends to in-memory admin queue |
| CF-11 | Curated collections | Collection landing pages and homepage rails | Mock collection entities |
| CF-12 | Theme preference | Light/dark toggle | `next-themes` + design tokens |

**Non-goals for CF:** cart, checkout, order tracking, live chat backend.

---

## 5. Admin modules (AD-xx)

| ID | Module | Description | Mock notes |
|----|--------|-------------|------------|
| AD-01 | Admin login | Mobile + password + mock OTP gate for `/admin` | Phone `9391360138` / password `cotandcouch2026` / any 6-digit OTP |
| AD-02 | Dashboard | KPI cards, recent enquiries, quick links | Static/mock counts |
| AD-03 | Products | List, create, edit, archive (in-memory) | Resets on full page reload unless extended |
| AD-04 | Categories | Manage category tree labels and order | In-memory |
| AD-05 | Collections | Assign products to curated collections | In-memory |
| AD-06 | Enquiries inbox | Table of CF-10 submissions | Session memory + optional seed data |
| AD-07 | Roles demo | Switch or badge **Admin** vs **Team** visibility | Client-only; no JWT |
| AD-08 | Settings shell | Brand copy, contact numbers, social links | Constants edited in UI for demo |

Team users see AD-02, AD-06 (read-only or limited), and AD-03 (view) per UI rules; Admin sees all modules.

---

## 6. Personalisation (PB-xx)

| ID | Feature | Description | Mock notes |
|----|---------|-------------|------------|
| PB-01 | Recently viewed rail | Homepage or PDP footer | From CF-07 storage |
| PB-02 | Shortlist sync | Persist across visits on same browser | Keyed by mock user id when logged in |
| PB-03 | Continue browsing | Resume last category or collection | Last route in `localStorage` |
| PB-04 | Similar products | Rule-based (same category/collection) | No ML; mock algorithm in service |

---

## 7. Sales & delivery (SD-xx)

Phase 1 covers **information and handoff**, not order fulfilment systems.

| ID | Feature | Description | Mock notes |
|----|---------|-------------|------------|
| SD-01 | Pricing display | MRP, optional “offer” badge, “Price on request” variant | Copy only |
| SD-02 | Availability messaging | “Available at showroom”, made-to-order labels | Static per SKU in mock data |
| SD-03 | Delivery & installation | Policy accordion on PDP or footer | Marketing copy |
| SD-04 | Enquiry workflow | Status column in admin (New / Contacted / Closed) | Admin can update in-memory |
| SD-05 | WhatsApp & callback CTAs | Deep links with prefilled product name | `wa.me` / `tel:` links |

**Out of scope:** DPDP-compliant consent logging, CRM sync, delivery slot booking APIs.

---

## 8. Non-functional expectations (prototype)

- **Performance:** sensible image sizes; lazy-load galleries where practical.
- **Accessibility:** semantic headings, focus states, form labels (shadcn/Radix patterns).
- **Browsers:** latest Chrome, Safari, Firefox; mobile-first breakpoints.
- **Locale:** English first; INR formatting for prices in UI.

---

## 9. Future phases (not built now)

- Supabase (or equivalent) for auth, catalogue, enquiries.
- Real OTP (SMS/WhatsApp provider) and DPDP-aligned consent.
- Cart/checkout only if business chooses e-commerce; currently showroom-led.
- Analytics, CMS integration, and production admin RBAC.

See `ARCHITECTURE.md`, `SECURITY.md`, and root `README.md` for implementation boundaries.
