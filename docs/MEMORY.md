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

## Open questions (future)

- Customer gate until phone OTP: temporary Neon Auth email vs light/public browse.
- Whether Phase 2 adds cart or stays enquiry-only.
- CRM destination for enquiries (WhatsApp Business API, etc.).
- DPDP consent capture copy and storage region (Neon region choice).

Record answers here when decided.
