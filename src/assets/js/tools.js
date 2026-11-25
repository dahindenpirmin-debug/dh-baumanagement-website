// Online-Rechner. Richtwerte kommen aus src/tools.mjs (beim Build eingebettet).
(function () {
  var root = document.querySelector('.tool');
  if (!root) return;
  var cfg = JSON.parse(document.getElementById('tool-config').textContent), c = cfg.c, l = cfg.l;
  var lang = root.dataset.lang, id = root.dataset.tool, out = root.querySelector('.out');
  var $ = function (i) { return document.getElementById(i); };
  var num = function (i) { return Math.max(0, parseFloat($(i).value) || 0); };
  var chf = function (v) {
    var r = v >= 1e6 ? Math.round(v / 1e4) * 1e4 : Math.round(v / 1e3) * 1e3;
    return 'CHF ' + r.toLocaleString('de-CH');
  };
  var m2 = function (v) { return Math.round(v).toLocaleString('de-CH') + ' m²'; };
  var summary = '';

  function kosten() {
    var t = c.kosten.typen[$('k-typ').value], gf = num('k-gf');
    var f = c.kosten.standard[$('k-std').value].f * c.kosten.eingriff[$('k-eing').value].f;
    var z = c.kosten.zuschlag, plus = 1 + z.bkp1 + z.bkp4 + z.bkp5 + z.reserve;
    var lo = t.min * f, hi = t.max * f;
    out.innerHTML = '<p>' + l.range + '</p><p class="big">' + chf(lo * gf * plus) + ' – ' + chf(hi * gf * plus) + '</p>' +
      '<dl class="kv"><dt>' + l.bkp2 + '</dt><dd>' + chf(lo * gf) + ' – ' + chf(hi * gf) + '</dd>' +
      '<dt>' + l.perm2 + '</dt><dd>CHF ' + Math.round(lo / 10) * 10 + ' – ' + Math.round(hi / 10) * 10 + '</dd></dl>' +
      '<p class="disclaimer">' + l.incl + '</p>';
    summary = t[lang] + ', ' + m2(gf) + ', ' + c.kosten.standard[$('k-std').value][lang] + ', ' + c.kosten.eingriff[$('k-eing').value][lang] + ': ' + chf(lo * gf * plus) + ' – ' + chf(hi * gf * plus);
  }

  function areal() {
    var gsf = num('a-gsf'), az = num('a-az'), best = num('a-bestand'), t = c.kosten.typen[$('a-nutz').value], miete = num('a-miete');
    var max = gsf * az, res = max - best;
    var html = '<dl class="kv"><dt>' + l.maxgf + '</dt><dd>' + m2(max) + '</dd><dt>' + l.reserve + '</dt><dd>' + m2(Math.max(0, res)) + '</dd></dl>';
    if (res <= 0) { out.innerHTML = html + '<p>' + l.norez + '</p>'; summary = l.reserve + ': 0 m²'; return; }
    var z = c.kosten.zuschlag, plus = 1 + z.bkp1 + z.bkp4 + z.bkp5 + z.reserve;
    var lo = t.min * res * plus, hi = t.max * res * plus, ertrag = res * miete;
    html = '<p>' + l.reserve + '</p><p class="big">' + m2(res) + '</p>' + html +
      '<dl class="kv"><dt>' + l.invest + ' (' + t[lang] + ')</dt><dd>' + chf(lo) + ' – ' + chf(hi) + '</dd>';
    if (miete > 0) html += '<dt>' + l.ertrag + '</dt><dd>' + chf(ertrag) + '</dd><dt>' + l.rendite + '</dt><dd>' + (ertrag / hi * 100).toFixed(1) + ' – ' + (ertrag / lo * 100).toFixed(1) + ' %</dd>';
    out.innerHTML = html + '</dl>';
    summary = l.gsf + ' ' + m2(gsf) + ', AZ ' + az + ', ' + l.reserve + ' ' + m2(res) + ', ' + l.invest + ' ' + chf(lo) + ' – ' + chf(hi);
  }

  function dauer() {
    var g = c.dauer[$('d-gross').value], m = g.m.slice();
    if ($('d-bew').value === '0') m[2] = 0;
    var total = m.reduce(function (a, b) { return a + b; }, 0);
    var v = $('d-start').value, start = v ? new Date(v + '-01') : new Date();
    var end = new Date(start.getFullYear(), start.getMonth() + total, 1);
    var fmt = function (d) { return d.toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB', { month: 'long', year: 'numeric' }); };
    var html = '<p>' + l.bezug + '</p><p class="big">' + fmt(end) + '</p><div class="gantt">', off = 0;
    m.forEach(function (d, i) {
      if (!d) return;
      html += '<div><span>' + l.phasen[i] + '</span><span><i style="margin-left:' + (off / total * 100) + '%;width:' + (d / total * 100) + '%"></i></span><b>' + d + ' ' + l.mon + '</b></div>';
      off += d;
    });
    out.innerHTML = html + '</div><dl class="kv"><dt>' + l.total + '</dt><dd>' + total + ' ' + l.mon + '</dd></dl><p class="disclaimer">' + l.einsprache + '</p>';
    summary = g[lang] + ': ' + l.total + ' ' + total + ' ' + l.mon + ', ' + l.bezug + ' ' + fmt(end);
  }

  var run = { kosten: kosten, areal: areal, dauer: dauer }[id];
  if (id === 'dauer') { var n = new Date(); $('d-start').value = n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2); }
  root.querySelector('form').addEventListener('input', run);
  root.querySelector('form').addEventListener('submit', run);
  run();
  root.querySelector('[data-discuss]').addEventListener('click', function () {
    try { sessionStorage.setItem('dh-tool-result', document.title.split(' | ')[0] + ' – ' + summary); } catch (e) {}
  });
})();
