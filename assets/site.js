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

  /* ---- hero services panel ---- */
  var svcToggle = document.getElementById('svcToggle');
  var svcPanel  = document.getElementById('svcPanel');

  function setSvc(open){
    if (!svcToggle || !svcPanel) return;
    svcToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    svcPanel.hidden = !open;
  }

  if (svcToggle && svcPanel) {
    setSvc(false);
    svcToggle.addEventListener('click', function(){
      var open = svcToggle.getAttribute('aria-expanded') !== 'true';
      setSvc(open);
      /* pull the button fully inside the scroller so the panel reads as its own */
      if (open && svcToggle.scrollIntoView) {
        svcToggle.scrollIntoView({block:'nearest', inline:'nearest', behavior:'smooth'});
      }
    });
    svcPanel.addEventListener('click', function(e){
      if (e.target.closest('a')) setSvc(false);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && svcToggle.getAttribute('aria-expanded') === 'true') {
        setSvc(false);
        svcToggle.focus();
      }
    });
  }
})();
