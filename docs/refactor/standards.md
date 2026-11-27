# Refactor standards

Every phase follows these rules. If code and this page disagree, the page wins (or we update the page first).
General repo rules are in [../RULES.md](../RULES.md); this page adds the refactor-specific ones.

## 1. Principles

- Simplest working solution. No wrappers, factories, generic repositories or "base" classes.
- One function = one job. If you need "and" to describe it, split it.
- Flat code: early returns, no nested ternaries, max 2 levels of `if` nesting.
- Repetition is fine when the alternative is a clever abstraction. Repeat a pattern, not a bug.
- Same pattern everywhere: once a list page, form, action or service is written, the next one copies its shape.

## 2. Folders

```
src/
  app/admin/<area>/page.tsx          server component: reads via service, renders components
  app/admin/<area>/actions.ts        thin server actions
  components/admin/common/           shared admin UI (table, toolbar, page header, states)
  components/admin/<area>/           UI for one area only
  components/ui/                     shadcn primitives (do not edit for one screen)
  services/<area>/queries.ts         reads
  services/<area>/mutations.ts       writes
  services/<area>/admin-*.ts         admin-only reads and writes, when the area also serves the shop
  services/<area>/mappers.ts         DB row -> DTO
  validation/<area>.ts               Zod schemas for user input
  types/<area>.ts                    shared DTOs and types
  constants/<area>.ts                fixed values (statuses, slugs, labels)
  hooks/                             shared React hooks
  lib/                               small pure helpers (format, money, slug)
  db/schema/<area>.ts                Drizzle tables
  db/seed/                           seed script + data files
```

Split any file that passes 120 lines by meaning (e.g. `queries.ts` -> `product-queries.ts`, `variant-queries.ts`).

## 3. Types and DTOs: one source for every shape

- **DB row types**: inferred from Drizzle only: `type ProductRow = typeof products.$inferSelect`. Exported from `src/types/db.ts`. Never hand-write a row type.
- **DTOs** (what pages and components receive): defined once in `src/types/<area>.ts`, e.g. `ProductListItem`, `ProductDetail`, `OrderSummary`.
- **Derive, don't copy**: use `Pick`, `Omit`, `&` from an existing type instead of re-declaring fields.
- **Form input types**: `z.infer<typeof productFormSchema>`. Never a second hand-written type for the same form.
- **Enum-like values**: one `as const` array in `constants/`, type derived from it, pgEnum built from the same array:
  ```ts
  export const ORDER_STATUSES = ["confirmed", "in_production", "delivered"] as const;
  export type OrderStatus = (typeof ORDER_STATUSES)[number];
  // db/schema/enums.ts: pgEnum("order_status", ORDER_STATUSES)
  ```
- **Component props**: local `type XProps` unless two components share it; then it moves to `types/`.
- A type used in 2+ files lives in `types/`. A type used in 1 file stays in that file.

## 4. Naming

| Thing | Rule | Example |
|---|---|---|
| Files, folders | kebab-case | `product-table.tsx`, `use-action-toast.ts` |
| Components | PascalCase noun | `ProductTable`, `OrderStatusBadge` |
| Read functions | `get` (one) / `list` (many) | `getProductById`, `listProducts` |
| Write functions | `create` / `update` / `delete` / `set` | `createOrder`, `setProductStatus` |
| Server actions | write name + `Action` | `deleteProductAction` |
| Mappers | `to` + DTO | `toProductListItem` |
| Booleans | `is` / `has` / `can` | `isActive`, `hasStock`, `canDelete` |
| Zod schemas | `<thing>Schema` | `productFormSchema` |
| Constants | SCREAMING_SNAKE_CASE | `PAGE_SIZE`, `CATEGORY_SLUGS` |
| DB tables / columns | snake_case, plural tables | `product_variants.size_label` |

Use the client's words: **Quality** (Affordable / Premium / Ideal Range…), **Size**, **Add-on**, **Recliner**, **Shortlist**.
Never: masters, option groups, allowlist, templates, tiers.

## 5. The four patterns

**Service (read)**: one query, returns a DTO.
```ts
export async function listProducts(filters: ProductFilters): Promise<Page<ProductListItem>> {
  const rows = await db.select(...).from(products).where(buildProductWhere(filters)).limit(PAGE_SIZE).offset(...);
  return { items: rows.map(toProductListItem), total };
}
```

**Service (write)**: validated input in, all statements in one `db.batch([...])` (atomic on Neon HTTP).

