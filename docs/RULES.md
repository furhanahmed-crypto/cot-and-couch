# Coding rules

Simple, readable code that a beginner can follow. Clarity beats cleverness.

## Principles

- One clear job per function, component and file.
- Prefer plain, explicit code. Some repetition is fine if the alternative is a confusing abstraction.
- No extra layers, wrappers or dependencies without a clear need.
- Handle edge cases and errors explicitly. Never swallow an error silently.
- Never say something works until it has been run and checked.

## File size

- **Source files must stay at or under 120 lines**, including imports and comments.
- Split by meaning (child component, hook, service, type), not at random.

## Naming

| Thing | Style | Example |
|---|---|---|
| File names | kebab-case | `product-card.tsx`, `cart-queries.ts` |
| Components, types | PascalCase | `ProductCard`, `CartLine` |
| Variables, functions | camelCase | `cartTotal`, `getProduct()` |
| Hooks | `use` + camelCase | `useCart` |
| Constants | SCREAMING_SNAKE_CASE | `CATEGORY_SLUGS` |

Use one name per idea across UI, code and DB.

## Where code goes

| Folder | What |
|---|---|
| `app/` | Pages, layouts, thin server actions |
| `components/` | UI only. `ui/` = shadcn primitives |
| `services/` | All DB reads and writes, business rules |
| `constants/` | Fixed values, routes, category slugs |
| `types/` | Shared types |
| `lib/` | Small pure helpers |
| `stores/` | Zustand client stores |
| `hooks/` | Reusable React hooks |

- Server actions: check the user, validate input, call a service, revalidate. No Drizzle code in actions or pages.
- No magic strings: category slugs, routes and statuses come from `constants/`.

## TypeScript

- Strict mode. No `any`. Avoid `as` casts.
- Type every exported function's inputs and output.
- Validate user input at the server boundary.

## UI

- Follow [DESIGN.md](./DESIGN.md). Use tokens from `globals.css`, not raw hex.
- Use shadcn components, including `Select` instead of `<select>`.
- Mobile first. Light and dark themes.
- Every screen handles loading, empty, error and disabled states.
- Accessible labels, keyboard use and visible focus.

## Security

- Never commit secrets or real credentials.
- Check auth and role on the server, never only in the UI.
- Authorise by `profile.id` and `role`.

## Done means

- [ ] Builds, lints and type-checks.
- [ ] Tests for the change pass.
- [ ] Checked in the browser.
- [ ] Files ≤ 120 lines, names follow the table above.
- [ ] Docs updated if behaviour changed.
