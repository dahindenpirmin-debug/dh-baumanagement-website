// Admin-Bereich: Referenzen erfassen und bearbeiten.
// Speichert direkt ins GitHub-Repository der Website (eine JSON-Datei pro Projekt in data/projekte/,
// Fotos in src/images/projekte/<slug>/). Keine externen Skripte; der Token bleibt im Browser.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var API = 'https://api.github.com', KEY = 'dh-admin-token';
  var cfg = null, token = '', projekte = [], cur = null, fotos = [], neue = [];
  var form = $('edit'), F = form.elements;

  /* ---------- Hilfen ---------- */
  function status(msg, kind) { var s = $('status'); s.hidden = !msg; s.textContent = msg || ''; s.className = 'a-status' + (kind ? ' ' + kind : ''); if (msg) s.scrollIntoView({ block: 'nearest' }); }
  function show(id) { ['v-login', 'v-list', 'v-edit'].forEach(function (v) { $(v).hidden = v !== id; }); $('logout').hidden = id === 'v-login'; window.scrollTo(0, 0); }
  function store(v) { try { if (v === null) localStorage.removeItem(KEY); else if (v !== undefined) localStorage.setItem(KEY, v); else return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function gh(path, opt) {
    opt = opt || {};
    return fetch(API + path, { method: opt.method || 'GET', headers: { Authorization: 'Bearer ' + token, Accept: opt.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, body: opt.body ? JSON.stringify(opt.body) : undefined })
      .then(function (r) {
        if (r.status === 404 && opt.optional) return null;
        if (!r.ok) return r.text().then(function (t) { var m = t; try { m = JSON.parse(t).message; } catch (e) {} throw new Error(r.status + ' ' + m); });
        return opt.raw ? r.text() : r.status === 204 ? null : r.json();
      });
  }
  var repo = function () { return '/repos/' + cfg.repo; };
  function slugify(s) { return s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70); }
  function lines(v) { return String(v || '').split(/\n|\|/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- Anmeldung ---------- */
  function login(t) {
    token = t;
    return gh(repo()).then(function (r) {
      if (!r.permissions || !r.permissions.push) throw new Error('Der Token hat keine Schreibrechte auf dieses Repository (Contents: Read and write).');
      store(t); status(''); return loadList();
    });
  }
  $('login').addEventListener('submit', function (e) {
    e.preventDefault(); status('Anmeldung wird geprüft …');
    login($('token').value.trim()).catch(function (err) { token = ''; status('Anmeldung fehlgeschlagen: ' + err.message, 'err'); });
  });
  $('logout').addEventListener('click', function () { store(null); token = ''; $('token').value = ''; status('Abgemeldet.'); show('v-login'); });

  /* ---------- Liste ---------- */
  function loadList() {
    status('Referenzen werden geladen …');
    return fetch('/admin/projekte.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (built) {
      projekte = built;
      // Frisch gespeicherte, noch nicht veröffentlichte Projekte direkt aus dem Repository ergänzen
      return gh(repo() + '/contents/data/projekte?ref=' + cfg.branch, { optional: true }).then(function (files) {
        return Promise.all((files || []).filter(function (f) { return /\.json$/.test(f.name); }).map(function (f) {
          return gh(repo() + '/contents/' + f.path + '?ref=' + cfg.branch, { raw: true }).then(function (txt) {
            var j = JSON.parse(txt), i = projekte.findIndex(function (p) { return p.slug === j.slug; });
            ['leistungen_de', 'leistungen_en', 'kennzahlen_de', 'kennzahlen_en'].forEach(function (k) { if (Array.isArray(j[k])) j[k] = j[k].join('|'); });
            j.featured = j.featured ? 'ja' : ''; j.versteckt = j.versteckt ? 'ja' : '';
            if (i >= 0) projekte[i] = Object.assign({}, projekte[i], j); else projekte.unshift(Object.assign({ fotos: '?', neu: true }, j));
          });
        }));
      });
    }).then(function () { renderList(); status(''); show('v-list'); });
  }
  function renderList() {
    $('list').tBodies[0].innerHTML = projekte.map(function (p, i) {
      var zeit = p.jahr_bis && p.jahr_bis !== p.jahr_von ? p.jahr_von + '–' + p.jahr_bis : p.jahr_von;
      return '<tr data-i="' + i + '"' + (p.versteckt ? ' class="hid"' : '') + '><td><strong>' + esc(p.titel_de) + '</strong></td><td>' + esc(p.ort) + (p.kanton ? ' ' + esc(p.kanton) : '') + '</td><td>' + esc(zeit) + '</td><td>' + esc(cfg.cats[p.kategorie] || p.kategorie) + '</td><td>' + esc(cfg.types[p.projektart] || p.projektart) + '</td><td>' + esc(p.bauvolumen_mchf || '–') + '</td><td>' + esc(p.fotos) + '</td><td>' + (p.versteckt ? 'ausgeblendet' : p.neu ? 'gespeichert' : 'online') + '</td></tr>';
    }).join('');
  }
  $('list').addEventListener('click', function (e) { var tr = e.target.closest('tr[data-i]'); if (tr) edit(projekte[+tr.dataset.i]); });
  $('new').addEventListener('click', function () { edit(null); });
  $('back').addEventListener('click', function () { status(''); show('v-list'); });

  /* ---------- Eingabemaske ---------- */
  function edit(p) {
    cur = p; fotos = []; neue = []; form.reset(); status('');
    $('e-title').textContent = p ? p.titel_de : 'Neues Projekt';
    if (p) {
      ['titel_de', 'titel_en', 'kategorie', 'projektart', 'ort', 'kanton', 'jahr_von', 'jahr_bis', 'bauvolumen_mchf', 'bauherr', 'lat', 'lng'].forEach(function (k) { F[k].value = p[k] || ''; });
      ['leistungen_de', 'leistungen_en', 'kennzahlen_de', 'kennzahlen_en'].forEach(function (k) { F[k].value = lines(p[k]).join('\n'); });
      ['beschreibung_de', 'beschreibung_en'].forEach(function (k) { F[k].value = String(p[k] || '').replace(/\\n/g, '\n'); });
      F.featured.checked = !!p.featured; F.versteckt.checked = !!p.versteckt;
      gh(repo() + '/contents/src/images/projekte/' + p.slug + '?ref=' + cfg.branch, { optional: true }).then(function (files) {
        fotos = (files || []).filter(function (f) { return /\.(jpe?g|png|webp)$/i.test(f.name); }).map(function (f) { return { name: f.name, path: f.path, del: false }; });
        renderPhotos();
      }).catch(function (err) { status('Fotos konnten nicht geladen werden: ' + err.message, 'err'); });
    }
    renderPhotos(); mark(); show('v-edit');
  }
  function renderPhotos() {
    var slug = cur ? encodeURIComponent(cur.slug) : '';
    $('photos').innerHTML = fotos.map(function (f, i) { return '<div class="a-photo' + (f.del ? ' del' : '') + '"><img src="/images/projekte/' + slug + '/' + encodeURIComponent(f.name) + '" alt="" loading="lazy"><span>' + esc(f.name) + '</span><button type="button" data-old="' + i + '" title="Foto entfernen / behalten">×</button></div>'; }).join('')
      + neue.map(function (f, i) { return '<div class="a-photo neu"><img src="' + f.url + '" alt=""><span>neu</span><button type="button" data-new="' + i + '" title="Nicht hochladen">×</button></div>'; }).join('');
  }
  $('photos').addEventListener('error', function (e) { if (e.target.tagName === 'IMG') e.target.style.visibility = 'hidden'; }, true);
  $('photos').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.old) fotos[+b.dataset.old].del = !fotos[+b.dataset.old].del; else neue.splice(+b.dataset.new, 1);
    renderPhotos();
  });
  // Fotos im Browser auf max. 2000 px verkleinern und als JPG ablegen
  function shrink(file) {
    return new Promise(function (ok, no) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var k = Math.min(1, 2000 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); var d = c.toDataURL('image/jpeg', 0.85); ok({ url: d, b64: d.split(',')[1] });
      };
      img.onerror = function () { no(new Error('«' + file.name + '» ist kein lesbares Bild.')); };
      img.src = url;
    });
  }
  $('files').addEventListener('change', function () {
    var list = [].slice.call(this.files); this.value = '';
    status(list.length + ' Foto(s) werden vorbereitet …');
    list.reduce(function (p, f) { return p.then(function () { return shrink(f).then(function (r) { neue.push(r); }); }); }, Promise.resolve())
      .then(function () { renderPhotos(); status(''); }).catch(function (err) { renderPhotos(); status(err.message, 'err'); });
  });

  /* ---------- Karte ---------- */
  function drawMap() {
    var k = cfg.karte;
    $('map').innerHTML = '<svg viewBox="0 0 ' + k.W + ' ' + k.H + '" role="img" aria-label="Karte der Schweiz"><path class="land" d="' + k.land + '"/><path class="grenzen" d="' + k.grenzen + '"/><path class="seen" d="' + k.seen + '"/><circle class="mark" r="11" cx="-50" cy="-50"/></svg>';
    $('map').firstChild.addEventListener('click', function (e) {
      var r = this.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * k.W, y = (e.clientY - r.top) / r.height * k.H;
      F.lng.value = (x / (k.COS * k.K) + k.LNG0).toFixed(4); F.lat.value = (k.LAT1 - y / k.K).toFixed(4); mark();
    });
  }
  function mark() {
    var k = cfg.karte, m = document.querySelector('#map .mark'), lat = parseFloat(String(F.lat.value).replace(',', '.')), lng = parseFloat(String(F.lng.value).replace(',', '.'));
    if (!m) return;
    if (lat && lng) { m.setAttribute('cx', (lng - k.LNG0) * k.COS * k.K); m.setAttribute('cy', (k.LAT1 - lat) * k.K); } else { m.setAttribute('cx', -50); m.setAttribute('cy', -50); }
  }
  F.lat.addEventListener('input', mark); F.lng.addEventListener('input', mark);
  $('nopin').addEventListener('click', function () { F.lat.value = ''; F.lng.value = ''; mark(); });

  /* ---------- Speichern: ein einziger Commit mit Projektdatei und Fotos ---------- */
  function commit(message, entries) {
    var ref = repo() + '/git/refs/heads/' + cfg.branch, head;
    return gh(repo() + '/git/ref/heads/' + cfg.branch).then(function (r) { head = r.object.sha; return gh(repo() + '/git/commits/' + head); })
      .then(function (c) { return entries.length ? gh(repo() + '/git/trees', { method: 'POST', body: { base_tree: c.tree.sha, tree: entries } }) : c.tree; })
      .then(function (t) { return gh(repo() + '/git/commits', { method: 'POST', body: { message: message, tree: t.sha, parents: [head] } }); })
      .then(function (c) { return gh(ref, { method: 'PATCH', body: { sha: c.sha } }); });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [];
    ['titel_de', 'kategorie', 'projektart', 'ort', 'jahr_von', 'leistungen_de'].forEach(function (k) { var ok = String(F[k].value).trim() !== ''; F[k].classList.toggle('bad', !ok); if (!ok) bad.push(k); });
    if (bad.length) { status('Bitte die markierten Pflichtfelder ausfüllen.', 'err'); return; }
    var slug = cur ? cur.slug : slugify(F.titel_de.value + ' ' + F.ort.value);
    if (!cur && projekte.some(function (p) { return p.slug === slug; })) { status('Ein Projekt mit diesem Titel und Ort existiert bereits. Bitte das bestehende bearbeiten oder den Titel anpassen.', 'err'); return; }
    var num = function (v) { return String(v || '').trim().replace(',', '.'); };
    var data = {
      slug: slug, titel_de: F.titel_de.value.trim(), titel_en: F.titel_en.value.trim(), kategorie: F.kategorie.value, projektart: F.projektart.value,
      ort: F.ort.value.trim(), kanton: F.kanton.value, jahr_von: String(F.jahr_von.value), jahr_bis: String(F.jahr_bis.value || ''),
      bauvolumen_mchf: num(F.bauvolumen_mchf.value), bauherr: F.bauherr.value.trim(),
      leistungen_de: lines(F.leistungen_de.value), leistungen_en: lines(F.leistungen_en.value),
      beschreibung_de: F.beschreibung_de.value.trim(), beschreibung_en: F.beschreibung_en.value.trim(),
      kennzahlen_de: lines(F.kennzahlen_de.value), kennzahlen_en: lines(F.kennzahlen_en.value),
      lat: num(F.lat.value), lng: num(F.lng.value), featured: F.featured.checked, versteckt: F.versteckt.checked,
      erfasst: (cur && cur.erfasst) || new Date().toISOString().slice(0, 10)
    };
    if (cur && cur.dokument) data.dokument = cur.dokument;
    var btn = $('save'); btn.disabled = true;
    var max = fotos.reduce(function (m, f) { return Math.max(m, parseInt(f.name, 10) || 0); }, 0), dir = 'src/images/projekte/' + slug + '/';
    var entries = [{ path: 'data/projekte/' + slug + '.json', mode: '100644', type: 'blob', content: JSON.stringify(data, null, 2) + '\n' }];
    fotos.filter(function (f) { return f.del; }).forEach(function (f) { entries.push({ path: f.path, mode: '100644', type: 'blob', sha: null }); });
    var i = 0;
    var next = function () {
      if (i >= neue.length) return Promise.resolve();
      status('Foto ' + (i + 1) + ' von ' + neue.length + ' wird hochgeladen …');
      return gh(repo() + '/git/blobs', { method: 'POST', body: { content: neue[i].b64, encoding: 'base64' } }).then(function (b) {
        entries.push({ path: dir + String(max + i + 1).padStart(2, '0') + '.jpg', mode: '100644', type: 'blob', sha: b.sha }); i++; return next();
      });
    };
    var pub = $('pub').checked;
    next().then(function () { status('Projekt wird gespeichert …'); return commit('Projekt gespeichert: ' + data.titel_de + (pub ? '' : ' [skip netlify]'), entries); })
      .then(function () { return loadList(); })
      .then(function () { status(pub ? 'Gespeichert. Die Website wird jetzt neu gebaut; das Projekt ist in ein bis zwei Minuten online.' : 'Gespeichert, aber noch nicht veröffentlicht. Mit «Website jetzt aktualisieren» geht es online.', 'ok'); })
      .catch(function (err) { status('Speichern fehlgeschlagen: ' + err.message, 'err'); })
      .then(function () { btn.disabled = false; });
  });
  $('publish').addEventListener('click', function () {
    var b = this; b.disabled = true; status('Veröffentlichung wird ausgelöst …');
    commit('Website aktualisieren', []).then(function () { status('Die Website wird jetzt neu gebaut und ist in ein bis zwei Minuten aktuell (1 Deploy = 15 Netlify-Credits).', 'ok'); })
      .catch(function (err) { status('Fehlgeschlagen: ' + err.message, 'err'); }).then(function () { b.disabled = false; });
  });

  /* ---------- Start ---------- */
  fetch('/admin/config.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (c) {
    cfg = c; $('repo-name').textContent = c.repo;
    var fill = function (sel, obj) { sel.innerHTML += Object.keys(obj).map(function (k) { return '<option value="' + k + '">' + esc(obj[k]) + '</option>'; }).join(''); };
    fill(F.kategorie, c.cats); fill(F.projektart, c.types);
    F.kanton.innerHTML += Object.keys(c.kantone).sort(function (a, b) { return c.kantone[a].localeCompare(c.kantone[b]); }).map(function (k) { return '<option value="' + k + '">' + esc(c.kantone[k]) + ' (' + k + ')</option>'; }).join('');
    drawMap();
    var t = store();
    if (t) login(t).catch(function (err) { token = ''; show('v-login'); status('Bitte neu anmelden: ' + err.message, 'err'); }); else show('v-login');
  }).catch(function (err) { show('v-login'); status('Der Admin-Bereich konnte nicht geladen werden: ' + err.message, 'err'); });
})();
