---
name: albahrany-qa-review
description: Use before declaring any Albahrany Group change finished, and when asked to review, audit or QA the site. Checks visual consistency, responsive behavior, links, forms, Arabic/English behavior, accessibility, and content accuracy, and reports findings by severity.
---

# Visual and functional QA

Purpose: independent review of finished work against explicit criteria. Report problems; fix only what the task authorizes.

## Method

1. List the changed files (`git status`, `git diff --stat`) and the pages they affect, including shared CSS/JS and `_build/layout.html`/partials (which affect every page). Run `python3 _build/build.py --check` first.
2. Run local checks that need no installs: link/anchor/asset existence (a small `python3 -I` script reading `href`/`src`/`srcset`), sitemap vs. page list, JSON-LD parses, `lang`/`dir` present, canonical present. Do not install tools; ask first.
3. View pages in a browser when one is available (local static server such as `python3 -m http.server` bound to localhost) at ~360, 768, 1024 and 1440 px, in Arabic and English.
4. Record findings; do not silently fix unrelated issues.

## Criteria

- **Visual consistency:** same tokens, spacing, type, and components on every page; division accents used consistently; no clipped or overlapping content; images not stretched or pixelated.
- **Responsive:** no horizontal scroll at any width; nav drawer and dropdown work; touch targets ≥ 44px; readable text without zoom.
- **Functional:** every internal link and anchor resolves; tel/mailto/WhatsApp links correct; inquiry form validation, success and reset states work; project filter works; language toggle persists across pages and reloads; Escape/focus behavior works.
- **Arabic/English:** both languages complete (no stray untranslated strings, including `aria-label`, `alt`, placeholders, JS messages); `lang`/`dir` update together; numbers, phones and Latin names direction-safe; no uppercase/letter-spacing on Arabic; directional icons mirror.
- **Accessibility:** keyboard-only pass of nav, toggle, form and filter; visible focus; skip link; heading order; contrast thresholds; form labels and errors; meaningful alt text; reduced-motion respected.
- **Content accuracy:** every claim, number, name, contact detail, and project traces to existing repo content or an owner-confirmed source. Flag anything unsupported.
- **SEO/URLs:** all 14 public URLs still resolve; titles/descriptions/canonicals correct; sitemap matches; no redirect gaps.

## Report format

Findings grouped as Blocker / Major / Minor, each with page, viewport/language, what is wrong, and a suggested fix. End with what was checked, what could not be checked (and why), and a go / no-go recommendation.
