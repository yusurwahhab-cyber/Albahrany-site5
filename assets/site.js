(function(){
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

  function meta(sel, value){
    var m = document.querySelector(sel);
    if (m && value) m.setAttribute('content', value);
  }
  function setLang(lang){
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
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
    if (btn) btn.textContent = (lang === 'ar') ? 'English' : 'عربي';
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  var saved = 'ar';
  try { if (localStorage.getItem(STORE) === 'en') saved = 'en'; } catch (e) {}
  setLang(saved);

  if (btn) {
    btn.addEventListener('click', function(){
      setLang(document.documentElement.lang === 'ar' ? 'en' : 'ar');
    });
  }

  /* ---- mobile menu + services dropdown ---- */
  var menuBtn = document.getElementById('menuBtn');
  var nav     = document.getElementById('nav');
  var drops   = document.querySelectorAll('.drop-toggle');

  function closeDrops(){
    for (var i=0;i<drops.length;i++){ drops[i].setAttribute('aria-expanded','false'); }
  }
  function closeMenu(){
    if (nav) nav.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded','false');
    closeDrops();
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeDrops();
    });
    nav.addEventListener('click', function(e){
      if (e.target.closest('a')) closeMenu();
    });
  }

  for (var d=0; d<drops.length; d++){
    drops[d].addEventListener('click', function(e){
      e.stopPropagation();
      var open = this.getAttribute('aria-expanded') === 'true';
      closeDrops();
      this.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  }

  document.addEventListener('click', function(e){
    if (!e.target.closest('.has-drop')) closeDrops();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){ closeDrops(); closeMenu(); }
  });
})();
