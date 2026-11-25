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
      count.textContent = n + ' ' + (n === 1 ? count.dataset.one : count.dataset.many);
      empty.hidden = n > 0;
      pins.forEach(function (p) {
        var s = p.dataset.slugs.split(','), any = s.some(function (x) { return vis[x]; });
        p.classList.toggle('off', !any); p.classList.toggle('sel', !!sel && sel.join() === s.join());
      });
    };
    Object.keys(f).forEach(function (k) { f[k].addEventListener(k === 'q' ? 'input' : 'change', apply); });
    pins.forEach(function (p) {
      var go = function () { var s = p.dataset.slugs.split(','); sel = sel && sel.join() === s.join() ? null : s; apply(); if (sel) $('p-filter').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      p.addEventListener('click', go);
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    $('f-reset').addEventListener('click', function () { Object.keys(f).forEach(function (k) { f[k].value = ''; }); sel = null; apply(); });
    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.dataset.view === 'table';
        grid.hidden = t; table.hidden = !t;
        document.querySelectorAll('[data-view]').forEach(function (x) { x.classList.toggle('on', x === b); });
      });
    });
    apply();
  }

  // Resultat eines Rechners ins Kontaktformular übernehmen
  var msg = document.querySelector('form.contact textarea');
  if (msg) {
    try {
      var s = sessionStorage.getItem('dh-tool-result');
      if (s) { msg.value = s + '\n\n'; sessionStorage.removeItem('dh-tool-result'); }
    } catch (e) {}
  }
})();
