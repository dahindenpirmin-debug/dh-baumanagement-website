// Navigation, Projektfilter, Formular-Vorbefüllung
(function () {
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  if (burger) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  // Referenzen: Suche, Filter (Kategorie, Art, Kanton, Jahre), Karte und Ansicht (Kacheln/Tabelle)
  var grid = document.getElementById('p-grid'), table = document.getElementById('p-table');
  if (grid) {
    var $ = function (id) { return document.getElementById(id); };
    var f = { q: $('f-q'), cat: $('f-cat'), type: $('f-type'), kt: $('f-kt'), von: $('f-von'), bis: $('f-bis') };
    var pins = [].slice.call(document.querySelectorAll('.refmap .pin')), sel = null, count = $('p-count'), empty = $('p-empty');
    var q = new URLSearchParams(location.search);
    if (q.get('kategorie')) f.cat.value = q.get('kategorie');
    if (q.get('art')) f.type.value = q.get('art');
    if (q.get('kanton')) f.kt.value = q.get('kanton').toUpperCase();
    var match = function (d, pin) {
      if (f.cat.value && d.cat !== f.cat.value) return false;
      if (f.type.value && d.type !== f.type.value) return false;
      if (f.kt.value && d.kt !== f.kt.value) return false;
      if (f.von.value && +d.bis < +f.von.value) return false;
      if (f.bis.value && +d.von > +f.bis.value) return false;
      var words = f.q.value.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) if (d.q.indexOf(words[i]) < 0) return false;
      if (pin && sel && sel.indexOf(d.slug) < 0) return false;
      return true;
    };
    var apply = function () {
      var n = 0, vis = {};
      grid.querySelectorAll('[data-slug]').forEach(function (el) { var ok = match(el.dataset, true); el.hidden = !ok; if (ok) n++; if (match(el.dataset, false)) vis[el.dataset.slug] = 1; });
      table.querySelectorAll('tr[data-slug]').forEach(function (el) { el.hidden = !match(el.dataset, true); });
      grid.querySelectorAll('.p-group').forEach(function (g) { g.hidden = !g.querySelector('[data-slug]:not([hidden])'); }); // leere Kategorie ausblenden
      count.textContent = n + ' ' + (n === 1 ? count.dataset.one : count.dataset.many);
      empty.hidden = n > 0;
      pins.forEach(function (p) {
        var s = p.dataset.slugs.split(','), any = s.some(function (x) { return vis[x]; });
        p.classList.toggle('off', !any); p.classList.toggle('sel', !!sel && sel.join() === s.join());
      });
    };
    // Karte: Kanton anklicken, zoomen (+/−), bei vergrösserter Karte ziehen
    var svg = $('refmap'), W = +svg.dataset.w, H = +svg.dataset.h, vb = { x: 0, y: 0, w: W, h: H }, anim = 0;
    var kts = [].slice.call(svg.querySelectorAll('.kt path.has')), scales = [].slice.call(svg.querySelectorAll('.pin .s'));
    var draw = function () {
      svg.setAttribute('viewBox', vb.x.toFixed(1) + ' ' + vb.y.toFixed(1) + ' ' + vb.w.toFixed(1) + ' ' + vb.h.toFixed(1));
      var k = W / vb.w; svg.classList.toggle('zoomed', k >= 2.2); svg.classList.toggle('pan', k > 1.01);
      var rw = svg.getBoundingClientRect().width || W, big = Math.max(1, Math.min(2.2, 560 / rw)); // auf schmalen Bildschirmen grössere Punkte
      scales.forEach(function (g) { g.setAttribute('transform', 'scale(' + (big / Math.sqrt(k)).toFixed(3) + ')'); });
    };
    var clamp = function (v) {
      v.w = Math.max(W / 10, Math.min(W, v.w)); v.h = v.w * H / W;
      v.x = Math.max(0, Math.min(W - v.w, v.x)); v.y = Math.max(0, Math.min(H - v.h, v.y)); return v;
    };
    var view = function (t, now) {
      t = clamp(t); cancelAnimationFrame(anim);
      if (now) { vb = t; draw(); return; }
      var a = { x: vb.x, y: vb.y, w: vb.w, h: vb.h }, t0 = null;
      var step = function (ts) {
        if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 350), e = 1 - Math.pow(1 - p, 3);
        vb = { x: a.x + (t.x - a.x) * e, y: a.y + (t.y - a.y) * e, w: a.w + (t.w - a.w) * e, h: a.h + (t.h - a.h) * e }; draw();
        if (p < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    };
    var zoom = function (fac) { var w = vb.w / fac; view({ x: vb.x + (vb.w - w) / 2, y: vb.y + (vb.h - w * H / W) / 2, w: w, h: w * H / W }); };
    var zoomKt = function () {
      var el = f.kt.value && svg.querySelector('.kt path[data-kt="' + f.kt.value + '"]');
      kts.forEach(function (p) { p.classList.toggle('sel', p === el); });
      if (!el) { view({ x: 0, y: 0, w: W, h: H }); return; }
      var b = el.getBBox(), w = Math.max(b.width * 1.5, b.height * 1.5 * W / H, W / 6);
      view({ x: b.x + b.width / 2 - w / 2, y: b.y + b.height / 2 - w * H / W / 2, w: w, h: w * H / W });
    };
    var moved = false, drag = null;
    svg.addEventListener('pointerdown', function (e) { moved = false; if (vb.w < W - 1) drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      if (moved) { var r = svg.getBoundingClientRect(); view({ x: drag.vx - dx * vb.w / r.width, y: drag.vy - dy * vb.h / r.height, w: vb.w, h: vb.h }, true); }
    });
    window.addEventListener('pointerup', function () { drag = null; });
    kts.forEach(function (p) {
      var go = function () { if (moved) return; f.kt.value = f.kt.value === p.dataset.kt ? '' : p.dataset.kt; sel = null; apply(); zoomKt(); };
      p.addEventListener('click', go);
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); moved = false; go(); } });
    });
    $('z-in').addEventListener('click', function () { zoom(1.6); });
    $('z-out').addEventListener('click', function () { zoom(1 / 1.6); });
    $('z-all').addEventListener('click', function () { view({ x: 0, y: 0, w: W, h: H }); });
    f.kt.addEventListener('change', zoomKt);
    Object.keys(f).forEach(function (k) { f[k].addEventListener(k === 'q' ? 'input' : 'change', apply); });
    pins.forEach(function (p) {
      var go = function () { if (moved) return; var s = p.dataset.slugs.split(','); sel = sel && sel.join() === s.join() ? null : s; apply(); };
      p.addEventListener('click', go);
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    $('f-reset').addEventListener('click', function () { Object.keys(f).forEach(function (k) { f[k].value = ''; }); sel = null; apply(); zoomKt(); });
    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.dataset.view === 'table';
        grid.hidden = t; table.hidden = !t;
        document.querySelectorAll('[data-view]').forEach(function (x) { x.classList.toggle('on', x === b); });
      });
    });
    draw(); window.addEventListener('resize', draw);
    apply(); if (f.kt.value) zoomKt();
  }

  // Formulare ohne Seitenwechsel (Rechner, Filter) nicht absenden
  document.querySelectorAll('form.tool-form, form.reffilter').forEach(function (fm) { fm.addEventListener('submit', function (e) { e.preventDefault(); }); });

  // Prüfung der Formulareingaben (Kontakt und Rechner-Anfrage): Pflichtfelder, E-Mail, Telefon,
  // Sicherheitsfrage und Mindestzeit gegen automatische Einsendungen. Ohne externe Dienste.
  var de = (document.documentElement.lang || 'de').slice(0, 2) === 'de';
  var TX = de ? { q: 'Sicherheitsfrage: Wie viel ist ', req: 'Bitte dieses Feld ausfüllen.', mail: 'Bitte eine gültige E-Mail-Adresse eingeben (z. B. name@firma.ch).', tel: 'Bitte eine gültige Telefonnummer eingeben.', msg: 'Bitte beschreiben Sie Ihr Vorhaben in mindestens zwei, drei Sätzen.', sum: 'Die Antwort auf die Sicherheitsfrage stimmt nicht.', fast: 'Das ging sehr schnell. Bitte prüfen Sie Ihre Angaben und senden Sie noch einmal.', top: 'Bitte die markierten Felder prüfen.' }
    : { q: 'Security question: what is ', req: 'Please fill in this field.', mail: 'Please enter a valid email address (e.g. name@company.com).', tel: 'Please enter a valid phone number.', msg: 'Please describe your project in at least two or three sentences.', sum: 'The answer to the security question is not correct.', fast: 'That was very quick. Please check your details and send again.', top: 'Please check the highlighted fields.' };
  document.querySelectorAll('form.contact, form.tool-lead').forEach(function (fm) {
    var t0 = Date.now(), a = 2 + Math.floor(Math.random() * 7), b = 1 + Math.floor(Math.random() * 8), btn = fm.querySelector('button[type=submit]');
    fm.setAttribute('novalidate', '');
    var wrap = document.createElement('label'); wrap.className = 'field check-q';
    wrap.innerHTML = '<span></span><input name="pruefung" inputmode="numeric" autocomplete="off" required maxlength="3">';
    wrap.firstChild.textContent = TX.q + a + ' + ' + b + '? *';
    var top = document.createElement('p'); top.className = 'form-err top'; top.hidden = true; top.setAttribute('role', 'alert');
    if (btn) { btn.parentNode.insertBefore(wrap, btn.previousElementSibling && btn.previousElementSibling.className === 'disclaimer' ? btn.previousElementSibling : btn); btn.parentNode.insertBefore(top, btn); }
    var mark = function (el, msg) {
      var box = el.closest('label') || el.parentNode, m = box.querySelector('.form-err');
      el.classList.toggle('bad', !!msg); el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && !m) { m = document.createElement('small'); m.className = 'form-err'; box.appendChild(m); }
      if (m) { m.textContent = msg || ''; m.hidden = !msg; }
      return !msg;
    };
    var check = function (el) {
      var v = el.value.trim(), n = el.name;
      if (el.required && !v) return mark(el, TX.req);
      if (n === 'email' && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) return mark(el, TX.mail);
      if (n === 'telefon' && v && (v.replace(/[^\d]/g, '').length < 9 || /[^\d\s+()\/.-]/.test(v))) return mark(el, TX.tel);
      if (n === 'nachricht' && el.required && v.length < 20) return mark(el, TX.msg);
      if (n === 'pruefung' && parseInt(v, 10) !== a + b) return mark(el, TX.sum);
      return mark(el, '');
    };
    var fields = function () { return [].slice.call(fm.querySelectorAll('input:not([type=hidden]):not([type=file]), textarea')).filter(function (el) { return el.name && el.name !== 'website'; }); };
    fm.addEventListener('blur', function (e) { if (e.target.name && e.target.classList.contains('bad')) check(e.target); }, true);
    fm.addEventListener('submit', function (e) {
      var bad = fields().filter(function (el) { return !check(el); }), fast = Date.now() - t0 < 4000;
      top.hidden = !bad.length && !fast; top.textContent = bad.length ? TX.top : fast ? TX.fast : '';
      if (bad.length || fast) { e.preventDefault(); e.stopImmediatePropagation(); if (bad[0]) bad[0].focus(); return; }
      if (!fm.classList.contains('contact') || !window.fetch) return;
      // Kontaktformular: im Hintergrund senden. Schlägt die Übermittlung fehl, geht die Nachricht nicht verloren:
      // Der Text bleibt stehen und ein E-Mail-Link mit dem Inhalt wird angeboten.
      e.preventDefault();
      var btn = fm.querySelector('button[type=submit]'), label = btn.textContent, box = fm.querySelector('.contact-msg');
      var val = function (n) { var el = fm.querySelector('[name=' + n + ']'); return el ? el.value.trim() : ''; };
      btn.disabled = true; btn.textContent = de ? 'Wird gesendet …' : 'Sending …'; box.hidden = true;
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(fm)).toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); location.href = fm.getAttribute('action'); })
        .catch(function () {
          var mail = (fm.querySelector('a[href^="mailto:"]') || { getAttribute: function () { return 'mailto:info@dh-baumanagement.ch'; } }).getAttribute('href').split('?')[0];
          var body = [val('nachricht'), '', val('name'), val('firma'), val('telefon'), val('email')].filter(function (x, i) { return x || i === 1; }).join('\n');
          var a = document.createElement('a'); a.href = mail + '?subject=' + encodeURIComponent((de ? 'Anfrage: ' : 'Enquiry: ') + val('vorhaben')) + '&body=' + encodeURIComponent(body);
          a.textContent = de ? 'Nachricht als E-Mail senden' : 'Send the message by email';
          box.textContent = de ? 'Die Nachricht konnte gerade nicht übermittelt werden. Ihr Text ist nicht verloren: ' : 'Your message could not be sent just now. Your text is not lost: ';
          box.appendChild(a); box.appendChild(document.createTextNode(de ? ' oder rufen Sie uns an.' : ' or give us a call.')); box.hidden = false;
          btn.disabled = false; btn.textContent = label;
        });
    }, true);
  });

  // Resultat eines Rechners ins Kontaktformular übernehmen
  var msg = document.querySelector('form.contact textarea');
  if (msg) {
    try {
      var s = sessionStorage.getItem('dh-tool-result');
      if (s) { msg.value = s + '\n\n'; sessionStorage.removeItem('dh-tool-result'); }
    } catch (e) {}
  }
})();
