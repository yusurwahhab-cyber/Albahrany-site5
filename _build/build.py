#!/usr/bin/env python3
"""Assemble the Albahrany Group website.

Python 3 standard library only - nothing to install.

    python3 _build/build.py          build every page into the site root
    python3 _build/build.py --check  build, then report problems (exit code 1 if any)

Sources:
    _build/layout.html      shared <head>, header, footer and scripts
    _build/partials/*.html  reusable blocks, inserted with <!--include:name-->
    _build/pages/*.html     one file per page: a JSON header, then the <main> content
    _build/i18n/ku.json     Kurdish (Sorani) translations, keyed by the English text.
                            Every data-en / data-en-* value gets a matching data-ku / data-ku-*.

The generated *.html files in the site root are what GitHub Pages publishes.
Edit the sources, not the generated files, then run this script.
"""
import glob
import html
import json
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "_build")
SITE = "https://albahranygroup.com/"
VERSION = "20261110"          # bump to force browsers to reload CSS/JS
LASTMOD = "2026-11-10"        # sitemap <lastmod>

ORG_ID = SITE + "#organization"


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def esc(s):
    return html.escape(s, quote=True)


# --------------------------------------------------------------------------
# Kurdish (Sorani): looked up by the English text, so page sources stay
# bilingual and the translation can be reviewed in one file.
# --------------------------------------------------------------------------
KU_PATH = os.path.join(SRC, "i18n", "ku.json")
KU = json.loads(read(KU_PATH)) if os.path.exists(KU_PATH) else {}
KU_MISSING = set()
KU_USED = set()


def ku(en):
    """Kurdish for an English string; records misses for --check."""
    key = " ".join(en.split())
    if key in KU and KU[key]:
        KU_USED.add(key)
        return KU[key]
    KU_MISSING.add(key)
    return None


def add_kurdish(page):
    def rep(m):
        attr, val = m.group(1), m.group(2)
        k = ku(html.unescape(val))
        if k is None:
            return m.group(0)
        return '%s="%s" %s="%s"' % (attr, val, attr.replace("data-en", "data-ku"), esc(k))
    return re.sub(r'\b(data-en(?:-label|-alt|-placeholder|-title)?)="([^"]*)"', rep, page)


# --------------------------------------------------------------------------
# images: <x-photo name="site-ductwork" alt-ar="..." alt-en="..." sizes="..." [eager] [class="..."]>
# becomes a <picture> using the WebP variants that exist in images/
# --------------------------------------------------------------------------
IMG_SIZES = {}


def image_info(name):
    if name not in IMG_SIZES:
        jpg = os.path.join(ROOT, "images", name + ".jpg")
        if not os.path.exists(jpg):
            raise SystemExit("missing image: images/%s.jpg" % name)
        w = h = None
        with open(jpg, "rb") as f:
            data = f.read()
        i = 2
        while i < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xC0, 0xC1, 0xC2):
                h = int.from_bytes(data[i + 5:i + 7], "big")
                w = int.from_bytes(data[i + 7:i + 9], "big")
                break
            seg = int.from_bytes(data[i + 2:i + 4], "big")
            i += 2 + seg
        variants = []
        for p in glob.glob(os.path.join(ROOT, "images", name + "-*.webp")):
            m = re.search(r"-(\d+)\.webp$", p)
            if m:
                variants.append(int(m.group(1)))
        IMG_SIZES[name] = (w, h, sorted(variants))
    return IMG_SIZES[name]


def photo(match, base):
    attrs = dict(re.findall(r'([\w-]+)="([^"]*)"', match.group(1)))
    flags = match.group(1)
    name = attrs["name"]
    w, h, variants = image_info(name)
    sizes = attrs.get("sizes", "100vw")
    eager = " eager" in flags or flags.strip().startswith("eager")
    srcset = ", ".join("%simages/%s-%d.webp %dw" % (base, name, v, v) for v in variants)
    cls = (' class="%s"' % attrs["class"]) if "class" in attrs else ""
    load = ' fetchpriority="high"' if eager else ' loading="lazy"'
    out = "<picture%s>" % cls
    if variants:
        out += '<source type="image/webp" srcset="%s" sizes="%s">' % (srcset, sizes)
    out += ('<img src="%simages/%s.jpg" width="%d" height="%d" alt="%s" data-en-alt="%s"%s decoding="async">'
            % (base, name, w, h, attrs["alt-ar"], attrs["alt-en"], load))
    return out + "</picture>"


# --------------------------------------------------------------------------
def page_files():
    return sorted(glob.glob(os.path.join(SRC, "pages", "*.html")))


def parse_page(path):
    raw = read(path)
    m = re.match(r"\s*<!--page\s*(\{.*?\})\s*-->\s*", raw, re.S)
    if not m:
        raise SystemExit("%s: missing <!--page {...} --> header" % path)
    meta = json.loads(m.group(1))
    meta["_body"] = raw[m.end():]
    meta["_src"] = os.path.relpath(path, ROOT)
    return meta


