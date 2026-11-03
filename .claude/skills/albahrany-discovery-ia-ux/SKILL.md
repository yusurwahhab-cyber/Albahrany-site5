---
name: albahrany-discovery-ia-ux
description: Use at the start of the Albahrany Group rebuild and whenever scope, page structure, navigation, labels, visitor journeys, or inquiry/contact flows are being decided. Covers requirements discovery, project planning, information architecture and UX. Do not use for visual styling or implementation.
---

# Discovery, information architecture and UX

Purpose: decide *what* the site must do and *how it is organized* before any design or code. Output is decisions and documents, not pages.

## Before deciding anything

1. Read `CLAUDE.md`, the page sources in `_build/pages/`, `sitemap.xml`, and the navigation in `_build/layout.html` (top bar, primary nav, specialist-services dropdown, footer).
2. Build a current-state inventory from the repo: each page, its purpose, its section outline, its inbound links, and every contact path (phone, WhatsApp, email, inquiry form). Facts come from the repo only.
3. List open questions for the owner. Ask; do not guess.

## Discovery (ask the owner, record answers)

- Business goals for the rebuild and how success will be judged.
- Target audiences (e.g. developers, contractors, consultants, facility owners) and what each needs to decide. Confirm audiences; do not assume.
- Scope: which pages stay, which are merged or added, what content exists versus must be supplied.
- Constraints: hosting (currently GitHub Pages, static), languages, budget/timeline, available photography, who maintains the site.
- Decisions log: keep a short dated list of decisions and rejected options in the repo (e.g. `docs/decisions.md`) once the owner approves creating it.

## Information architecture

- Preserve the existing model unless the owner approves a change: three main divisions (central cooling, fire protection, building management) plus supporting services (refrigeration, after-sales, TAB, energy efficiency, IAQ, tri-generation), projects, about, contact.
- Propose any restructuring as a diagram or list of old URL → new role, and flag every URL impact (see `albahrany-seo-migration-deploy`).
- Keep nav labels short, consistent between pages, and identical in meaning across Arabic and English.
- Every service page links to: related services, relevant projects, and a contact/inquiry path. Every page is reachable in two clicks from home.

## UX

- Map journeys for each confirmed audience: arrive → understand the division → see proof (projects) → contact. Identify dead ends.
- Contact paths must work on mobile first (tap-to-call, WhatsApp, email). Keep the inquiry form short; note that it currently has no backend (hands off to WhatsApp/email) and ask before proposing one.
- Projects: define how visitors filter or find work by sector or division; only show projects that exist in the repo.

## Present before building

Summarize the proposed structure, journeys, and open decisions in plain language and wait for approval before design or implementation begins.
