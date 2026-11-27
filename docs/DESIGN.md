# Design

A calm, premium furniture showroom. Photography first, plenty of space, clear prices in INR.
The current theme is final: do not change colours or fonts.

## Colours

| Token | Hex | Use |
|---|---|---|
| Cream | `#F6F1EB` | Page background (light) |
| Sand | `#EBDED1` | Muted surfaces |
| Espresso | `#3E2723` | Brand, text, admin sidebar |
| Terracotta | `#D47C4A` | Accents, prices, focus rings |
| White | `#FFFFFF` | Cards, modals |

- Defined in `src/app/globals.css`. Aliases: `--ink` = espresso, `--brass` = terracotta, `--stone` = cream.
- Dark mode: near-black surfaces (`#0c0a09`), cream text, terracotta accents.
- No green, teal or purple. No loud gradients.
- Body text must meet WCAG AA contrast. Terracotta is for short emphasis only.

## Fonts

| Role | Font |
|---|---|
| Headings | Fraunces (500–700) |
| UI and body | Figtree (400–600) |

Loaded with `next/font/google` in the root layout as `--font-display` and `--font-sans`.

## Layout

- Content width `max-w-7xl`, centered.
- Shop grid: 2 columns on mobile, 3–4 on desktop.
- Admin: espresso sidebar, content on cream or white, actions right-aligned in tables.

## Components and motion

- Use shadcn primitives from `src/components/ui/`.
- Icons: `lucide-react`, 16–20px.
- Light hover motion only (scale ≤ 1.02). Respect `prefers-reduced-motion`.
- Product images need alt text (product name).
