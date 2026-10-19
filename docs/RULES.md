# Agent Rules & Development Guidelines

Short, binding rules for Cot & Couch. Prioritize clarity over cleverness. Read `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `MEMORY.md` before changing established decisions.

---

## 1. Core Principles

- Write clean, pragmatic, beginner-friendly, maintainable code.
- Each function, component, and module must have one clear responsibility.
- Prefer simple, explicit logic over clever shortcuts, deep nesting, and unnecessary abstractions.
- Repeated code is acceptable when extracting it adds unnecessary complexity. Reuse shared business logic when it improves consistency.
- Avoid overengineering, premature optimization, redundant wrappers, and unnecessary architectural layers.
- Handle relevant edge cases, invalid inputs, and expected failures explicitly.
- Follow existing project conventions and decisions recorded in `MEMORY.md`.
- Prioritize readability, reliability, and maintainability over minimizing lines of code.

## 2. Strict File Size & Code Splitting

- **HARD RULE: No source code file may exceed 120 lines**, including imports, blank lines, and comments.
- Split files before they exceed the limit. Do not treat 120 lines as an approximate target.
- Extract meaningful child components, hooks, services, utilities, constants, and types into appropriate files.
- Keep each file focused on one responsibility and easy to understand independently.
- Do not create meaningless files or split cohesive logic arbitrarily just to meet the limit.
- Keep the folder structure predictable and related files easy to locate.

## 3. Naming Conventions

Follow consistent naming throughout the project.

| Item | Convention | Example |
|---|---|---|
| Constants | `SCREAMING_SNAKE_CASE` | `API_BASE_URL` |
| Components and component filenames | `PascalCase` | `ProductCard.tsx` |
| Variables and functions | `camelCase` | `productList`, `calculateTotal()` |
| Custom React hooks | `camelCase`, prefixed with `use` | `useAuth.ts` |
| Object properties | `camelCase` | `firstName` |
| Types and interfaces | `PascalCase` | `ProductResponse` |
| Utility and service filenames | Descriptive `camelCase` | `formatDate.ts` |
| Route segments | `kebab-case` | `product-details` |

- Use meaningful, descriptive names. Avoid vague names when a precise name is available.
- Follow framework-required naming conventions where necessary, consistently and without compromising functionality.

## 4. Architecture & Folder Structure

Use clean architecture pragmatically. Organize code by responsibility under appropriate folders:

- `app/` — Next.js App Router pages, layouts, and route handlers.
- `components/` — Reusable UI components, organized by feature where appropriate.
- `hooks/` — Reusable custom React hooks.
- `services/` — API communication and external service operations.
- `utils/` — Reusable helper functions and pure utilities.
- `constants/` — Shared constants and fixed definitions.
- `config/` — Centralized application and environment configuration.
- `types/` — Shared TypeScript types and interfaces.
- `layouts/` — Shared layouts when the project structure requires them.

Additional folders are acceptable when they provide a clear organizational benefit.

- Keep UI rendering, business logic, data fetching, and shared utilities separated where appropriate.
- Keep feature-specific code close to the feature; move genuinely shared code to common folders.
- Prefer the simplest architecture that satisfies current requirements.
- Do not introduce unnecessary design patterns, dependencies, or layers.

## 5. Centralized Configuration & Consistency

- Maintain a single source of truth for shared values and definitions.
- Centralize API endpoints, HTTP methods, route paths, configuration, and shared constants wherever appropriate.
- For example, define API endpoints in `src/constants/api.ts` and application routes in `src/constants/routes.ts` instead of scattering definitions across components.
- Use environment variables for environment-specific values. Never expose secrets or server-only variables to the client.
- Follow consistent patterns across similar features, services, and components.
- Reuse existing utilities and shared implementations when appropriate.
- Introduce shared files and abstractions when they improve consistency and maintainability, not merely to centralize everything.
- Use `globals.css` design tokens and existing shared configuration rather than duplicating values.

## 6. UI/UX & Component Standards

- Prioritize polished UI/UX, usability, accessibility, and visual consistency. Follow `DESIGN.md`.
- Maintain consistent typography, colors, spacing, and components using centralized design tokens.
- Build mobile-first, responsive interfaces for mobile, tablet, and desktop.
- Support light and dark themes using centralized tokens and `next-themes`.
- Use subtle motion only when helpful and respect `prefers-reduced-motion`.
- Use `shadcn/ui` consistently, including its `Select` component instead of native `<select>` elements. Prefer existing project primitives over raw HTML equivalents where appropriate.
- Reuse shared layouts, navigation, and common UI components.
- Keep components small, focused, and readable. Extract complex or reusable sections into child components.
- Avoid deeply nested JSX, unnecessary prop drilling, complicated conditional rendering, and redundant wrappers.
- Interactive controls must work as labelled and provide clear feedback.
- Handle loading, empty, error, success, and disabled states wherever relevant.
- Use semantic HTML, accessible labels, keyboard navigation, and visible focus states. Add tooltips when helpful.

## 7. Functions, State & Error Handling

- Each function must perform one clearly defined task and have a descriptive name.
- Prefer early returns and straightforward conditionals over unnecessary nesting.
- Extract calculations or complex conditions into clearly named variables or functions when that improves readability.
- Follow React hook rules and avoid unnecessary state, effects, and re-renders.
- Use the simplest appropriate state approach: React state, URL state, or server/session state.
- Avoid duplicated or synchronization-heavy client state.
- Keep API calls in services and reusable stateful logic in hooks where appropriate.
- Validate inputs at appropriate boundaries, handle expected errors, and show clear user-facing feedback.
- Avoid silently swallowing errors, redundant validation, and unnecessary defensive checks.

## 8. TypeScript & Code Quality

- Follow Next.js App Router conventions and use strict TypeScript.
- Define appropriate types for function parameters, return values, component props, and API responses.
- Avoid `any` and unnecessary type assertions; use type-safe solutions.
- Keep shared types in `types/` and feature-specific types near their usage.
- Use `as const` when it provides meaningful type safety.
- Use semantic, maintainable code and avoid unnecessary generic abstractions.
- Add no dependency or architectural layer without a clear need.

## 9. Security & Product Scope

- Never expose secrets, private credentials, or server-only environment variables to the client or repository.
- Validate inputs and perform sensitive authorization on the server; never rely on UI restrictions alone.
- Authorize users by `profile.id` and `role`, never by email-string checks.
- Database roles are `admin`, `team`, and `customer`; enforce them in server-side code.
- Once Neon Auth is live, use provider-managed sessions/cookies instead of `localStorage` for authentication sessions.
- Follow `ARCHITECTURE.md` for catalogue and authentication persistence, including Neon and `profiles` when implemented.
- Do not add checkout or online payments unless `PRD.md` explicitly authorizes them. Cart save (no checkout) is authorized per `MEMORY.md`.
- Customer phone OTP is planned for later; do not introduce an OTP provider before it is scheduled.
- Keep mattress filters and attributes independent of authentication and within catalogue-related data structures.
- Never commit real credentials. Document demo values in `README.md` only when appropriate.
- Understand the impact before making destructive changes.
- Never claim a feature works unless it has been implemented and verified.

## 10. Documentation & Development Workflow

- Understand the existing codebase and relevant documentation before making changes.
- Read `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `MEMORY.md` before changing established requirements or decisions.
- Work in small, logical phases and keep the application runnable.
- Reuse existing working code; avoid unrelated refactoring and scope creep.
- Keep `README.md` accurate, including setup, environment variables, commands, and project structure.
- Keep `docs/` and relevant documents (`PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `MEMORY.md`, `RULES.md`, `TASKS.md`, and `SECURITY.md`) consistent with the actual project.
- Update documentation and record important architectural decisions when requirements, implementation, or status change.
- Keep `TASKS.md` accurate, distinguishing completed work from pending work.

## 11. Definition of Done

Before marking work complete:

- [ ] All requirements are implemented.
- [ ] Every source code file is within the strict 120-line limit.
- [ ] Naming conventions, folder structure, and architectural rules are followed.
- [ ] Functions, components, and modules have clear responsibilities.
- [ ] Shared configuration and constants are centralized where appropriate.
- [ ] UI is consistent, responsive, and accessible where applicable.
- [ ] Relevant edge cases, loading, empty, error, success, and disabled states are handled.
- [ ] Security, authentication, authorization, and product-scope rules are respected.
- [ ] Linting, type-checking, builds, and relevant tests are run when possible.
- [ ] Documentation and `TASKS.md` reflect the actual implementation.
- [ ] No unnecessary complexity, unused code, or unrelated changes remain.

**Core principle:** Choose the simplest well-structured solution that meets requirements and follows best practices. Keep every file, function, component, and abstraction purposeful, consistent, beginner-friendly, and maintainable. Never sacrifice clarity for cleverness or unnecessary architectural complexity.