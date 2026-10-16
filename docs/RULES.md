# Agent rules & development guidelines

Short, binding rules for Cot & Couch. Prefer clarity over cleverness. Read `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `MEMORY.md` before changing established decisions.

---

## 1. Core principles

- Prioritize exceptional UI/UX, usability, accessibility, and visual consistency.
- Keep code simple, clean, maintainable, and scalable.
- Avoid overengineering, unnecessary abstractions, wrappers, and extra layers.
- Prefer straightforward, readable code over clever complexity.
- Follow existing conventions and respect decisions in `MEMORY.md`.

---

## 2. UI / UX & design

- Build polished interfaces with clear hierarchy (see `DESIGN.md`).
- Keep typography, colour, spacing, and components consistent (tokens in `globals.css`).
- Use subtle motion where it aids hierarchy; respect `prefers-reduced-motion`.
- Responsive: mobile-first, then tablet and desktop.
- Support light and dark themes via centralized tokens + `next-themes`.
- Intuitive navigation, clear feedback, accessible controls.
- Use **shadcn/ui** consistently — including **Select**, not native `<select>`.

---

## 3. Code quality & architecture

- Follow Next.js App Router conventions and senior TypeScript practice (`strict`).
- Organize under `components`, `constants`, `hooks`, `services`, `types`, `app` (and `layouts` when needed).
- Keep files **under ~120 lines** where practical; split when they grow.
- Clear names for files, components, functions, variables, and types.
- Single responsibility: one job per function/component.
- Extract reuse only when it improves clarity; duplication is OK if abstraction hurts.
- Avoid deep nesting, unnecessary loops, and redundant wrappers.
- Keep business logic out of presentational components when it helps.
- Explicit types; no casual `any`.
- Semantic HTML and accessible components.
- No new dependency or architectural layer without a clear need.

---

## 4. Components & interactions

- Reuse shared layouts (header, admin sidebar, auth chrome).
- Keep shared behaviour consistent across related pages.
- Interactive controls must have a clear purpose and work as labelled.
- Provide loading, empty, error, success, and disabled states where relevant.
- Accessible labels, keyboard use, focus states; tooltips when helpful.
- Prefer shadcn primitives over raw HTML equivalents when the project already uses them.

---

## 5. Routing & state

- Keep routes centralized (`src/constants/routes.ts`).
- Use consistent layouts per route group (`(shop)`, `(auth)`, `admin`).
- Prefer the simplest state approach that works (React state → URL → server/session).
- Avoid duplicated or sync-heavy client state.
- Persist only what the architecture allows (see `ARCHITECTURE.md` / `MEMORY.md`).
- Auth sessions: **not** in `localStorage` once Neon Auth is live — use provider sessions/cookies.

---

## 6. Security & reliability

- Never expose secrets or server-only env vars to the client.
- Validate and authorize sensitive work on the server.
- Authorize by **`profile.id` + `role`**, never by email string checks.
- Roles in DB: `admin` | `team` | `customer` — enforced in server code, not UI alone.
- Validate input; fail gracefully with user-visible errors.
- Never claim a feature works without implementing and verifying it.
- No destructive changes without understanding impact.

---

## 7. Documentation

- Keep root `README.md` accurate (setup, env, commands, structure).
- Keep `docs/` in sync: PRD, ARCHITECTURE, DESIGN, MEMORY, RULES, TASKS, SECURITY.
- Read relevant docs before changing established decisions.
- Update docs when requirements, architecture, or status change.
- Record important decisions in `MEMORY.md` to avoid repeats.

---

## 8. Development workflow

- Understand codebase + docs before coding.
- Work in small phases; keep the app runnable.
- Establish foundations before large features.
- Reuse existing code; don’t rebuild working pieces.
- Verify with lint, build, and manual smoke where possible.
- Keep `TASKS.md` accurate (done vs pending).
- No unrelated scope creep.

---

## 9. Product & data scope

- **No cart, checkout, or online payments** unless PRD explicitly changes.
- Catalogue/auth persistence follows current `ARCHITECTURE.md` (Neon + `profiles` when wired).
- Customer **phone OTP** is designed for later; don’t invent an OTP provider until scheduled.
- Don’t couple mattress filters/attributes to auth — catalogue tables only.
- Demo credentials and secrets: never commit real keys; document demo values in README only.

---

## 10. Naming

| Kind | Convention |
|------|------------|
| Components | PascalCase (`ProductCard.tsx`) |
| Hooks | `use*` (`useShortlist.ts`) |
| Services | clear verbs (`listProducts`) |
| Routes | kebab-case (`product/[slug]`) |

---

## 11. Definition of done

Before calling work done:

- [ ] Meets stated requirements  
- [ ] UI consistent, responsive, accessible where applicable  
- [ ] Follows these rules and project conventions  
- [ ] Loading / empty / error states handled where needed  
- [ ] Security/auth rules respected  
- [ ] Lint/build (and smoke) run when possible  
- [ ] Docs and `TASKS.md` match reality  
