# Cot & Couch — docs

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, folders, database, auth, commands |
| [RULES.md](./RULES.md) | Coding standards |
| [DESIGN.md](./DESIGN.md) | UI tokens and patterns |
| [PRD.md](./PRD.md) | Original Phase 1 brief |
| [SECURITY.md](./SECURITY.md) | Auth notes |
| [MEMORY.md](./MEMORY.md) | Decisions log |

## Live scope

| Area | Status |
|------|--------|
| **Mattresses** | Live — brands + products |
| **Beds** (`cots`) | Live — **range masters** + products per range |
| **Sofas / computer tables** | Deferred (inactive categories) |

### Beds model

- Masters: `coc_bed_ranges` (Ideal … Range 8)
- Products: each has `bed_range_id`; variants = shared widths × colours
- Admin Categories: add/edit ranges (like mattress brands) + shared width sheet
- Admin Products: filter by range; create requires a range for Beds
- Shop: PLP filters from DB-backed product data (range, width, colour, …)

### Migrations

`0001`–`0010` in `drizzle/`. Apply: `bun run db:migrate`.

After migrate on an existing DB: `bun run db:seed-beds` to upsert ranges + 24 demo products.

### Commands

```bash
bun run dev
bun run db:migrate
bun run db:seed          # full catalogue (mattresses + beds)
bun run db:seed-beds     # beds only (safe for existing mattresses)
bun run db:studio
```
