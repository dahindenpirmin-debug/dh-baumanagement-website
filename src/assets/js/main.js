// Navigation, Projektfilter, Formular-Vorbefüllung
(function () {
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  if (burger) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  // Projektfilter (Kategorie + Projektart) und Ansicht (Kacheln/Tabelle)
  var grid = document.getElementById('p-grid'), table = document.getElementById('p-table');
  if (grid) {
    var state = { cat: '', type: '' };
    var q = new URLSearchParams(location.search);
    if (q.get('kategorie')) state.cat = q.get('kategorie');
    if (q.get('art')) state.type = q.get('art');
    var apply = function () {
      document.querySelectorAll('[data-cat]').forEach(function (el) {
        var ok = (!state.cat || el.dataset.cat === state.cat) && (!state.type || el.dataset.type === state.type);
        el.hidden = !ok;
      });
      document.querySelectorAll('.filter[data-group]').forEach(function (g) {
        g.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.val === state[g.dataset.group]); });
      });
    };
    document.querySelectorAll('.filter[data-group] button').forEach(function (b) {
      b.addEventListener('click', function () { state[b.parentNode.dataset.group] = b.dataset.val; apply(); });
    });
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
