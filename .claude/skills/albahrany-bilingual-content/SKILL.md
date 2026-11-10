---
name: albahrany-bilingual-content
description: Use when writing, editing, translating or reviewing any Albahrany Group copy, labels, calls to action, meta text, or when touching language switching, RTL/LTR layout behavior, or direction-sensitive components. Ensures Arabic-first, accurate, consistent Arabic and English.
---

# Bilingual content and RTL/LTR behavior

Purpose: every page reads naturally in Arabic and English, behaves correctly in both directions, and says only what the company can support.

## How language works today

- Default `lang="ar" dir="rtl"`; English is a client-side toggle on the same URL. Arabic is the element's own text; English goes in `data-en` (plus `data-en-label`, `-alt`, `-placeholder`, `-title`). `assets/site.js` captures the Arabic automatically. An element with `data-en` must contain text only (no child tags) — wrap icons and text separately. Preference is stored in `localStorage` key `ab-lang`. `python3 _build/build.py --check` flags any Arabic text without English.
- Kurdish (Sorani, `lang="ckb"`, RTL) is a third client-side language. Its text is in `_build/i18n/ku.json`, keyed by the English string; the build writes `data-ku` / `data-ku-*`. When English copy changes, update the matching key there. JS strings carry `ar`/`en`/`ku`. Kurdish follows Arabic layout rules (RTL, no uppercase/letter-spacing) and needs native-speaker review before being treated as final.
- Page title and meta description come from the `title`/`desc` pair in each page's JSON header in `_build/pages/`. There are no separate English URLs or `hreflang`.
- Read `assets/site.js` and a service page before changing any of this. If the owner wants English to be indexable (separate URLs), that is a major decision: present it, with SEO consequences (see `albahrany-seo-migration-deploy`), before doing anything.

## Content accuracy

- Source of truth is the existing repo content. Never invent services, projects, clients, partners, numbers, years, certifications, standards, or contact details. Do not strengthen existing claims ("leading", "best", "certified") without evidence in the repo.
- If copy needs a fact that is not in the repo, list it as a question for the owner and leave a clearly marked placeholder only in drafts, never in shipped pages.
- Keep technical terms and brand/partner names exactly as the repo spells them.

## Writing rules

- Arabic-first: write the Arabic as native copy, then the English as equivalent copy, not as literal word-for-word translation. Modern Standard Arabic, concise, professional.
- Same meaning, same structure, same calls to action in both languages. Same label for the same thing everywhere (e.g. nav item = page title = breadcrumb).
- Calls to action are specific and honest ("Request a technical study / quotation"), matching what the form and contact paths actually do.
- Keep a glossary of key terms (both languages) in the repo once approved, and reuse it.

## Direction-safe implementation

- Use logical CSS properties; avoid `left/right` and fixed physical offsets.
- Phone numbers, emails, URLs, model numbers, and Latin names inside Arabic text get `dir="ltr"` (or `<bdi>`); numerals stay consistent within a page.
- Mirror directional icons and carousels in RTL; do not mirror logos, photos, or charts.
- Never apply uppercase or letter-spacing to Arabic. Choose fonts and line-heights per language.
- Every user-visible string, `aria-label`, `alt`, placeholder, validation message, and form-generated message must exist in both languages. Check JS-generated strings too (e.g. the WhatsApp message in `site.js`).
- Language toggle: keyboard-operable, labeled in the *other* language, `lang` attribute on the toggle, and `html[lang]`/`dir` updated together.

## Check

For each changed page: view in AR and EN, confirm no missing translations, no flipped numbers or punctuation, no overflow, and that metadata matches the visible language. Then run `albahrany-qa-review`.
