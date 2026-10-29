(function(){
  var root = document.documentElement;

  /* ---- language (Arabic default, English stored per visitor) ---- */
  var STORE = 'ab-lang';
  var meta_ = {
    title: {ar:'مجموعة البحراني', en:'Albahrany Group'},
    desc:  {ar:'', en:''}
  };
  if (window.SITE_I18N) {
    if (window.SITE_I18N.title) meta_.title = window.SITE_I18N.title;
    if (window.SITE_I18N.desc)  meta_.desc  = window.SITE_I18N.desc;
  }

  var btn      = document.getElementById('langBtn');
  var nodes    = document.querySelectorAll('[data-ar]');
  var labelled = document.querySelectorAll('[data-ar-label]');
  var alted    = document.querySelectorAll('[data-ar-alt]');
  var placed   = document.querySelectorAll('[data-ar-placeholder]');
  var menuBtn  = document.getElementById('menuBtn');

  function meta(sel, value){
    var m = document.querySelector(sel);
    if (m && value) m.setAttribute('content', value);
  }
  function setLang(lang){
    root.lang = lang;
    root.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.title = meta_.title[lang];
    meta('meta[name="description"]', meta_.desc[lang]);
    meta('meta[property="og:title"]', meta_.title[lang]);
    meta('meta[property="og:description"]', meta_.desc[lang]);
    meta('meta[name="twitter:title"]', meta_.title[lang]);
    meta('meta[name="twitter:description"]', meta_.desc[lang]);
    meta('meta[property="og:locale"]', lang === 'ar' ? 'ar_IQ' : 'en_US');
    meta('meta[property="og:locale:alternate"]', lang === 'ar' ? 'en_US' : 'ar_IQ');
    for (var i=0;i<nodes.length;i++){ nodes[i].textContent = nodes[i].getAttribute('data-'+lang); }
    for (var j=0;j<labelled.length;j++){ labelled[j].setAttribute('aria-label', labelled[j].getAttribute('data-'+lang+'-label')); }
    for (var k=0;k<alted.length;k++){ alted[k].setAttribute('alt', alted[k].getAttribute('data-'+lang+'-alt')); }
    for (var m=0;m<placed.length;m++){ placed[m].setAttribute('placeholder', placed[m].getAttribute('data-'+lang+'-placeholder')); }
    if (btn) {
      btn.textContent = (lang === 'ar') ? 'English' : 'عربي';
      btn.setAttribute('lang', lang === 'ar' ? 'en' : 'ar');
    }
    if (menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') {
      menuBtn.setAttribute('aria-label', lang === 'ar' ? 'إغلاق القائمة' : 'Close menu');
    }
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  var saved = 'ar';
  try { if (localStorage.getItem(STORE) === 'en') saved = 'en'; } catch (e) {}
  setLang(saved);

  if (btn) {
    btn.addEventListener('click', function(){
      setLang(root.lang === 'ar' ? 'en' : 'ar');
    });
  }

  /* ---- header: shadow once the page scrolls ---- */
  var header = document.getElementById('siteHeader');
  function onScroll(){ if (header) header.classList.toggle('is-scrolled', window.scrollY > 4); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- mobile menu ---- */
  var nav = document.getElementById('primaryNav');
  function setMenu(open){
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var lang = root.lang === 'en' ? 'en' : 'ar';
    menuBtn.setAttribute('aria-label', open ? (lang === 'ar' ? 'إغلاق القائمة' : 'Close menu') : menuBtn.getAttribute('data-' + lang + '-label'));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function(){
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function(){ if (window.innerWidth > 1080) setMenu(false); });
  }

  /* ---- project sector filter ---- */
  var filterBtns = document.querySelectorAll('.proj-filter-btn');
  var projGroups = document.querySelectorAll('.proj-group');
  for (var f = 0; f < filterBtns.length; f++) {
    filterBtns[f].addEventListener('click', function(){
      var cat = this.getAttribute('data-filter');
      for (var b = 0; b < filterBtns.length; b++) {
        filterBtns[b].classList.toggle('active', filterBtns[b] === this);
        filterBtns[b].setAttribute('aria-pressed', filterBtns[b] === this ? 'true' : 'false');
      }
      for (var g = 0; g < projGroups.length; g++) {
        projGroups[g].hidden = !(cat === 'all' || projGroups[g].classList.contains('group-' + cat));
      }
    });
  }

  /* ---- project inquiry form: hand the request to WhatsApp (email as fallback) ---- */
  var WA_NUMBER = '9647734114077';
  var MAIL_TO   = 'Mahmood@albahranygroup.com';
  var inquiryForm    = document.getElementById('projectInquiryForm');
  var inquirySuccess = document.getElementById('inquirySuccessMsg');
  var inquiryMail    = document.getElementById('inquiryMailLink');

  function field(id){ return document.getElementById(id); }
  function fieldValue(id){
    var el = field(id);
    if (!el) return '';
    if (el.tagName === 'SELECT') return el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : '';
    return el.value.trim();
  }
  function setError(id, bad){
    var el = field(id), msg = field(id + 'Err');
    if (!el) return;
    if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    if (msg) msg.hidden = !bad;
  }
  function validate(){
    var name  = fieldValue('clientName');
    var phone = fieldValue('clientPhone').replace(/[\s()\-.]/g, '');
    var email = fieldValue('clientEmail');
    var errs = [];
    setError('clientName', !name);                         if (!name) errs.push('clientName');
    var phoneBad = !/^\+?\d{7,15}$/.test(phone);
    setError('clientPhone', phoneBad);                     if (phoneBad) errs.push('clientPhone');
    var emailBad = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setError('clientEmail', emailBad);                     if (emailBad) errs.push('clientEmail');
    return errs;
  }

  if (inquiryForm) {
    ['clientName','clientPhone','clientEmail'].forEach(function(id){
      var el = field(id);
      if (el) el.addEventListener('input', function(){ if (el.getAttribute('aria-invalid')) setError(id, false); });
    });

    inquiryForm.addEventListener('submit', function(e){
      e.preventDefault();
      var errs = validate();
      if (errs.length) { field(errs[0]).focus(); return; }

      var ar = root.lang === 'ar';
      var lines = [
        ar ? 'طلب دراسة فنية أو عرض سعر' : 'Technical study / quotation request',
        (ar ? 'الاسم: ' : 'Name: ') + fieldValue('clientName'),
        (ar ? 'الهاتف: ' : 'Phone: ') + fieldValue('clientPhone')
      ];
      var email = fieldValue('clientEmail');
      if (email) lines.push((ar ? 'البريد: ' : 'Email: ') + email);
      lines.push((ar ? 'المنظومة المطلوبة: ' : 'System required: ') + fieldValue('projectType'));
      var scope = fieldValue('projectScope');
      if (scope) lines.push((ar ? 'التفاصيل: ' : 'Details: ') + scope);
      var body = lines.join('\n');

      if (inquiryMail) {
        inquiryMail.href = 'mailto:' + MAIL_TO +
          '?subject=' + encodeURIComponent(lines[0]) +
          '&body=' + encodeURIComponent(body);
      }
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(body), '_blank', 'noopener');

      inquiryForm.reset();
      inquiryForm.hidden = true;
      if (inquirySuccess) { inquirySuccess.hidden = false; inquirySuccess.focus(); }
    });
  }

  var resetInquiryBtn = document.getElementById('resetInquiryBtn');
  if (resetInquiryBtn && inquiryForm && inquirySuccess) {
    resetInquiryBtn.addEventListener('click', function(){
      inquirySuccess.hidden = true;
      inquiryForm.hidden = false;
      field('clientName').focus();
    });
  }

  /* ---- gentle reveal for section content (skipped when motion is reduced) ---- */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, {rootMargin: '0px 0px -8% 0px'});
    for (var r = 0; r < reveals.length; r++) io.observe(reveals[r]);
  } else {
    for (var q = 0; q < reveals.length; q++) reveals[q].classList.add('is-in');
  }
})();
