# Cot & Couch — Digital Window (Phase 1)

Frontend-only prototype of the **Cot & Couch Digital Window**: a premium furniture showroom catalogue with enquiry-led CTAs, mock customer login, and an admin console demo. There is **no backend, database, cart, checkout, or payments** in this phase.

Detailed product and engineering docs live in [`docs/`](./docs/).

| Document | Purpose |
|----------|---------|
| [PRD.md](./docs/PRD.md) | Requirements, users, CF/AD/PB/SD features, out of scope |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | App Router structure, mock services, storage |
| [DESIGN.md](./docs/DESIGN.md) | Brand colours, typography, UX principles |
| [TASKS.md](./docs/TASKS.md) | Feature checklist and status |
| [RULES.md](./docs/RULES.md) | Coding standards |
| [MEMORY.md](./docs/MEMORY.md) | Decision log |
| [SECURITY.md](./docs/SECURITY.md) | Mock auth limitations and future needs |

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (or compatible package manager)

---

## Setup

```bash
git clone <repository-url>
cd cot-and-couch
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint (Next.js config) |

---

## Demo credentials (mock only)

**Not real authentication.** No SMS or backend is called.

| Surface | Credentials |
|---------|-------------|
| **Customer** | Any valid **10-digit** Indian mobile (e.g. `9876501234`) |
| **Returning customer** | `9848012345` or `9123456780` (skips name form; has mock orders) |
| **Customer OTP** | Any **6 digits**; demos use **`123456`** |
| **Admin** | Mobile **`9391360138`** · password **`cotandcouch2026`** · any 6-digit OTP → `/admin/login` |
| **Team** (optional UI demo) | Mobile `9876543211` · password **`team123`** · any 6-digit OTP |

Customer and staff sessions are stored in **`localStorage`**. Clearing site data resets login, shortlist, and recently viewed items. Admin edits toast as mock and are not persisted across reloads. See [SECURITY.md](./docs/SECURITY.md).

---

## Project scope (Phase 1)

### Included (target)

- Shop: homepage, catalogue, product detail, search, shortlist, recently viewed
- Showroom CTAs: enquire, WhatsApp, visit — **not** online checkout
- Customer mock OTP login
- Admin: dashboard, catalogue CRUD (in-memory), enquiries inbox, Team vs Admin UI demo
- Light/dark theme (premium ink teal / limestone / brass — see [DESIGN.md](./docs/DESIGN.md))

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
