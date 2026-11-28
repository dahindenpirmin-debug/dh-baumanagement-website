// Online-Rechner: Berechnung, Darstellung, PDF im Firmenlayout, Anfrage mit PDF-Anhang.
// Richtwerte und Texte kommen aus src/tools.mjs (beim Build eingebettet).
(function () {
  var root = document.querySelector('.tool');
  if (!root) return;
  var cfg = JSON.parse(document.getElementById('tool-config').textContent), c = cfg.c, l = cfg.l, s = cfg.s;
  var lang = root.dataset.lang, id = root.dataset.tool, out = root.querySelector('.out');
  var title = document.title.split(' | ')[0];
  var $ = function (i) { return document.getElementById(i); };
  // Zahl lesen: Komma als Dezimalzeichen zulassen, auf min/max des Feldes begrenzen; leere und begrenzte Felder merken
  var leer = [], begrenzt = [];
  var num = function (i) {
    var el = $(i), raw = String(el.value).replace(',', '.').trim(), v = parseFloat(raw), lo = parseFloat(el.min), hi = parseFloat(el.max);
    if (raw === '' || isNaN(v) || (v <= 0 && !(lo === 0))) { if (!(lo === 0 && (raw === '' || v === 0))) leer.push(i); return 0; }
    if (!isNaN(hi) && v > hi) { begrenzt.push(i); return hi; }
    if (!isNaN(lo) && v < lo) { begrenzt.push(i); return lo; }
    return v;
  };
  var n0 = function (v) { return Math.round(v).toLocaleString('de-CH'); };
  var report = null; // { inputs: [[k,v]], head: [k,v], rows: [[k,v]], phases: [[name, months]], note }

  // Beträge kompakt: ab 1 Mio. in MCHF, darunter in TCHF – passt auf eine Zeile
  function dec(v) { return v >= 100 ? 0 : v >= 10 ? 1 : 2; }
  function money(lo, hi) {
    if (hi == null) hi = lo;
    var one = lo === hi;
    if (hi >= 1e6) { var d = dec(hi / 1e6), mf = function (v) { return d ? (v / 1e6).toFixed(d) : n0(v / 1e6); }; return 'MCHF ' + mf(lo) + (one ? '' : ' – ' + mf(hi)); }
    var r = function (v) { return n0(Math.round(v / 1e4) * 10); };
    return 'TCHF ' + r(lo) + (one ? '' : ' – ' + r(hi));
  }
  var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };

  function render() {
    var h = '<div class="res-head"><span>' + esc(report.head[0]) + '</span><strong>' + esc(report.head[1]) + '</strong></div>';
    if (report.rows.length) h += '<div class="res-grid">' + report.rows.map(function (r) { return '<div><span>' + esc(r[0]) + '</span><strong>' + esc(r[1]) + '</strong></div>'; }).join('') + '</div>';
    if (report.phases) {
      var total = report.phases.reduce(function (a, p) { return a + p[1]; }, 0), off = 0;
      h += '<div class="gantt">' + report.phases.map(function (p) {
        var row = '<div><span>' + esc(p[0]) + '</span><span><i style="margin-left:' + (off / total * 100) + '%;width:' + (p[1] / total * 100) + '%"></i></span><b>' + p[1] + ' ' + l.mon + '</b></div>';
        off += p[1]; return row;
      }).join('') + '</div>';
    }
    if (report.note) h += '<p class="disclaimer">' + esc(report.note) + '</p>';
    out.innerHTML = h;
  }

  function kosten() {
    var t = c.kosten.typen[$('k-typ').value], m3 = document.querySelector('[name=k-basis]:checked').value === 'm3';
    $('k-menge-label').textContent = m3 ? l.gv : l.gf;
    var q = num('k-menge'), unit = m3 ? 'm³' : 'm²';
    var std = c.kosten.standard[$('k-std').value], eg = c.kosten.eingriff[$('k-eing').value], f = std.f * eg.f;
    var lo = (m3 ? t.m3min : t.min) * f, hi = (m3 ? t.m3max : t.max) * f;
    var z = c.kosten.zuschlag, plus = z.bkp1 + z.bkp4 + z.bkp5 + z.reserve;
    report = {
      inputs: [[l.typ, t[lang]], [m3 ? l.gv : l.gf, n0(q) + ' ' + unit], [l.std, std[lang]], [l.eing, eg[lang]]],
      head: [l.range, money(lo * q * (1 + plus), hi * q * (1 + plus))],
      rows: [[l.bkp2, money(lo * q, hi * q)], [l.neben, money(lo * q * plus, hi * q * plus)], [m3 ? l.perm3 : l.perm2, 'CHF ' + n0(Math.round(lo / 10) * 10) + ' – ' + n0(Math.round(hi / 10) * 10)]],
      note: l.incl
    };
  }

  function areal() {
    var gsf = num('a-gsf'), az = num('a-az'), best = num('a-bestand'), t = c.kosten.typen[$('a-nutz').value], miete = num('a-miete');
    var max = gsf * az, res = Math.max(0, max - best);
    var z = c.kosten.zuschlag, plus = 1 + z.bkp1 + z.bkp4 + z.bkp5 + z.reserve, lo = t.min * res * plus, hi = t.max * res * plus, ertrag = res * miete;
    report = {
      inputs: [[l.gsf, n0(gsf) + ' m²'], [l.az, String(az)], [l.bestand, n0(best) + ' m²'], [l.nutz, t[lang]], [l.miete, 'CHF ' + n0(miete)]],
      head: [l.reserve, n0(res) + ' m²'], rows: [[l.maxgf, n0(max) + ' m²']], note: res > 0 ? l.incl : l.norez
    };
    if (res > 0) {
      report.rows.push([l.invest, money(lo, hi)]);
      if (miete > 0) report.rows.push([l.ertrag, money(ertrag)], [l.rendite, (ertrag / hi * 100).toFixed(1) + ' – ' + (ertrag / lo * 100).toFixed(1) + ' %']);
    }
  }

  function dauer() {
    var g = c.dauer[$('d-gross').value], m = g.m.slice(), bew = $('d-bew').value === '1';
    if (!bew) m[2] = 0;
    var total = m.reduce(function (a, b) { return a + b; }, 0);
    var start = new Date(+$('d-start-j').value, +$('d-start-m').value, 1, 12);
    var end = new Date(start.getFullYear(), start.getMonth() + total, 1);
    var fmt = function (d) { return d.toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB', { month: 'long', year: 'numeric' }); };
    report = {
      inputs: [[l.gross, g[lang]], [l.start, fmt(start)], [l.bew, bew ? l.ja : l.nein]],
      head: [l.bezug, fmt(end)], rows: [[l.total, total + ' ' + l.mon]],
      phases: l.phasen.map(function (p, i) { return [p, m[i]]; }).filter(function (p) { return p[1] > 0; }),
      note: l.einsprache
    };
  }

  var calc = { kosten: kosten, areal: areal, dauer: dauer }[id];
  var acts = [].slice.call(root.querySelectorAll('[data-act]'));
  var run = function () {
    leer = []; begrenzt = []; calc();
    if (leer.length) { // ohne brauchbare Eingabe kein Resultat mit Nullen zeigen
      out.innerHTML = '<p class="tool-hint">' + esc(l.leer) + '</p>';
    } else {
      render();
      if (begrenzt.length) out.insertAdjacentHTML('afterbegin', '<p class="tool-hint">' + esc(l.grenze + ' ' + begrenzt.map(function (i) { var lab = $(i + '-label'); return (lab ? lab.textContent : i) + ' ' + $(i).min + '–' + n0(+$(i).max); }).join(', ')) + '</p>');
    }
    [].forEach.call(root.querySelectorAll('.tool-form input[type=number]'), function (el) { el.classList.toggle('bad', leer.indexOf(el.id) >= 0 || begrenzt.indexOf(el.id) >= 0); });
    acts.forEach(function (b) { b.disabled = !!leer.length; });
  };
  if (id === 'dauer') { // Monat und Jahr als zwei Auswahlfelder: einheitliche Darstellung in allen Browsern (type=month fehlt in Safari/Firefox)
    var n = new Date(), y0 = n.getFullYear(), sj = $('d-start-j');
    for (var y = y0 - 1; y <= y0 + 8; y++) { var o = document.createElement('option'); o.value = y; o.textContent = y; sj.appendChild(o); }
    sj.value = y0; $('d-start-m').value = n.getMonth();
  }
  if (id === 'kosten') [].forEach.call(document.querySelectorAll('[name=k-basis]'), function (r) {
    // Beim Wechsel m² <-> m³ die Menge mit der typischen Geschosshöhe umrechnen
    r.addEventListener('change', function () { var h = c.kosten.typen[$('k-typ').value].h, q = num('k-menge'); $('k-menge').value = Math.round((r.value === 'm3' ? q * h : q / h) / 10) * 10; });
  });
  var form = root.querySelector('.tool-form');
  form.addEventListener('input', run); form.addEventListener('change', run); form.addEventListener('submit', run);
  run();

  /* ---------- PDF im Firmenlayout ---------- */
  var summary = function () { return title + ': ' + report.head[0] + ' ' + report.head[1] + ' (' + report.inputs.map(function (r) { return r[1]; }).join(', ') + ')'; };
  var fileName = function () { return 'DH-Baumanagement_' + title.replace(/[^A-Za-z0-9äöüÄÖÜ]+/g, '-') + '_' + new Date().toISOString().slice(0, 10) + '.pdf'; };
  var libP, logoP;
  function lib() {
    return libP || (libP = new Promise(function (ok, no) {
      var sc = document.createElement('script'); sc.src = '/assets/vendor/jspdf.umd.min.js';
      sc.onload = function () { ok(window.jspdf.jsPDF); }; sc.onerror = no; document.head.appendChild(sc);
    }));
  }
  function logo() { // nur lokales Logo (src/images/logo.png); sonst Schriftzug
    return logoP || (logoP = new Promise(function (ok) {
      var im = new Image();
      im.onload = function () {
        try { var cv = document.createElement('canvas'), k = Math.min(1, 420 / im.naturalWidth); cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); ok({ data: cv.toDataURL('image/png'), r: im.naturalWidth / im.naturalHeight }); } catch (e) { ok(null); }
      };
      im.onerror = function () { ok(null); }; im.src = '/images/logo.png';
    }));
  }
  function makePdf() {
    return Promise.all([lib(), logo()]).then(function (a) {
      var doc = new a[0]({ unit: 'mm', format: 'a4' }), lg = a[1], W = 210, M = 18, y;
      var _text = doc.text.bind(doc); // Standardschrift kennt keine Hochzahlen
      doc.text = function (t) { var args = [].slice.call(arguments); args[0] = typeof t === 'string' ? t.replace(/²/g, '2').replace(/³/g, '3') : t.map(function (x) { return x.replace(/²/g, '2').replace(/³/g, '3'); }); return _text.apply(null, args); };
      var INK = [14, 47, 71], ACC = [231, 201, 132], GOLD = [138, 109, 36], SOFT = [77, 97, 114], ALT = [245, 243, 238], LINE = [223, 221, 215];
      doc.setFillColor.apply(doc, INK); doc.rect(0, 0, W, 30, 'F');
      doc.setFillColor.apply(doc, ACC); doc.rect(0, 30, W, 1.4, 'F');
      if (lg) { var lh = 21, lw = lh * lg.r; doc.addImage(lg.data, 'PNG', M, 4.5, lw, lh, 'logo', 'FAST'); }
      else { doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text(s.name, M, 18.5); }
      doc.setTextColor(231, 201, 132); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
      doc.text(s.claim, W - M, 18.5, { align: 'right' });
      y = 48; doc.setTextColor.apply(doc, INK); doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.text(title, M, y);
      y += 7; doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, SOFT);
      doc.text(l.stand + ' ' + new Date().toLocaleDateString('de-CH') + ' · ' + s.web, M, y);
      var h2 = function (t) { y += 13; doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor.apply(doc, GOLD); doc.text(t.toUpperCase(), M, y, { charSpace: 0.4 }); y += 3; };
      var rows = function (list) {
        list.forEach(function (r) {
          y += 7.5; doc.setFontSize(10.5); doc.setFont('helvetica', 'normal'); doc.setTextColor.apply(doc, SOFT); doc.text(String(r[0]), M, y);
          doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, INK); doc.text(String(r[1]), W - M, y, { align: 'right' });
          doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.2); doc.line(M, y + 2.6, W - M, y + 2.6);
        });
      };
      h2(l.eingaben); rows(report.inputs);
      h2(l.res);
      y += 4; doc.setFillColor.apply(doc, ALT); doc.rect(M, y, W - 2 * M, 26, 'F'); doc.setFillColor.apply(doc, ACC); doc.rect(M, y, 1.4, 26, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor.apply(doc, SOFT); doc.text(report.head[0], M + 7, y + 9);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor.apply(doc, INK); doc.text(report.head[1], M + 7, y + 20);
      y += 26; rows(report.rows);
      if (report.phases) {
        var total = report.phases.reduce(function (t, p) { return t + p[1]; }, 0), off = 0, x0 = M + 62, bw = W - M - 26 - x0;
        y += 6;
        report.phases.forEach(function (p) {
          y += 7.5; doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, INK); doc.text(p[0], M, y);
          doc.setFillColor.apply(doc, ALT); doc.rect(x0, y - 3.4, bw, 4, 'F');
          doc.setFillColor.apply(doc, ACC); doc.rect(x0 + bw * off / total, y - 3.4, bw * p[1] / total, 4, 'F');
          doc.setFont('helvetica', 'bold'); doc.text(p[1] + ' ' + l.mon, W - M, y, { align: 'right' }); off += p[1];
        });
      }
      y += 12; doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, SOFT);
      var note = doc.splitTextToSize((report.note ? report.note + ' ' : '') + l.pdfNote, W - 2 * M); doc.text(note, M, y);
      doc.setDrawColor.apply(doc, ACC); doc.setLineWidth(0.5); doc.line(M, 276, W - M, 276);
      doc.setFontSize(8.5); doc.setTextColor.apply(doc, INK); doc.setFont('helvetica', 'bold'); doc.text(s.name, M, 282);
      doc.setFont('helvetica', 'normal'); doc.setTextColor.apply(doc, SOFT);
      doc.text(s.addr + ' · ' + s.phone + ' · ' + s.email + ' · ' + s.web, M, 287);
      return doc;
    });
  }

  /* ---------- Aktionen ---------- */
  var msg = root.querySelector('.tool-msg'), lead = root.querySelector('.tool-lead');
  var say = function (t, bad) { msg.textContent = t; msg.className = 'tool-msg' + (bad ? ' bad' : ' ok'); };
  var mailto = function (hint) { return 'mailto:' + s.email + '?subject=' + encodeURIComponent(l.mailSubject + ' ' + title) + '&body=' + encodeURIComponent(l.mailBody + summary() + '\n\n' + (hint || '')); };
  root.querySelector('[data-act=pdf]').addEventListener('click', function () { makePdf().then(function (d) { d.save(fileName()); }); });
  root.querySelector('[data-act=form]').addEventListener('click', function () { lead.hidden = false; lead.querySelector('[name=name]').focus(); lead.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  root.querySelector('[data-act=mail]').addEventListener('click', function () {
    makePdf().then(function (d) {
      var file = new File([d.output('blob')], fileName(), { type: 'application/pdf' });
      // Mobilgeräte: Teilen-Dialog mit PDF als Anhang (Mail, Outlook usw.)
      if (navigator.canShare && navigator.canShare({ files: [file] }) && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return navigator.share({ files: [file], title: title, text: summary() }).catch(function () {});
      }
      // Desktop: mailto kann technisch keine Anhänge übergeben -> PDF herunterladen und E-Mail öffnen
      d.save(fileName()); say(l.mailNote); location.href = mailto(l.mailAttach);
    });
  });
  lead.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = lead.querySelector('button[type=submit]'), label = btn.textContent;
    btn.disabled = true; btn.textContent = l.sending;
    lead.querySelector('[name=zusammenfassung]').value = summary();
    makePdf().then(function (d) {
      var fd = new FormData(lead);
      fd.set('resultat', new File([d.output('blob')], fileName(), { type: 'application/pdf' }));
      return fetch('/', { method: 'POST', body: fd });
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      lead.hidden = true; lead.reset(); say(l.sent);
    }).catch(function () {
      say(l.fail + ' ' + s.email + '.', true);
    }).then(function () { btn.disabled = false; btn.textContent = label; });
  });
})();
