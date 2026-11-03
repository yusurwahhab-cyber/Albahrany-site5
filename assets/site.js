/* Albahrany Group — shared behaviour
   - Arabic is the page's default language (text in the HTML).
   - English text sits in data-en / data-en-label / data-en-alt / data-en-placeholder / data-en-title.
   - Blocks with data-lang="ar" / data-lang="en" are shown for their language only.
   - The visitor's choice is remembered in localStorage ("ab-lang"). */
(function () {
  var root = document.documentElement;
  var KEY = 'ab-lang';
  var ATTRS = [['data-en-label', 'aria-label'], ['data-en-alt', 'alt'], ['data-en-placeholder', 'placeholder'], ['data-en-title', 'title']];

  /* ---------- language ---------- */
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  each('[data-en]', function (el) { if (!el.hasAttribute('data-ar')) el.setAttribute('data-ar', el.textContent); });
  ATTRS.forEach(function (pair) {
    each('[' + pair[0] + ']', function (el) {
      var arKey = pair[0].replace('data-en', 'data-ar');
      if (!el.hasAttribute(arKey)) el.setAttribute(arKey, el.getAttribute(pair[1]) || '');
    });
  });

  var I18N = window.SITE_I18N || {};
  function setMeta(sel, value) { var m = document.querySelector(sel); if (m && value) m.setAttribute('content', value); }

  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    each('[data-en]', function (el) { el.textContent = el.getAttribute('data-' + lang); });
    ATTRS.forEach(function (pair) {
      var key = pair[0].replace('data-en', 'data-' + lang);
      each('[' + pair[0] + ']', function (el) { el.setAttribute(pair[1], el.getAttribute(key)); });
    });
    each('[data-lang]', function (el) { el.hidden = el.getAttribute('data-lang') !== lang; });
    if (I18N.title && I18N.title[lang]) document.title = I18N.title[lang];
    if (I18N.desc) {
      setMeta('meta[name="description"]', I18N.desc[lang]);
      setMeta('meta[property="og:description"]', I18N.desc[lang]);
      setMeta('meta[name="twitter:description"]', I18N.desc[lang]);
    }
    if (I18N.title) {
      setMeta('meta[property="og:title"]', I18N.title[lang]);
      setMeta('meta[name="twitter:title"]', I18N.title[lang]);
    }
    setMeta('meta[property="og:locale"]', lang === 'ar' ? 'ar_IQ' : 'en_US');
    setMeta('meta[property="og:locale:alternate"]', lang === 'ar' ? 'en_US' : 'ar_IQ');
    var btn = document.getElementById('langBtn');
    if (btn) {
      btn.textContent = lang === 'ar' ? 'English' : 'عربي';
      btn.setAttribute('lang', lang === 'ar' ? 'en' : 'ar');
      btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    }
    syncMenuLabel();
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }
  window.AB_LANG = function () { return root.lang === 'en' ? 'en' : 'ar'; };

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('siteNav');
  var header = document.getElementById('siteHeader');

  function syncMenuLabel() {
    if (!menuBtn) return;
    var open = menuBtn.getAttribute('aria-expanded') === 'true';
    var en = root.lang === 'en';
    menuBtn.setAttribute('aria-label', open ? (en ? 'Close menu' : 'إغلاق القائمة') : (en ? 'Open menu' : 'فتح القائمة'));
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
    if (moreBtn && moreBtn.getAttribute('aria-expanded') === 'true') { setMore(false); moreBtn.focus(); return; }
    if (menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- header shadow ---------- */
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- project filter ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var rows = document.querySelectorAll('[data-sector]');
  var status = document.getElementById('filterStatus');
  function updateStatus() {
    if (!status) return;
    var n = 0;
    Array.prototype.forEach.call(rows, function (r) { if (!r.hidden) n++; });
    status.textContent = root.lang === 'en' ? ('Showing ' + n + ' of ' + rows.length + ' projects') : ('عرض ' + n + ' من ' + rows.length + ' مشروعاً');
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
  try { if (localStorage.getItem(KEY) === 'en') saved = 'en'; } catch (e) {}
  setLang(saved);
  var langBtn = document.getElementById('langBtn');
  if (langBtn) langBtn.addEventListener('click', function () { setLang(root.lang === 'ar' ? 'en' : 'ar'); });
})();
