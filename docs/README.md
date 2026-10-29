# Cot & Couch — docs

Minimal engineering docs for this repo.

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, folders, database, auth, commands |
| [RULES.md](./RULES.md) | Coding standards (read before large changes) |
| [DESIGN.md](./DESIGN.md) | UI tokens and patterns |
| [PRD.md](./PRD.md) | Product scope (original Phase 1 brief; app now has real DB + admin) |
| [SECURITY.md](./SECURITY.md) | Auth and data handling notes |
| [MEMORY.md](./MEMORY.md) | Short decisions log |

## Client-ready scope (live)

| Area | Status |
|------|--------|
| **Mattresses** | Live — brands, options, products, shop + admin |
| **Beds** (`cots`) | Live — 8 ranges, shared widths (name + size), shop + admin |
| **Sofas** | Deferred — category row kept inactive; no products/options |
| **Computer tables** | Deferred — same as sofas |

The app runs on **Neon Postgres** (`coc_*`), storefront + staff admin. Apply migrations with `bun run db:migrate` (`DATABASE_URL_UNPOOLED`).

| Migration | Purpose |
|-----------|---------|
| `0001`–`0005` | Foundation → catalogue → shop → CRM → commerce |
| `0006` | Drop legacy pre-`coc_*` tables |
| `0007` | Bed model cleanup (width-only axes) |
| `0008` | Bed width `detail` + range name updates |
| `0009` | Prune archived + sofa/table products; hide deferred categories |

**Beds normalisation** (optional after migrate): `bun run db:migrate-bed-ranges`.

**Seed** (dev): `bun run db:seed` — mattresses + 8 bed ranges only.

### Beds admin

Categories → Beds: **Add range**, cards with edit/delete. **Edit** opens a sheet (range name + shared widths). Width add/edit uses name + size modal. Constants: `src/constants/bed-model.ts`.

### Commands

```bash
bun run dev
bun run db:migrate
bun run db:seed
bun run db:migrate-bed-ranges
bun run db:studio
```
