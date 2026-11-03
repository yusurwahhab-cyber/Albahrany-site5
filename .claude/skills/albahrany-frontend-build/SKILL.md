---
name: albahrany-frontend-build
description: Use when implementing or refactoring Albahrany Group HTML, CSS or JavaScript, including semantic structure, accessibility, performance, reusable components, and image/asset handling (cropping, optimization, responsive sizes, alt text). Use after design decisions are approved.
---

# Frontend engineering, accessibility and assets

Purpose: clean, maintainable, accessible, fast static implementation of approved designs.

## Ground rules

- Read the files you will change, plus `assets/site.css`, `assets/site.js`, and one comparable page source in `_build/pages/`, before editing.
- Root `*.html` files are generated: edit `_build/layout.html`, `_build/partials/` or `_build/pages/`, then run `python3 _build/build.py --check` until it reports no problems.
- The site is static on GitHub Pages. Keep it dependency-light. Adding a build tool, framework, or package needs the owner's approval; propose it with reasons and the hosting impact first.
- Implement only approved designs. Do not "improve" unrelated content, structure, or URLs on the way.
- Keep page-specific CSS/JS minimal; shared patterns go in the shared stylesheet/script under existing tokens. Remove nothing that is still referenced.
- After changing shared CSS/JS, bump `VERSION` in `_build/build.py` (cache-busting) and rebuild.

## Architecture

- Semantic HTML: one `h1` per page, ordered headings, `header`/`nav`/`main`/`footer`, lists for nav, buttons for actions and links for navigation.
- Shared chrome (top bar, header, nav, footer, mobile contact bar) lives once in `_build/layout.html`; repeated blocks are partials. Reuse existing components and tokens before adding new ones.
- Progressive enhancement: content and navigation work without JS except the language toggle and form hand-off; keep `js` class gating as it is unless redesigned.

## Accessibility (WCAG 2.2 AA target)

- Keyboard: every control reachable and operable; logical tab order; Escape closes menus and returns focus (existing behavior must be preserved).
- Visible `:focus-visible` on all interactive elements; skip link kept and working.
- Contrast: text ≥ 4.5:1 (large text ≥ 3:1), UI components and focus rings ≥ 3:1, in both light and dark sections.
- Forms: label per field, programmatic error messages (`aria-invalid`, `aria-describedby`), error text in the active language, focus moved to first error, success state announced.
- Images: meaningful `alt` in both languages (`data-ar-alt`/`data-en-alt`); decorative images `alt=""`. Respect `prefers-reduced-motion`.
- Landmarks and `aria-label`s translated with the language toggle.

## Performance

- Images: width/height or aspect-ratio set, `loading="lazy"` below the fold, `srcset`/`sizes` with the existing WebP variants, LCP image not lazy. Font loading stays non-blocking with `display=swap`.
- No layout shift on language switch where avoidable. Keep JS small and free of third-party scripts unless approved.

## Images and assets

- Only use photos in `images/` or supplied by the owner; never present stock or generated imagery as real company projects.
- Before adding or replacing an image: confirm source and rights with the owner, crop to the layout's aspect ratio, export a JPG/WebP set at the sizes the layout needs, and write alt text in both languages.
- Never delete or overwrite an original; verify references (HTML, CSS, JSON-LD, Open Graph) before removing any file and report uncertain ones. `images/favicon-512.png` is currently unreferenced; leave it unless the owner decides otherwise.
- Image optimization tools are not installed in this project; ask before installing any.

## Finish

Self-review against `albahrany-qa-review` before reporting done; summarize files changed and why.
