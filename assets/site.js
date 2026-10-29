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
  var placed   = document.querySelectorAll('[data-ar-placeholder]');

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
    for (var m=0;m<placed.length;m++){ placed[m].setAttribute('placeholder', placed[m].getAttribute('data-'+lang+'-placeholder')); }
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

  /* ---- luminous flowing lines in the hero ---- */
  var canvas = document.getElementById('heroLuminousCanvas');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (ctx) {
    var width = 0, height = 0, t = 0, frame = 0, visible = true;
    var LINES = 5, SPEED = 0.0016;

    function resize(){
      var parent = canvas.parentElement || document.body;
      width  = canvas.width  = parent.clientWidth  || window.innerWidth;
      height = canvas.height = parent.clientHeight || window.innerHeight;
      if (!frame) draw();
    }

    function draw(){
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < LINES; i++) {
        var offset = i * 0.45;
        var waveHeight = height * 0.18;
        var baseY = height * 0.48 + (i - LINES / 2) * 55;

        var grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, 'rgba(217, 155, 53, 0.08)');
        grad.addColorStop(0.35, 'rgba(49, 176, 203, 0.45)');
        grad.addColorStop(0.75, 'rgba(18, 133, 168, 0.20)');
        grad.addColorStop(1, 'rgba(7, 28, 46, 0.02)');

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6 + (i % 2) * 1.2;
        ctx.shadowColor = '#31b0cb';
        ctx.shadowBlur = 14 + i * 3;
        ctx.moveTo(0, baseY + Math.sin(t + offset) * waveHeight);
        for (var x = 0; x <= width; x += 35) {
          var progress = x / width;
          var y = baseY +
                  Math.sin(t + offset + progress * 4.2) * waveHeight * Math.sin(progress * Math.PI) +
                  Math.cos(t * 0.75 + offset * 1.3 + progress * 2.8) * (waveHeight * 0.35);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    function loop(){
      frame = 0;
      if (!visible || document.hidden) return;
      t += SPEED;
      draw();
      frame = requestAnimationFrame(loop);
    }
    function start(){ if (!reduceMotion && !frame) frame = requestAnimationFrame(loop); }

    window.addEventListener('resize', resize);
    resize();

    /* only animate while the hero is on screen and the tab is visible */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(entries){
        visible = entries[0].isIntersecting;
        if (visible) start();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) start(); });
    start();
  }

  /* ---- project category filter ---- */
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

  function fieldValue(id){
    var el = document.getElementById(id);
    if (!el) return '';
    if (el.tagName === 'SELECT') return el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : '';
    return el.value.trim();
  }

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function(e){
      e.preventDefault();
      var ar = document.documentElement.lang === 'ar';
      var lines = [
        ar ? 'طلب دراسة فنية أو تسعير مشروع' : 'Project study / quotation request',
        (ar ? 'الاسم: ' : 'Name: ') + fieldValue('clientName'),
        (ar ? 'الهاتف: ' : 'Phone: ') + fieldValue('clientPhone'),
        (ar ? 'البريد: ' : 'Email: ') + fieldValue('clientEmail'),
        (ar ? 'المنظومة المطلوبة: ' : 'Requested system: ') + fieldValue('projectType')
      ];
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
      if (inquirySuccess) inquirySuccess.style.display = 'block';
    });
  }

  var resetInquiryBtn = document.getElementById('resetInquiryBtn');
  if (resetInquiryBtn && inquiryForm && inquirySuccess) {
    resetInquiryBtn.addEventListener('click', function(){
      inquirySuccess.style.display = 'none';
      inquiryForm.hidden = false;
    });
  }
})();
