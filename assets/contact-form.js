/* Albahrany Group — technical study / quotation request form.
   Behaviour depends on assets/form-config.js:
   - no endpoint: validate, then PREPARE the request for the visitor to send via WhatsApp/email.
     Nothing is sent and the page never says it was.
   - endpoint set: validate, POST to the endpoint, report "sent" only on a 2xx response. */
(function () {
  var form = document.getElementById('inquiryForm');
  if (!form) return;
  var cfg = window.ALBAHRANY_FORM || {};
  var online = !!(cfg.endpoint && /^https?:\/\//.test(cfg.endpoint));
  var lang = function () { return (window.AB_LANG && window.AB_LANG()) || 'ar'; };

  var T = {
    ar: {
      name: 'يرجى كتابة الاسم.',
      phone: 'يرجى كتابة رقم هاتف صحيح مع رمز الدولة إن أمكن، مثل \u2066+964 7XX XXX XXXX\u2069.',
      email: 'صيغة البريد الإلكتروني غير صحيحة، مثل name@example.com.',
      service: 'يرجى اختيار المنظومة أو الخدمة المطلوبة.',
      details: 'يرجى كتابة وصف مختصر للمشروع (10 أحرف على الأقل).',
      summary: function (n) { return n === 1 ? 'يوجد حقل واحد يحتاج إلى تصحيح.' : 'توجد ' + n + ' حقول تحتاج إلى تصحيح.'; },
      heading: 'طلب دراسة فنية أو عرض سعر',
      lName: 'الاسم', lOrg: 'الجهة أو الشركة', lPhone: 'الهاتف', lEmail: 'البريد الإلكتروني',
      lLoc: 'موقع المشروع', lService: 'المنظومة المطلوبة', lDetails: 'التفاصيل',
      sending: 'جارٍ الإرسال…', copied: 'تم نسخ نص الطلب.', copyFail: 'تعذّر النسخ — حدّد النص وانسخه يدوياً.'
    },
    en: {
      name: 'Please enter your name.',
      phone: 'Please enter a valid phone number, ideally with the country code, e.g. +964 7XX XXX XXXX.',
      email: 'This email address doesn’t look right, e.g. name@example.com.',
      service: 'Please choose the system or service you need.',
      details: 'Please describe the project briefly (at least 10 characters).',
      summary: function (n) { return n === 1 ? 'One field needs correcting.' : n + ' fields need correcting.'; },
      heading: 'Technical study / quotation request',
      lName: 'Name', lOrg: 'Organisation', lPhone: 'Phone', lEmail: 'Email',
      lLoc: 'Project location', lService: 'System required', lDetails: 'Details',
      sending: 'Sending…', copied: 'Request text copied.', copyFail: 'Copy failed — select the text and copy it manually.'
    }
  };

  function $(id) { return document.getElementById(id); }
  function val(id) {
    var el = $(id);
    if (!el) return '';
    if (el.tagName === 'SELECT') return el.value ? el.options[el.selectedIndex].text.trim() : '';
    return el.value.trim();
  }

  // show the notice and button label that match the mode
  Array.prototype.forEach.call(document.querySelectorAll('[data-mode]'), function (el) {
    var ok = el.getAttribute('data-mode') === (online ? 'online' : 'offline');
    el.setAttribute('data-mode-ok', ok ? '1' : '0');
    el.hidden = !ok;
  });
  // [data-lang] toggling in site.js must not reveal the other mode's blocks
  document.addEventListener('langchange', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-mode-ok="0"]'), function (el) { el.hidden = true; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-mode-ok="1"] [data-lang]'), function (el) { el.hidden = el.getAttribute('data-lang') !== lang(); });
    refreshErrors();
  });

  /* ---------- validation ---------- */
  var rules = {
    fName: function (v) { return v.length >= 2; },
    fPhone: function (v) { var d = v.replace(/[\s()\-.]/g, ''); return /^\+?\d{7,15}$/.test(d); },
    fEmail: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    fService: function () { return !!$('fService').value; },
    fDetails: function (v) { return v.length >= 10; }
  };
  var keys = { fName: 'name', fPhone: 'phone', fEmail: 'email', fService: 'service', fDetails: 'details' };
  var touched = {};

  function setError(id, bad) {
    var el = $(id), msg = $(id + 'Err');
    if (!el || !msg) return;
    if (bad) {
      el.setAttribute('aria-invalid', 'true');
      msg.textContent = T[lang()][keys[id]];
      msg.hidden = false;
    } else {
      el.removeAttribute('aria-invalid');
      msg.hidden = true;
      msg.textContent = '';
    }
  }
  function check(id) { var ok = rules[id](val(id)); setError(id, !ok); return ok; }
  function refreshErrors() {
    Object.keys(rules).forEach(function (id) { if ($(id).getAttribute('aria-invalid') === 'true') setError(id, true); });
    var s = $('formStatus');
    if (s && !s.hidden) s.textContent = T[lang()].summary(form.querySelectorAll('[aria-invalid="true"]').length);
  }

  Object.keys(rules).forEach(function (id) {
    var el = $(id);
    el.addEventListener('blur', function () { if (val(id) || touched[id]) { touched[id] = true; check(id); } });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') check(id); });
    el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') check(id); });
  });

  /* ---------- compose ---------- */
  function compose() {
    var t = T[lang()];
    var lines = [t.heading, ''];
    lines.push(t.lName + ': ' + val('fName'));
    if (val('fOrg')) lines.push(t.lOrg + ': ' + val('fOrg'));
    lines.push(t.lPhone + ': ' + val('fPhone'));
    if (val('fEmail')) lines.push(t.lEmail + ': ' + val('fEmail'));
    if (val('fLocation')) lines.push(t.lLoc + ': ' + val('fLocation'));
    lines.push(t.lService + ': ' + val('fService'));
    lines.push('', t.lDetails + ':', val('fDetails'));
    return lines.join('\n');
  }

  /* ---------- result panel ---------- */
  var result = $('inquiryResult');
  function showResult(state, text) {
    Array.prototype.forEach.call(result.querySelectorAll('[data-state]'), function (el) {
      el.hidden = el.getAttribute('data-state').split(' ').indexOf(state) === -1;
    });
    result.className = 'result is-' + state;
    var preview = $('resultPreview');
    if (preview) preview.value = text || '';
    var t = T[lang()];
    var subject = encodeURIComponent(t.heading + ' — ' + val('fName'));
    $('resultWa').href = 'https://wa.me/' + (cfg.whatsappNumber || '') + '?text=' + encodeURIComponent(text || '');
    $('resultMail').href = 'mailto:' + (cfg.handoffEmail || '') + '?subject=' + subject + '&body=' + encodeURIComponent(text || '');
    $('copyStatus').textContent = '';
    form.hidden = true;
    result.hidden = false;
    result.focus();
    result.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  $('resultEdit').addEventListener('click', function () {
    result.hidden = true;
    form.hidden = false;
    $('fName').focus();
  });
  $('resultNew').addEventListener('click', function () {
    form.reset();
    touched = {};
    Object.keys(rules).forEach(function (id) { setError(id, false); });
    result.hidden = true;
    form.hidden = false;
    $('fName').focus();
  });
  $('resultCopy').addEventListener('click', function () {
    var text = $('resultPreview').value;
    var done = function (ok) { $('copyStatus').textContent = T[lang()][ok ? 'copied' : 'copyFail']; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      $('resultPreview').select();
      try { done(document.execCommand('copy')); } catch (e) { done(false); }
    }
  });

  /* ---------- submit ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [];
    Object.keys(rules).forEach(function (id) { touched[id] = true; if (!check(id)) bad.push(id); });
    var s = $('formStatus');
    if (bad.length) {
      s.textContent = T[lang()].summary(bad.length);
      s.hidden = false;
      $(bad[0]).focus();
      return;
    }
    s.hidden = true;
    if ($('fWebsite') && $('fWebsite').value) return; // spam trap

    var text = compose();
    if (!online) { showResult('pending', text); return; }

    var btn = form.querySelector('[type="submit"]:not([hidden])');
    var label = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = T[lang()].sending;
    var data = new FormData();
    data.append('name', val('fName'));
    data.append('organisation', val('fOrg'));
    data.append('phone', val('fPhone'));
    data.append('email', val('fEmail'));
    data.append('location', val('fLocation'));
    data.append('service', val('fService'));
    data.append('details', val('fDetails'));
    data.append('language', lang());
    data.append('page', location.href);
    Object.keys(cfg.extraFields || {}).forEach(function (k) { data.append(k, cfg.extraFields[k]); });

    fetch(cfg.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { showResult(r.ok ? 'sent' : 'failed', text); })
      .catch(function () { showResult('failed', text); })
      .then(function () { btn.disabled = false; btn.innerHTML = label; });
  });
})();
