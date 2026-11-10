/* Albahrany Group — shared behaviour
   - Arabic is the page's default language (text in the HTML).
   - English text sits in data-en / data-en-label / data-en-alt / data-en-placeholder / data-en-title.
   - Kurdish (Sorani) sits in data-ku / data-ku-* (added by the build from _build/i18n/ku.json).
     Where an element has no Kurdish, the Arabic is shown (same script and direction).
   - Blocks with data-lang="ar" / "en" / "ku" are shown for their language only.
   - The visitor's choice is remembered in localStorage ("ab-lang"): "ar", "en" or "ku". */
(function () {
  var root = document.documentElement;
  var KEY = 'ab-lang';
  var LANGS = {
    ar: { html: 'ar', dir: 'rtl', code: 'AR', label: 'اللغة: العربية', locale: 'ar_IQ' },
    en: { html: 'en', dir: 'ltr', code: 'EN', label: 'Language: English', locale: 'en_US' },
    ku: { html: 'ckb', dir: 'rtl', code: 'KU', label: 'زمان: کوردی', locale: 'ckb_IQ' }
  };
  var ATTRS = [['label', 'aria-label'], ['alt', 'alt'], ['placeholder', 'placeholder'], ['title', 'title']];
  var current = 'ar';

  /* ---------- language ---------- */
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  // remember the Arabic originals before anything is swapped
  each('[data-en]', function (el) { if (!el.hasAttribute('data-ar')) el.setAttribute('data-ar', el.textContent); });
  ATTRS.forEach(function (pair) {
    each('[data-en-' + pair[0] + ']', function (el) {
      if (!el.hasAttribute('data-ar-' + pair[0])) el.setAttribute('data-ar-' + pair[0], el.getAttribute(pair[1]) || '');
    });
  });

  function pick(el, lang, suffix) {
    var s = suffix ? '-' + suffix : '';
    if (el.hasAttribute('data-' + lang + s)) return el.getAttribute('data-' + lang + s);
    return el.getAttribute('data-ar' + s);
  }

  var I18N = window.SITE_I18N || {};
  function setMeta(sel, value) { var m = document.querySelector(sel); if (m && value) m.setAttribute('content', value); }
  function i18n(field, lang) { return I18N[field] && (I18N[field][lang] || I18N[field].ar); }

  function setLang(lang) {
    if (!LANGS[lang]) lang = 'ar';
    current = lang;
    var L = LANGS[lang];
    root.lang = L.html;
    root.dir = L.dir;
    each('[data-en]', function (el) { el.textContent = pick(el, lang); });
    ATTRS.forEach(function (pair) {
      each('[data-en-' + pair[0] + ']', function (el) { el.setAttribute(pair[1], pick(el, lang, pair[0])); });
    });
    each('[data-lang]', function (el) { el.hidden = el.getAttribute('data-lang') !== lang; });
    if (i18n('title', lang)) document.title = i18n('title', lang);
    setMeta('meta[name="description"]', i18n('desc', lang));
    setMeta('meta[property="og:description"]', i18n('desc', lang));
    setMeta('meta[name="twitter:description"]', i18n('desc', lang));
    setMeta('meta[property="og:title"]', i18n('title', lang));
    setMeta('meta[name="twitter:title"]', i18n('title', lang));
    setMeta('meta[property="og:locale"]', L.locale);

    var btn = document.getElementById('langBtn');
    if (btn) btn.setAttribute('aria-label', L.label);
    var cur = document.getElementById('langCur');
    if (cur) cur.textContent = L.code;
    each('[data-set-lang]', function (b) {
      if (b.getAttribute('data-set-lang') === lang) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    syncMenuLabel();
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }
  window.AB_LANG = function () { return current; };

  /* ---------- language menu ---------- */
  var langBtn = document.getElementById('langBtn');
  var langMenu = document.getElementById('langMenu');
  function setLangMenu(open) {
    if (!langBtn || !langMenu) return;
    langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    langMenu.classList.toggle('is-open', open);
  }
  if (langBtn && langMenu) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = langBtn.getAttribute('aria-expanded') !== 'true';
      setLangMenu(open);
      if (open) { var a = langMenu.querySelector('[aria-current="true"]') || langMenu.querySelector('button'); if (a) a.focus(); }
    });
    langMenu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-set-lang]');
      if (!b) return;
      setLang(b.getAttribute('data-set-lang'));
      setLangMenu(false);
      langBtn.focus();
    });
    langMenu.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      var items = Array.prototype.slice.call(langMenu.querySelectorAll('button'));
      var i = items.indexOf(document.activeElement);
      items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
    });
    langMenu.addEventListener('focusout', function (e) { if (!langMenu.parentNode.contains(e.relatedTarget)) setLangMenu(false); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.lang')) setLangMenu(false); });
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('siteNav');
  var header = document.getElementById('siteHeader');
  var MENU = { ar: ['فتح القائمة', 'إغلاق القائمة'], en: ['Open menu', 'Close menu'], ku: ['کردنەوەی لیست', 'داخستنی لیست'] };

  function syncMenuLabel() {
    if (!menuBtn) return;
    var open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-label', MENU[current][open ? 1 : 0]);
  }
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    if (open && header) nav.style.setProperty('--nav-top', header.getBoundingClientRect().bottom + 'px');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    syncMenuLabel();
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1280) setMenu(false); });
  }

  /* ---------- "specialist services" disclosure ---------- */
  var moreBtn = document.querySelector('.nav-more-btn');
  var morePanel = moreBtn && document.getElementById(moreBtn.getAttribute('aria-controls'));
  function setMore(open) {
    if (!moreBtn || !morePanel) return;
    moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    morePanel.classList.toggle('is-open', open);
  }
  if (moreBtn && morePanel) {
    moreBtn.addEventListener('click', function (e) { e.stopPropagation(); setMore(moreBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('click', function (e) {
      if (window.innerWidth >= 1280 && !e.target.closest('.nav-more')) setMore(false);
    });
    morePanel.addEventListener('focusout', function (e) {
      if (window.innerWidth >= 1280 && !morePanel.parentNode.contains(e.relatedTarget)) setMore(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (langBtn && langBtn.getAttribute('aria-expanded') === 'true') { setLangMenu(false); langBtn.focus(); return; }
    if (moreBtn && moreBtn.getAttribute('aria-expanded') === 'true') { setMore(false); moreBtn.focus(); return; }
    if (menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- header shadow ---------- */
  var scrolled = null;
  function onScroll() {
    var s = window.scrollY > 40;
    if (header && s !== scrolled) { header.classList.toggle('is-scrolled', s); scrolled = s; }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll (CSS does nothing without .js or with reduced motion) ---------- */
  // repeated content blocks fade in as a group; only those below the first screen, so nothing visible flickers
  each('main .items, main .benefits, main .gallery, main .partners, main .steps, main .spec-list, main .checklist, main .layers', function (el) {
    if (!el.closest('.reveal, .reveal-stagger') && el.getBoundingClientRect().top > window.innerHeight) el.classList.add('reveal-stagger');
  });
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .chain');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- "on this page" links follow the reader ---------- */
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    Array.prototype.forEach.call(tocLinks, function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Array.prototype.forEach.call(tocLinks, function (a) { a.removeAttribute('aria-current'); });
        var a = byId[en.target.id];
        if (a) {
          a.setAttribute('aria-current', 'true');
          var ul = a.closest('ul');
          if (ul && ul.scrollWidth > ul.clientWidth) {
            var li = a.parentNode;
            ul.scrollTo({ left: li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2, behavior: 'smooth' });
          }
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- project filter ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var rows = document.querySelectorAll('[data-sector]');
  var status = document.getElementById('filterStatus');
  function updateStatus() {
    if (!status) return;
    var n = 0;
    Array.prototype.forEach.call(rows, function (r) { if (!r.hidden) n++; });
    status.textContent = {
      ar: 'عرض ' + n + ' من ' + rows.length + ' مشروعاً',
      en: 'Showing ' + n + ' of ' + rows.length + ' projects',
      ku: 'پیشاندانی ' + n + ' لە ' + rows.length + ' پڕۆژە'
    }[current];
  }
  Array.prototype.forEach.call(filterBtns, function (b) {
    b.addEventListener('click', function () {
      var cat = b.getAttribute('data-filter');
      Array.prototype.forEach.call(filterBtns, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      Array.prototype.forEach.call(rows, function (r) { r.hidden = !(cat === 'all' || r.getAttribute('data-sector') === cat); });
      updateStatus();
    });
  });
  document.addEventListener('langchange', updateStatus);

  /* ---------- small things ---------- */
  each('.year', function (el) { el.textContent = String(new Date().getFullYear()); });

  // older homepage anchors that now live on other pages
  var moved = { '#process': 'about.html#process', '#products': 'central-cooling.html#products', '#why': '#together' };
  if (document.body.classList.contains('page-home') && moved[location.hash]) location.replace(moved[location.hash]);

  /* ---------- start ---------- */
  var saved = 'ar';
  try { var v = localStorage.getItem(KEY); if (LANGS[v]) saved = v; } catch (e) {}
  setLang(saved);
})();
