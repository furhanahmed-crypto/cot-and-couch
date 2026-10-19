# Design system — Premium showroom

Digital Window should feel like a **calm, high-end furniture showroom**: generous whitespace, confident typography, photography-led layouts. Catalogue UX takes cues from **Wakefit-style clarity** (filters, comparison-friendly cards, trust badges) but CTAs emphasize **visit, enquire, and speak to a specialist** — not flash sales or cart urgency.

---

## Brand personality

- **Premium** — restrained palette, no loud gradients or coupon aesthetics.
- **Tactile** — wood, fabric, and stone suggested through photography, not skeuomorphic UI.
- **Helpful** — clear specs, delivery copy, and human contact paths.
- **Modern Indian retail** — INR pricing, WhatsApp-friendly, mobile-first.

### Avoid

- Purple/violet gradients and generic “startup SaaS” hero blobs.
- **Green / teal** (not in brand).
- Broadsheet/newspaper editorial layouts that fight product scanning.
- Dark patterns (fake countdowns, forced signup walls before browse).

---

## Colour

Brand reference: cream, sand, espresso brown, terracotta orange (no green).

| Token | Hex | Usage |
|-------|-----|--------|
| Cream | `#F6F1EB` | Page background (light mode) |
| Sand | `#EBDED1` | Muted / secondary surfaces |
| Espresso | `#3E2723` | Primary brand, text, banners, admin shell |
| Terracotta | `#D47C4A` | Accent emphasis, prices, focus rings, CTAs in dark mode |
| White | `#FFFFFF` | Cards, modals, text on espresso banners |
| Error | shadcn destructive | Form errors only |

Map these in `globals.css`. Utility aliases: `--ink` → espresso, `--brass` → terracotta, `--stone` → cream (kept so existing `text-ink` / `text-brass` classes stay valid).

**Contrast:** body text must meet WCAG AA on cream and espresso; terracotta is for accents and short emphasis, not long paragraphs.

---

## Typography

| Role | Font | Weights | Usage |
|------|------|---------|--------|
| Display | **Fraunces** | 500–700 | Hero headlines, collection titles |
| UI / body | **Figtree** | 400–600 | Nav, buttons, forms, PLP metadata |

Load via `next/font/google` in root layout; expose `--font-display` and `--font-sans`. Headings use Fraunces with tight tracking; UI defaults to Figtree (`html { font-sans }`).

**Scale (guideline):**

- Hero: `text-4xl` → `text-6xl` responsive
- Section titles: `text-2xl` / `text-3xl`
- Product title: `text-lg` semibold
- Meta (SKU, dimensions): `text-sm` muted

---

## Layout & components

### Shop

- **Max width:** content `max-w-7xl` centered; full-bleed hero allowed.
- **PLP:** responsive grid (2 col mobile, 3–4 desktop); sticky filter drawer on mobile.
- **PDP:** large gallery left/top; sticky enquiry panel on desktop with primary CTA stack: Enquire → WhatsApp → Visit showroom.
- **Cards:** soft radius (`--radius-lg`), light shadow, brass 1px top or left accent optional on featured tiles.

### Admin

- Dense but readable: sidebar espresso, content on cream/white.
- Tables with zebra optional; actions right-aligned.
- Role demo: badge colour brass (Admin) vs muted (Team).

---

## Imagery

- Phase 1: **Unsplash** furniture/interior URLs in mock data (consistent aspect ratio 4:5 or 3:2 for PLP).
- Always provide alt text from product title + material.
- Use `sizes` on Next `Image` when images are local or configured remote patterns.

---

## Motion

- Subtle: `tw-animate-css` / light transitions on hover (scale ≤ 1.02).
- Respect `prefers-reduced-motion`.
- No parallax that harms mobile performance in Phase 1.

---

## Iconography

- `lucide-react` stroke icons, 1.5px feel, sized 16–20px inline with Figtree.

---

## Reference UX (Wakefit-inspired, adapted)

| Pattern | Adaptation for Cot & Couch |
|---------|----------------------------|
| Filter chips + sort | Same clarity; filters for material/room/price band |
| Product cards with rating | Optional; prefer “Handcrafted” / “Showroom piece” badges |
| Trust strip | Delivery & installation copy (SD-03), store locations |
| Sticky mobile CTA | “Enquire” not “Buy now” |

---

## Theming

- Default **light** (cream bg, espresso text, terracotta accents).
- **Dark:** near-black 950 surfaces (`#0c0a09` / `#09090b`), cream text, terracotta accents.
- Toggle in shop header; persist via `next-themes`.

---

## shadcn/ui

Use existing primitives under `src/components/ui/`. Customise tokens in `globals.css`, not one-off hex in components. Primary button: espresso fill, cream text (light) / terracotta fill (dark); secondary: sand / outline terracotta.

---

## File checklist for designers/devs

1. Apply brand CSS variables (replace default Geist-only scaffold when implementing).
2. Fraunces + Figtree in `layout.tsx`.
3. PLP/PDP Figma or walkthrough aligned to CF-03/CF-04.
4. Admin sidebar spec aligned to AD-xx modules.

See `RULES.md` for implementation constraints.