**Server action**: always the same 5 steps, nothing else. `requireStaff` throws, so it sits inside the `try`; the example below is the shape, not the exact line order.
```ts
export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireStaff("admin");                         // 1. who
  const parsed = idSchema.safeParse(id);               // 2. validate
  if (!parsed.success) return actionError("Invalid product");
  try {
    await deleteProduct(parsed.data);                  // 3. service
  } catch (error) {
    return toActionError(error, "Could not delete product"); // 4. safe error
  }
  revalidatePath(ROUTES.admin.products);               // 5. refresh
  return actionOk();
}
```

**Client mutation**: always through `useActionToast`. The optional 4th argument receives `fieldErrors` for the form.
```ts
const { run, isPending } = useActionToast();
run(() => deleteProductAction(id), {
  loading: "Deleting product…",
  success: "Product deleted",
  error: "Could not delete product",
});
```

## 6. Shared building blocks (Phases 1 and 4)

| Name | File | Job |
|---|---|---|
| `ActionResult<T>` | `types/action.ts` | `{ ok: true; data: T } \| { ok: false; error: string }` |
| `actionOk`, `actionError`, `toActionError` | `lib/action-result.ts` | Build results; `toActionError` logs the real error server-side and returns a safe message |
| `useActionToast` | `hooks/use-action-toast.ts` | Runs an action, shows loading → success / error toast (sonner), returns `isPending`. The only place that calls `toast` for mutations. |
| `ConfirmationModal` | `components/ui/confirmation-modal.tsx` | Title, description, confirm label, destructive flag, pending state (shared by shop and admin) |
| `requireStaff(role?)` | `services/auth/require-staff.ts` | Returns profile or throws an AppError; `"admin"` for admin-only actions. `requireAdminPage()` redirects team users away from admin-only pages |
| `requireProfile()` | `services/auth/require-profile.ts` | Signed-in profile for shop actions, or "Please sign in again" |
| `formatPrice`, `formatDate` | `lib/format.ts` | ₹ with Indian grouping; dates in IST |
| `Page<T>` | `types/pagination.ts` | `{ items: T[]; total: number; page: number; pageSize: number }` |
| `parsePage`, `clampPage`, `formatPageRange`, `readChoice` | `lib/list-params.ts` | Safe `?page=` and `?filter=` reading for admin lists |
| `validationError` (+ `fieldErrors`) | `lib/action-result.ts` | Zod issues -> toast message + one message per form field |
| `withUniqueMessage`, `assertNotInUse` | `lib/db-errors.ts`, `lib/in-use.ts` | Duplicate -> clear message; delete of something in use -> "Used by N…" |
| `toSlug`, `makeUniqueSlug` | `lib/slug.ts` | Slugs from names, `-2` when taken |
| `toMoney` | `lib/money.ts` | Whole rupees -> numeric column value for writes |

## 7. Validation and errors

- Validate every action input with Zod. Messages are short and human ("Price must be more than 0").
- Numbers from forms arrive as strings: coerce in the schema (`z.coerce.number()`), never with `Number()` in components.
- Expected failures (not found, duplicate, in use) return `{ ok: false, error }` with a clear message.
- Unexpected errors: logged with context on the server (`console.error` in `toActionError` only), generic message to the user.
- Never show raw DB errors in the UI.

## 8. Money

- Stored as `numeric(12,2)` in rupees. Drizzle returns strings.
- Convert once in the mapper with `toRupees(value)` (`lib/money.ts`). DTOs carry numbers.
- Totals: whole rupees only (all client prices are whole rupees); `lib/money.ts` rounds with `Math.round`.

## 9. Next.js

- Read `node_modules/next/dist/docs/` before using any Next API (this version has breaking changes, e.g. `proxy.ts`).
- Pages are server components. `"use client"` only on the component that needs state or events.
- Filters, search, sort and page live in the URL (`searchParams`) so pages are shareable and the back button works.

## 10. Tests

- **Vitest** unit tests for pure logic: money, pricing totals, Zod schemas, mappers, filter builders.
- **DB checks** after each schema change: SQL smoke script (constraints reject bad rows, triggers update `updated_at`).
- **Browser checks** every phase: I test in the built-in browser, then you test in Chrome with the Claude extension using the phase checklist in [phases.md](./phases.md).
- `bun run build`, `bun run lint`, `bun run test` pass before every commit.
