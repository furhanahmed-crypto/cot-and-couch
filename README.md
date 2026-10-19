# Cot & Couch — Digital Window

Premium furniture showroom catalogue with enquiry-led CTAs. **Auth uses Neon Auth (email)** + a `profiles` table. Catalogue data is still mock for now (no cart/checkout/payments).

Detailed docs: [`docs/`](./docs/).

---

## Prerequisites

- **Node.js** 20+
- A free [Neon](https://console.neon.tech) project with **Auth** enabled

---

## Setup (auth)

### 1. Get Neon values (fill root `.env`)

1. Open [console.neon.tech](https://console.neon.tech) → create/open a project  
2. **Auth** (sidebar) → **Enable Auth** / Better Auth  
3. Copy **Auth URL** → `NEON_AUTH_BASE_URL` in `.env`  
4. Dashboard → **Connect** → enable **Connection pooling** → copy → `DATABASE_URL`  
5. Auth → Configuration → **Domains** → add `http://localhost:3000`  
6. `NEON_AUTH_COOKIE_SECRET` is already generated in `.env` (keep it private)

### 2. Install, push profiles table, run

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Register** with email → you land in the shop.

### 3. Staff / team console login

Sign in at [`/admin/login`](http://localhost:3000/admin/login).

**Demo team credentials**

| Field | Value |
|-------|--------|
| Email | `test@cotandcouch.com` |
| Password | `cotandcouch2026` |
| Role | `team` |

To promote another Neon Auth user to staff, run in Neon **SQL Editor**:

```sql
update profiles set role = 'team' where email = 'your@email.com';
-- or role = 'admin' for full console access
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply Drizzle schema (`profiles`) to Neon |
| `npm run db:studio` | Browse tables |

Sessions are **Neon Auth cookies** (not localStorage). Shortlist / recently viewed still use localStorage until we migrate those.

---

## Project scope (Phase 1)

### Included (target)

- Shop: homepage, catalogue, product detail, search, shortlist, recently viewed
- Showroom CTAs: enquire, WhatsApp, visit — **not** online checkout
- Customer mock OTP login
- Admin: dashboard, catalogue CRUD (in-memory), enquiries inbox, Team vs Admin UI demo
- Light/dark theme (espresso / cream / terracotta — see [DESIGN.md](./docs/DESIGN.md))

### Excluded

- Shopping cart, checkout, payment gateways
- Real SMS/WhatsApp OTP, Supabase, or any production API
- Inventory/ERP sync, CRM integration, DPDP-compliant production data handling

Progress tracking: [TASKS.md](./docs/TASKS.md).

---

## Folder structure

Current scaffold plus planned layout (some paths are **in progress**):

```
cot-and-couch/
├── docs/                 # PRD, architecture, design, tasks, security
├── public/               # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout
│   │   ├── globals.css   # Theme tokens
│   │   ├── page.tsx
│   │   ├── (shop)/       # Customer routes (planned)
│   │   ├── (auth)/       # Login / OTP (planned)
│   │   └── admin/        # Staff console (planned)
│   ├── components/
│   │   └── ui/           # shadcn primitives
│   ├── constants/        # Routes, storage keys (planned)
│   ├── hooks/            # Shortlist, session, etc. (planned)
│   ├── services/         # Mock data layer (planned)
│   ├── types/            # Domain types (planned)
│   ├── data/mock/        # Seed catalogue (planned)
│   └── lib/utils.ts      # Shared utilities
├── package.json
└── tsconfig.json
```

Implementation details: [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) components
- [next-themes](https://github.com/pacocoursey/next-themes), [sonner](https://sonner.emilkowal.ski/), [lucide-react](https://lucide.dev/)

---

## Future backend (not in this repo phase)

A later phase may add:

- **Supabase** (or similar) for auth, PostgreSQL, and storage
- Real **OTP** and optional **WhatsApp** Business flows for enquiries
- Server-enforced **Team / Admin** roles and enquiry workflow
- **DPDP**-aligned consent, retention, and privacy notices
- Optional commerce only if the business chooses — Phase 1 remains showroom-first

Do not implement these in Phase 1 without updating the PRD and task checklist.

---

## Contributing

Follow [RULES.md](./docs/RULES.md): mock data only, no cart/checkout, shadcn `Select` for dropdowns, keep docs in sync with new routes and features.

---

## License

Private — Cot & Couch / Digi Carotene project. All rights reserved unless otherwise specified by the repository owner.