def include(text, depth=0):
    def rep(m):
        part = os.path.join(SRC, "partials", m.group(1) + ".html")
        return include(read(part), depth + 1)
    if depth > 4:
        raise SystemExit("include nesting too deep")
    return re.sub(r"<!--include:([\w-]+)-->", rep, text)


def crumbs_html(meta, base):
    crumbs = meta.get("crumbs")
    if not crumbs:
        return ""
    items = ['<li><a href="%s" data-en="Home">الرئيسية</a></li>' % (base or "./")]
    for c in crumbs[:-1]:
        items.append('<li><a href="%s%s" data-en="%s">%s</a></li>' % (base, c["href"], esc(c["en"]), esc(c["ar"])))
    last = crumbs[-1]
    items.append('<li><span aria-current="page" data-en="%s">%s</span></li>' % (esc(last["en"]), esc(last["ar"])))
    return ('<nav class="crumbs" aria-label="مسار التنقل" data-en-label="Breadcrumb"><ol>%s</ol></nav>'
            % "".join(items))


def jsonld(meta):
    graph = []
    url = SITE + ("" if meta["out"] == "index.html" else meta["out"])
    if meta.get("crumbs"):
        items = [{"@type": "ListItem", "position": 1, "name": "الرئيسية", "item": SITE}]
        for i, c in enumerate(meta["crumbs"], start=2):
            href = c.get("href") or meta["out"]
            items.append({"@type": "ListItem", "position": i, "name": c["ar"], "item": SITE + href})
        graph.append({"@type": "BreadcrumbList", "itemListElement": items})
    for node in meta.get("schema", []):
        node = json.loads(json.dumps(node).replace("{{url}}", url))
        graph.append(node)
    if not graph:
        return ""
    data = {"@context": "https://schema.org", "@graph": graph}
    return ('<script type="application/ld+json">\n%s\n</script>'
            % json.dumps(data, ensure_ascii=False, indent=2))


def build_page(meta, layout):
    out = meta["out"]
    is404 = out == "404.html"
    base = "/" if is404 else ""
    home = "/" if is404 else "./"
    url = SITE + ("" if out == "index.html" else out)

    body = include(meta["_body"])
    body = body.replace("<!--crumbs-->", crumbs_html(meta, base))
    page = layout.replace("<!--main-->", body)
    page = include(page)

    variables = {"base": base, "home": home, "v": VERSION, "url": url}
    for k, v in meta.get("vars", {}).items():
        variables[k] = esc(v)
    page = re.sub(r"\{\{(\w+)\}\}", lambda m: variables.get(m.group(1), m.group(0)), page)
    page = re.sub(r"<x-photo\b([^>]*)>(?:</x-photo>)?", lambda m: photo(m, base), page)

    # mark the current navigation item
    nav = meta.get("nav")
    if nav:
        page = page.replace('data-nav="%s"' % nav, 'data-nav="%s" aria-current="page"' % nav)
    if meta.get("navgroup"):
        page = page.replace('data-navgroup="%s"' % meta["navgroup"],
                            'data-navgroup="%s" data-current="true"' % meta["navgroup"])

    t, d = meta["title"], meta["desc"]
    og_img = SITE + meta.get("og_image", "images/band-chiller-room.jpg")
    head = []
    head.append("<title>%s</title>" % esc(t["ar"]))
    head.append('<meta name="description" content="%s">' % esc(d["ar"]))
    if meta.get("noindex"):
        head.append('<meta name="robots" content="noindex">')
    else:
        head.append('<link rel="canonical" href="%s">' % url)
        head.append('<meta property="og:site_name" content="Albahrany Group">')
        head.append('<meta property="og:type" content="%s">' % ("website" if out == "index.html" else "article"))
        head.append('<meta property="og:url" content="%s">' % url)
        head.append('<meta property="og:locale" content="ar_IQ">')
        head.append('<meta property="og:locale:alternate" content="en_US">')
        head.append('<meta property="og:title" content="%s">' % esc(t["ar"]))
        head.append('<meta property="og:description" content="%s">' % esc(d["ar"]))
        head.append('<meta property="og:image" content="%s">' % og_img)
        head.append('<meta name="twitter:card" content="summary_large_image">')
        head.append('<meta name="twitter:title" content="%s">' % esc(t["ar"]))
        head.append('<meta name="twitter:description" content="%s">' % esc(d["ar"]))
        head.append('<meta name="twitter:image" content="%s">' % og_img)
    if meta.get("head_extra"):
        head.append(meta["head_extra"])
    ld = jsonld(meta)
    if ld:
        head.append(ld)
    page = page.replace("<!--head-->", "\n".join(head))

    page = add_kurdish(page)
    # keep "FM-200" on one line (a plain hyphen may break inside right-to-left text)
    head_part, sep, body_part = page.partition("<body")
    page = head_part + sep + body_part.replace("FM-200", "FM\u2011200")
    t = dict(t, ku=ku(t["en"]) or t["ar"])
    d = dict(d, ku=ku(d["en"]) or d["ar"])
    i18n = {"title": t, "desc": d}
    page = page.replace("<!--i18n-->", "<script>window.SITE_I18N = %s;</script>"
                        % json.dumps(i18n, ensure_ascii=False))
    scripts = "".join('<script src="%sassets/%s?v=%s" defer></script>\n' % (base, s, VERSION)
                      for s in meta.get("scripts", []))
    page = page.replace("<!--scripts-->", scripts)
    page = page.replace("<!--body-class-->", esc(meta.get("body_class", "")))
    page = re.sub(r"\n{3,}", "\n\n", page)
    return page


