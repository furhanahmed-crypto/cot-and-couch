# Refactor

Rebuild Cot & Couch on a simple database and a clean admin, then add Sofas.
Beginner-friendly code, real data only, every edge case handled. Theme, colours and fonts stay.

| File | What it decides |
|---|---|
| [audit.md](./audit.md) | What is wrong today (verified in the code) |
| [standards.md](./standards.md) | Folders, types and DTOs, naming, the 4 code patterns, validation, money, tests |
| [database.md](./database.md) | 24 tables, keys, indexes, triggers, RLS, migration file, seed |
| [admin-ux.md](./admin-ux.md) | Layout, spacing, shared components, feedback rules, every screen |
| [edge-cases.md](./edge-cases.md) | What must happen in each tricky case |
| [phases.md](./phases.md) | Phase list, checks, and the commit gate after each phase |

## Decisions already made

- DB has no real customers or orders → drop and reseed.
- Prices live in the DB only. Client price lists are seed input.
- One flat `product_variants` table for every category (size, quality, thickness, colour, MRP, price).
- Add-ons priced per quality; sofa add-ons belong to one product.
- Orders store a full snapshot of what was sold.
- No stock tracking (not in client data; furniture is made to order).
- One name per feature: **Shortlist**.
- Only facts from client files or current code. Nothing invented.

## Open questions

1. Sofa range name for the first rows ("Classic Sofa" is a placeholder).
2. Range 7 and Range 8 cots are on no client sheet → not seeded. OK?
3. Cushion Back Range: what do "Premium 2,800 / Royal 6,800 / Heavy cushion 6,800 extra" mean?
4. 78-inch sizes: sheets give only the extra on the discounted price. Seeded with no MRP. OK, or base MRP + extra?
5. Mattress prices: wait for the client sheet, or launch with the demo prices?
6. Product images: download from the Google Drive folder into `public/images/`, or use a storage service? (Seeded: mattress images only; cots and sofas have none yet.)
7. Cot styles Classic / Storage / Platform come from the old site, not the client sheets, and "Storage" overlaps the storage add-ons. Which cot designs should be products?
