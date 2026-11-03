---
name: albahrany-brand-design-system
description: Use when defining or changing the Albahrany Group visual identity, design tokens, typography, spacing, components, page layouts (home, services, projects, about, contact, nav, footer, forms) or responsive behavior. Not for copywriting, SEO, or deployment.
---

# Brand, design system, UI and responsive design

Purpose: one consistent, distinctive visual language across every page and breakpoint.

## Start from what exists

- Read the token block at the top of `assets/site.css` and the component rules it feeds. Current tokens: navy and ice brand colors, a teal brand color, a gold accent, three division accents (hvac, fire, bms with light/dark/tint variants), IBM Plex Sans Arabic + IBM Plex Sans, spacing scale `--s1…--s9`, radii, shadows, `--container`, `--gutter`.
- Look at `images/logo*.png` and the existing photos. A rebuild may evolve the identity, but any change to logo, colors, or tone is the owner's decision: present options first.
- If the Anthropic `frontend-design` plugin is installed, use it for aesthetic craft (avoid generic template looks). Project constraints below take priority over its defaults.

## Direction

- Propose 2–3 visual directions (mood, palette, type, imagery, layout rhythm) with a short rationale tied to the company's real work: industrial building services, engineering credibility, Iraqi market. Do not claim attributes the repo does not support.
- Imagery: use only photographs and assets in the repo or supplied by the owner. No stock images presented as company projects.

## Design system rules

- All decisions become tokens first (color, type scale, spacing, radius, elevation, motion), then components. No one-off values in page markup.
- Define every component with its states: default, hover, focus-visible, active, disabled, error, loading where relevant. Components: header/nav/dropdown/mobile drawer, language toggle, buttons, cards, section headers, galleries, project filter, forms, footer.
- Keep division accents (hvac/fire/bms) consistent wherever a division is signalled.
- Type scales must be designed for Arabic first and checked in English: line-height, weight, and letter-spacing differ per script (never apply uppercase/letter-spacing to Arabic).
- Use logical properties (`margin-inline`, `inset-inline-start`, `text-align: start`) so RTL and LTR share one layout definition. Icons that imply direction (arrows, chevrons) must mirror in RTL.

## Page layouts

Define reusable layouts for: home, division/service page, projects, about, contact. A new page should be assemblable from existing components. Show layout proposals (sketch, outline, or static mock) to the owner before implementing.

## Responsive

- Design mobile-first; verify at ~360, 768, 1024 and 1280+ px. Existing breakpoints in `site.css` (e.g. 1199, 960, 860, 640, 520, 360) are the baseline; change them deliberately.
- Touch targets ≥ 44px, no horizontal scroll, readable line lengths, images with stable aspect ratios.

## Checks before handing off

Contrast (see `albahrany-frontend-build`), RTL/LTR parity, all states present, and consistency across pages. Then run `albahrany-qa-review`.
