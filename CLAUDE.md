# Albahrany Group website

Marketing website for Albahrany Group (مجموعة البحراني), a building-services company in Iraq. Its three main service areas, which the site is built around, are:

1. Central cooling & HVAC (`central-cooling.html`), colour-coded blue.
2. Fire protection & suppression (`fire-protection.html`), colour-coded red.
3. Building management systems, BMS (`building-management.html`), colour-coded green. Call it "Building Management" or "Building Management Systems (BMS)". Never call it "data management".

Specialist services: refrigeration, after-sales, TAB, energy efficiency, IAQ and tri-generation. Public domain: `albahranygroup.com` (see `CNAME`).

## How the site is built

- Static HTML on GitHub Pages (deployed from the branch, with Jekyll). There is no framework and no package manager.
- **Pages are generated.** Edit the sources in `_build/`, never the root `*.html` files, then run:
  `python3 _build/build.py --check` (Python 3 standard library only).
  - `_build/layout.html` holds the shared `<head>`, top bar, header and navigation, footer, mobile contact bar and SVG icons.
  - `_build/partials/*.html` holds reusable blocks, inserted with `<!--include:name-->`: `cta`, `partners`, `process`, `projects-table` and `specialist`.
  - `_build/pages/*.html` has one file per page. Each starts with a JSON header (title/desc in ar+en, crumbs, nav key, schema, CTA text vars), followed by the `<main>` content.
  - `<x-photo name="…" alt-ar alt-en sizes>` expands to a `<picture>` using the existing WebP sizes in `images/`.
  - The build also writes `sitemap.xml`. The `--check` flag reports missing translations, broken links and anchors, duplicate ids, and images without bilingual alt text. It must show "no problems found".
- `assets/site.css` holds the design tokens (top of file) and all components. `assets/site.js` handles the language switch, navigation, project filter and old-anchor redirects.
- Contact form: `assets/contact-form.js` holds the logic and `assets/form-config.js` holds the **only** setting to edit.
- `_config.yml` keeps `CLAUDE.md` out of the published site. Folders starting with `_` or `.` are never published.

## Language

Arabic is the default (`lang="ar" dir="rtl"`). English is a client-side switch on the same URL:
- Arabic text lives in the element.
- English lives in `data-en`, with `data-en-label`, `data-en-alt`, `data-en-placeholder` and `data-en-title` for attributes.
- An element with `data-en` must contain text only, no child tags.
- The visitor's choice is stored in `localStorage` (`ab-lang`).

There are no separate English URLs and no `hreflang`. Changing that is an SEO decision for the owner. Use logical CSS properties. Phone numbers, emails and Latin names in Arabic text get `dir="ltr"`.

## Non-negotiable rules

1. **Company facts come only from this repo.** Do not invent or "improve" services, projects, clients, partners, numbers, years, certifications or contact details. Ask the owner when a fact is missing. Fire protection and BMS have no project list in the repo, so do not add one without owner-supplied facts.
2. **Both languages, everywhere.** Every visible string, `aria-label`, `alt` and form message needs Arabic and English.
3. **Keep public URLs.** The 14 public `.html` URLs (13 original pages plus `services.html`) are in the sitemap. GitHub Pages cannot redirect server-side, so any URL change needs an owner-approved plan. Keep the in-page anchor ids that older links use (`#systems`, `#choose`, `#products`, `#method`, `#faq`, `#process` and others).
4. **The contact form must never claim delivery it did not make.** With no endpoint it only prepares the message, and the visitor sends it by WhatsApp or email.
5. **Read before you design or edit**, and present major design or architecture changes to the owner first.
6. **No push, no deploy, no new dependencies or third-party plugins** without the owner's approval.
7. **Do not delete** images or content because they look unused. Verify references first. `images/favicon-512.png` is unreferenced but kept.

## Skills (in `.claude/skills/`)

- `albahrany-discovery-ia-ux`: goals, audiences, scope, site map, navigation, journeys, inquiry flows.
- `albahrany-brand-design-system`: visual direction, tokens, components, layouts, responsive behaviour.
- `albahrany-bilingual-content`: Arabic and English copy, RTL/LTR, language switching, claim accuracy.
- `albahrany-frontend-build`: implementation in `_build/`, accessibility, performance, images.
- `albahrany-seo-migration-deploy`: metadata, structured data, sitemap, URLs and redirects, GitHub Pages, rollback.
- `albahrany-qa-review`: visual, responsive, functional, language, accessibility and content review.

The official Anthropic `frontend-design` plugin may be used for visual craft. Where it differs from these rules, the project rules win.
