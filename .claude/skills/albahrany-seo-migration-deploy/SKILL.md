---
name: albahrany-seo-migration-deploy
description: Use for anything affecting Albahrany Group search visibility or URLs or hosting - metadata, canonical and Open Graph tags, JSON-LD structured data, sitemap and robots, internal links, renaming or moving pages, redirects, GitHub Pages and domain configuration, pre-deploy checks, and rollback.
---

# SEO, URL migration and deployment

Purpose: keep search visibility and links intact through the rebuild, and release safely.

## Current state (verify again before relying on it)

- Hosting: GitHub Pages, custom domain `albahranygroup.com` via `CNAME`; no workflow files; deployment is whatever the repo's Pages settings use (confirm branch/folder with the owner in GitHub settings; the repo itself does not show it).
- 14 public URLs at the site root with the `.html` extension (the 13 original pages plus `services.html`), all in `sitemap.xml`, which `_build/build.py` regenerates (set `LASTMOD` there); `404.html` is `noindex` and excluded. `robots.txt` allows all and points to the sitemap. `_config.yml` excludes `CLAUDE.md` from publishing.
- Every page's canonical, Open Graph/Twitter tags, BreadcrumbList and page JSON-LD are generated from the JSON header of its source in `_build/pages/` (the home page declares the `HVACBusiness`). No `hreflang`: English is a client-side toggle on the same URL, so search engines see the Arabic content.
- `index.html` contains a Google site-verification tag; keep it.

## URL rules

- Treat all 14 current URLs as permanent. Do not rename or move them unless the owner approves.
- GitHub Pages cannot do server-side redirects. If a URL must change, the options are: keep the old file as a small page with `<link rel="canonical">` to the new URL, `<meta http-equiv="refresh">` and a visible link, or move hosting to a platform with real 301 support. Present the trade-offs and get approval first, and record old → new in a migration table.
- Old homepage anchors (`#process`, `#products`, `#why`) are redirected in `site.js`; service pages keep their original section ids. Preserve that behavior or replace it deliberately.

## On-page SEO

- Per page: unique `title` and meta description in Arabic matching the visible content, one `h1`, canonical, Open Graph/Twitter images with alt text, accurate `og:locale`.
- Structured data must match visible content and repo facts only: organization, services, breadcrumbs where useful. No invented ratings, reviews, addresses, or opening hours. Validate JSON syntax locally; use external validators only with the owner's approval.
- Internal links: descriptive anchor text, no broken links, every page linked from nav or related-content sections.
- Sitemap: update `<loc>` and `<lastmod>` when URLs or content change; every canonical URL listed, nothing else.
- If English indexing is wanted, it requires separate URLs and `hreflang`; that is a major decision to present first (see `albahrany-bilingual-content`).

## Deployment and handoff

- Do not push or deploy unless the owner explicitly asks.
- Pre-release checklist: run `albahrany-qa-review`; confirm `CNAME` unchanged, sitemap/robots correct, canonical URLs use the production domain, asset paths work from the site root, HTTPS enforced in the repo's Pages settings (owner to confirm).
- Rollback: releases are Git commits; tag the last known-good commit before release, and rollback is reverting to that tag/commit on the publishing branch. Note DNS/domain settings are outside the repo and must not be changed during rollback.
- After release (when authorized): check the live homepage and a service page, the sitemap, robots, and the language toggle; ask the owner to re-submit the sitemap in Search Console.