def write_sitemap(metas):
    rows = []
    for m in sorted(metas, key=lambda m: -m.get("priority", 0.5)):
        if m.get("noindex"):
            continue
        loc = SITE + ("" if m["out"] == "index.html" else m["out"])
        rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n"
                    "    <priority>%.1f</priority>\n  </url>" % (loc, LASTMOD, m.get("priority", 0.5)))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(rows) + "\n</urlset>\n")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write(xml)


# --------------------------------------------------------------------------
# checks: translations, links, anchors, images, ids
# --------------------------------------------------------------------------
ARABIC = re.compile(r"[؀-ۿ]")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


class Checker(HTMLParser):
    def __init__(self, name):
        super().__init__(convert_charrefs=True)
        self.name = name
        self.stack = []          # (tag, attrs)
        self.problems = []
        self.ids = []
        self.links = []
        self.in_head = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "head":
            self.in_head = True
        if tag in ("a", "link") and a.get("href"):
            self.links.append(a["href"])
        if tag in ("img", "source", "script") and (a.get("src") or a.get("srcset")):
            for part in (a.get("src") or a.get("srcset")).split(","):
                self.links.append(part.strip().split(" ")[0])
        if tag == "img" and "alt" not in a:
            self.problems.append("img without alt: %s" % a.get("src"))
        if tag == "img" and a.get("alt") and "data-en-alt" not in a and ARABIC.search(a["alt"]):
            self.problems.append("img alt has no English: %s" % a.get("src"))
        for k in ("aria-label", "placeholder", "title"):
            if a.get(k) and ARABIC.search(a[k]) and ("data-en-" + k.replace("aria-", "")) not in a:
                self.problems.append("<%s %s> has no English version" % (tag, k))
        if self.stack and "data-en" in self.stack[-1][1]:
            self.problems.append("data-en element contains markup <%s>: %s"
                                 % (tag, self.stack[-1][1].get("data-en")[:50]))
        if tag not in VOID:
            self.stack.append((tag, a))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.in_head or not data.strip() or not ARABIC.search(data):
            return
        for tag, a in reversed(self.stack):
            if tag in ("script", "style", "title", "option") and tag != "option":
                return
            # text in an element with its own lang="" is fixed on purpose (e.g. the language menu)
            if "data-en" in a or "lang" in a or a.get("data-lang") == "ar" or tag in ("script", "style"):
                return
        self.problems.append("Arabic text without English: %r" % data.strip()[:60])


def check(outputs):
    problems = []
    ids = {}
    for name, text in outputs.items():
        c = Checker(name)
        c.feed(text)
        dup = {i for i in c.ids if c.ids.count(i) > 1}
        if dup:
            problems.append("%s: duplicate ids %s" % (name, sorted(dup)))
        ids[name] = set(c.ids)
        problems += ["%s: %s" % (name, p) for p in c.problems]
        outputs[name] = (text, c.links)
    for name, (text, links) in outputs.items():
        for href in links:
            if href.startswith(("http://", "https://", "mailto:", "tel:", "data:", "//")):
                continue
            path, _, frag = href.partition("#")
            path = path.split("?")[0]
            if path.startswith("/"):
                path = path[1:]
            if path in ("", "./"):
                path = name if href.startswith("#") else "index.html"
            if not os.path.exists(os.path.join(ROOT, path)):
                problems.append("%s: broken link %s" % (name, href))
            elif frag and path.endswith(".html") and path in ids and frag not in ids[path]:
                problems.append("%s: missing anchor %s" % (name, href))
    return problems


def main():
    layout = read(os.path.join(SRC, "layout.html"))
    metas = [parse_page(p) for p in page_files()]
    outputs = {}
    for meta in metas:
        text = build_page(meta, layout)
        with open(os.path.join(ROOT, meta["out"]), "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
        outputs[meta["out"]] = text
    write_sitemap(metas)
    print("built %d pages: %s" % (len(metas), ", ".join(sorted(outputs))))
    if "--check" in sys.argv:
        problems = check(dict(outputs))
        for p in problems:
            print("  ! " + p)
        for k in sorted(KU_MISSING):
            problems.append("no Kurdish for: %r" % k[:70])
            print("  ! no Kurdish for: %r" % k[:90])
        unused = sorted(set(KU) - KU_USED)
        if unused:
            print("  (note) %d unused Kurdish entries, e.g. %r" % (len(unused), unused[0][:60]))
        print("check: %s" % ("no problems found" if not problems else "%d problem(s)" % len(problems)))
        sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
