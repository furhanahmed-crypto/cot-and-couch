# Architecture — Phase 1 frontend prototype

Cot & Couch Digital Window Phase 1 is a **Next.js App Router** application with **no database and no API routes** for business data. All catalogue and admin mutations go through **client-side mock services** backed by JSON seed data and in-memory stores.

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui (Radix/Base UI primitives) |
| Language | TypeScript (`strict: true`) |
| Theming | `next-themes` (class-based light/dark) |
| Icons | `lucide-react` |
| Toasts | `sonner` |
| Path alias | `@/*` → `src/*` |

---

## Directory layout (target)

```
cot-and-couch/
├── docs/                    # Product & engineering docs (this folder)
├── public/                  # Static assets (logo, favicons)
└── src/
    ├── app/
    │   ├── layout.tsx       # Root layout, fonts, theme provider
    │   ├── globals.css      # Design tokens (brand colours)
    │   ├── page.tsx         # Marketing entry (may redirect to shop)
    │   ├── (shop)/          # Customer-facing routes (shared shop chrome)
    │   │   ├── layout.tsx
    │   │   ├── page.tsx     # CF-01 homepage
    │   │   ├── catalogue/
    │   │   ├── product/[slug]/
    │   │   ├── collections/[slug]/
    │   │   ├── shortlist/
    │   │   └── search/
    │   ├── (auth)/          # Customer OTP flows
    │   │   ├── login/
    │   │   └── verify/
    │   └── admin/           # Staff console (separate layout)
    │       ├── layout.tsx
    │       ├── login/
    │       ├── page.tsx     # AD-02 dashboard
    │       ├── products/
    │       ├── categories/
    │       ├── collections/
    │       ├── enquiries/
    │       └── settings/
    ├── components/
    │   ├── ui/              # shadcn primitives (do not bloated-edit)
    │   ├── shop/            # PLP, PDP, header, footer
    │   ├── admin/           # Tables, forms, sidebar
    │   └── shared/          # Theme toggle, logos, empty states
    ├── constants/           # Routes, storage keys, brand copy
    ├── hooks/               # useShortlist, useRecentlyViewed, useMockSession
    ├── services/            # Mock “API” modules (async, in-memory)
    ├── types/               # Product, Category, Enquiry, User roles
    ├── data/
    │   └── mock/            # Seed JSON/TS (products, categories, enquiries)
    └── lib/
        └── utils.ts         # cn(), formatters
```

Route groups `(shop)` and `(auth)` do not affect URLs; `admin` is a real URL segment.

**Current scaffold:** `src/app`, `src/components/ui`, and `src/lib` exist; shop/auth/admin routes and mock layers are added incrementally per `TASKS.md`.

---

## Rendering model

| Surface | Default | Notes |
|---------|---------|--------|
| Marketing / PLP / PDP | Server Components where possible | Pass mock data as props from services imported on server, or static seed |
| Filters, shortlist, auth forms | Client Components | `"use client"`; hooks and browser storage |
| Admin tables/forms | Client Components | In-memory edits need client state |

Avoid Route Handlers for catalogue in Phase 1 — keeps the “no backend” story clear. If a server-only helper is needed, import mock data directly in Server Components.

---

## Mock service pattern

Each domain gets a module under `src/services/`:

```typescript
// Illustrative pattern — not necessarily committed yet
export async function listProducts(filters?: ProductFilters): Promise<Product[]> {
  await delay(150); // simulate network
  return applyFilters(mockProducts, filters);
}
```

- **Seed source:** `src/data/mock/*.ts` (or JSON imported as modules).
- **Mutations:** module-level `let` arrays or a tiny in-memory store; admin edits survive navigation within the SPA but **reset on hard reload** unless persisted to `localStorage` deliberately (catalogue default: memory only).
- **Enquiries:** append from CF-10; admin reads same store.

Services are **never** called from a real external API in Phase 1.

---

## Browser persistence (`localStorage`)

| Key (constant in `constants/storage.ts`) | Purpose |
|------------------------------------------|---------|
| Session / mock token | Customer logged-in flag + mobile |
| Shortlist | Product IDs (CF-06, PB-02) |
| Recently viewed | Ordered product IDs, cap N (CF-07, PB-01) |
| Theme | Optional; prefer `next-themes` default |
| Admin session | Mock admin logged-in flag (separate from customer) |

Always guard reads/writes with `typeof window !== "undefined"`. Never store real secrets.

---

## Auth flows (mock)

**Customer:** mobile (10 digits) → OTP screen → set mock session → optional profile shell.  
**Admin:** `/admin/login` → password check against constant → admin session flag.

No middleware enforcement in early prototype; layout components redirect if session missing (client-side). Production would use server sessions — out of scope.

---

## Component conventions

- **Shop chrome:** header with search, shortlist count, theme toggle, auth avatar.
- **Admin chrome:** sidebar navigation mapped to AD-xx modules, role badge for Team vs Admin demo.
- **Forms:** shadcn `Input`, `Label`, `Select` (not native `<select>`), `Textarea`, `Button`.
- **Data display:** `Table` for admin lists; cards for PLP.

---

## Styling

Brand tokens live in `globals.css` (`:root` / `.dark`). See `DESIGN.md` for colour and typography targets. Tailwind v4 `@theme inline` maps CSS variables to utilities.

---

## What we are not building

- No ORM, migrations, or Supabase client in Phase 1.
- No `fetch('/api/...')` for catalogue CRUD.
- No edge middleware for auth secrets.
- No cart/checkout routes or payment SDKs.

Future backend can replace `services/*.ts` implementations while keeping component contracts stable; types in `src/types/` should mirror intended API shapes early.
