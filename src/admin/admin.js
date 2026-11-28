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
      return '<tr data-i="' + i + '"' + (p.versteckt ? ' class="hid"' : '') + '><td><strong>' + esc(p.titel_de) + '</strong></td><td>' + esc(p.ort) + (p.kanton ? ' (' + esc(p.kanton) + ')' : '') + '</td><td>' + esc(zeit) + '</td><td>' + esc(cfg.cats[p.kategorie] || p.kategorie) + '</td><td>' + esc(cfg.types[p.projektart] || p.projektart) + '</td><td>' + esc(p.bauvolumen_mchf || '–') + '</td><td>' + esc(p.fotos) + '</td><td class="akt">' + (+(p.jahr_bis || p.jahr_von) >= new Date().getFullYear() ? '<span title="Läuft im laufenden Jahr oder später: erscheint automatisch">läuft</span>' : '<input type="checkbox" class="akt-box" aria-label="Als aktuelles Projekt zeigen"' + (p.featured ? ' checked' : '') + '>') + '</td><td>' + (p.versteckt ? 'ausgeblendet' : p.neu ? 'gespeichert' : 'online') + '</td></tr>';
    }).join('');
  }
  $('list').addEventListener('click', function (e) {
    var tr = e.target.closest('tr[data-i]'); if (!tr) return;
    if (e.target.closest('td.akt')) { // Kästchen «Aktuell»: direkt speichern, Maske nicht öffnen
      var box = e.target.closest('.akt-box'); if (!box) return;
      var p = projekte[+tr.dataset.i], d = dataOf(p); d.featured = box.checked; box.disabled = true;
      status('«' + p.titel_de + '» wird gespeichert …');
      commit('Aktuell ' + (d.featured ? 'markiert' : 'entfernt') + ': ' + p.titel_de + ' [skip netlify]', [jsonEntry(d)])
        .then(function () { p.featured = d.featured ? 'ja' : ''; status('Gespeichert. Mit «Website jetzt aktualisieren» wird die Startseite angepasst.', 'ok'); })
        .catch(function (err) { box.checked = !box.checked; status('Speichern fehlgeschlagen: ' + err.message, 'err'); })
        .then(function () { box.disabled = false; });
      return;
    }
    edit(projekte[+tr.dataset.i]);
  });
  // Listeneintrag (Zeichenketten wie in der CSV) -> Projektdatei (JSON)
  function dataOf(p) {
    var arr = function (v) { return Array.isArray(v) ? v : lines(v); }, ld = arr(p.leistungen_de), yes = function (v) { return v === true || /^(ja|yes|x|1|true)$/i.test(String(v || '')); };
    var d = { slug: p.slug, titel_de: p.titel_de || '', titel_en: p.titel_en || '', kategorie: p.kategorie || '', projektart: p.projektart || '', ort: p.ort || '', kanton: p.kanton || '',
      jahr_von: String(p.jahr_von || ''), jahr_bis: String(p.jahr_bis || ''), bauvolumen_mchf: String(p.bauvolumen_mchf || ''), bauherr: p.bauherr || '',
      leistungen_de: ld, leistungen_en: ld.map(lEn),
      beschreibung_de: p.beschreibung_de || '', beschreibung_en: p.beschreibung_en || '', kennzahlen_de: arr(p.kennzahlen_de), kennzahlen_en: arr(p.kennzahlen_en),
      zitat_de: p.zitat_de || '', zitat_en: p.zitat_en || '', zitat_von: p.zitat_von || '', lat: String(p.lat || ''), lng: String(p.lng || ''),
      featured: yes(p.featured), versteckt: yes(p.versteckt), erfasst: p.erfasst || new Date().toISOString().slice(0, 10) };
    if (p.dokument) d.dokument = p.dokument;
    return d;
  }
  // Englische Bezeichnung einer Leistung direkt aus der Konfiguration (unabhängig davon, ob die Maske schon geöffnet war)
  function lEn(x) { var r = x; cfg.leistungen.forEach(function (g) { g.items.forEach(function (it) { if (it[0] === x) r = it[1]; }); }); return r; }
  function jsonEntry(d) { return { path: 'data/projekte/' + d.slug + '.json', mode: '100644', type: 'blob', content: JSON.stringify(d, null, 2) + '\n' }; }
  $('new').addEventListener('click', function () { edit(null); });
  $('back').addEventListener('click', function () { status(''); show('v-list'); });

  /* ---------- Eingabemaske ---------- */
  function edit(p) {
    cur = p; fotos = []; neue = []; form.reset(); status('');
    $('e-title').textContent = p ? p.titel_de : 'Neues Projekt';
    if (p) {
      ['titel_de', 'titel_en', 'kategorie', 'projektart', 'ort', 'kanton', 'jahr_von', 'jahr_bis', 'bauvolumen_mchf', 'bauherr', 'lat', 'lng', 'zitat_de', 'zitat_von'].forEach(function (k) { F[k].value = p[k] || ''; });
      ['kennzahlen_de', 'kennzahlen_en'].forEach(function (k) { F[k].value = lines(p[k]).join('\n'); });
      ['beschreibung_de', 'beschreibung_en'].forEach(function (k) { F[k].value = String(p[k] || '').replace(/\\n/g, '\n'); });
      F.featured.checked = !!p.featured; F.versteckt.checked = !!p.versteckt;
      gh(repo() + '/contents/src/images/projekte/' + p.slug + '?ref=' + cfg.branch, { optional: true }).then(function (files) {
        fotos = (files || []).filter(function (f) { return /\.(jpe?g|png|webp)$/i.test(f.name); }).map(function (f) { return { name: f.name, path: f.path, del: false }; });
        renderPhotos();
      }).catch(function (err) { status('Fotos konnten nicht geladen werden: ' + err.message, 'err'); });
    }
    drawLeist(p ? lines(p.leistungen_de) : []);
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

  /* ---------- Dienstleistungen: feste Auswahl ---------- */
  var lmap = {};
  function drawLeist(sel) {
    var known = {}, h = '';
    cfg.leistungen.forEach(function (g) {
      h += '<fieldset class="a-grp"><legend>' + esc(g.gruppe) + '</legend>' + g.items.map(function (it) { known[it[0]] = 1; lmap[it[0]] = it[1]; return '<label class="check"><input type="checkbox" value="' + esc(it[0]) + '"' + (sel.indexOf(it[0]) >= 0 ? ' checked' : '') + '> ' + esc(it[0]) + '</label>'; }).join('') + '</fieldset>';
    });
    var alt = sel.filter(function (x) { return !known[x]; });
    if (alt.length) h += '<fieldset class="a-grp alt"><legend>Nicht in der Liste (bisherige Angabe)</legend>' + alt.map(function (x) { return '<label class="check"><input type="checkbox" value="' + esc(x) + '" checked> ' + esc(x) + '</label>'; }).join('') + '</fieldset>';
    $('leist').innerHTML = h; $('leist').classList.remove('bad');
  }

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
  // Hat sich der Stand im Repository während des Speicherns geändert (422 «not a fast forward»), einmal auf dem neuen Stand wiederholen
  function commit(message, entries) {
    return commitOnce(message, entries).catch(function (err) { if (/^(422|409)/.test(err.message)) return commitOnce(message, entries); throw err; });
  }
  function commitOnce(message, entries) {
    var ref = repo() + '/git/refs/heads/' + cfg.branch, head;
    return gh(repo() + '/git/ref/heads/' + cfg.branch).then(function (r) { head = r.object.sha; return gh(repo() + '/git/commits/' + head); })
      .then(function (c) { return entries.length ? gh(repo() + '/git/trees', { method: 'POST', body: { base_tree: c.tree.sha, tree: entries } }) : c.tree; })
      .then(function (t) { return gh(repo() + '/git/commits', { method: 'POST', body: { message: message, tree: t.sha, parents: [head] } }); })
      .then(function (c) { return gh(ref, { method: 'PATCH', body: { sha: c.sha } }); });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [];
    ['titel_de', 'kategorie', 'projektart', 'ort', 'jahr_von'].forEach(function (k) { var ok = String(F[k].value).trim() !== ''; F[k].classList.toggle('bad', !ok); if (!ok) bad.push(k); });
    var gew = [].slice.call(document.querySelectorAll('#leist input:checked')).map(function (c) { return c.value; });
    $('leist').classList.toggle('bad', !gew.length); if (!gew.length) bad.push('leist');
    // Plausibilität: Jahre, Bauvolumen, Koordinaten
    var nz = function (v) { return parseFloat(String(v).replace(',', '.')); }, why = [], jahr = new Date().getFullYear();
    var flag = function (k, ok, text) { if (!bad.includes(k)) F[k].classList.toggle('bad', !ok); if (!ok) why.push(text); };
    var jv = +F.jahr_von.value, jb = +F.jahr_bis.value;
    if (F.jahr_von.value) flag('jahr_von', jv >= 1990 && jv <= jahr + 10, 'Jahr von: zwischen 1990 und ' + (jahr + 10));
    flag('jahr_bis', !F.jahr_bis.value || (jb >= jv && jb <= jahr + 15), 'Jahr bis: darf nicht vor «Jahr von» liegen');
    var bv = String(F.bauvolumen_mchf.value).trim();
    flag('bauvolumen_mchf', !bv || (/^\d+([.,]\d+)?$/.test(bv) && nz(bv) > 0 && nz(bv) < 2000), 'Bauvolumen: nur die Zahl in Mio. CHF, z. B. 4.2');
    var la = String(F.lat.value).trim(), lo = String(F.lng.value).trim(), inCH = nz(la) > 45.7 && nz(la) < 47.9 && nz(lo) > 5.8 && nz(lo) < 10.6;
    flag('lat', (!la && !lo) || inCH, 'Standort: Koordinaten liegen nicht in der Schweiz (am einfachsten auf die Karte klicken)'); F.lng.classList.toggle('bad', !((!la && !lo) || inCH));
    if (!bad.length && why.length) { status(why.join(' · '), 'err'); return; }
    if (bad.length) { status('Bitte die markierten Pflichtfelder ausfüllen' + (gew.length ? '.' : ' und mindestens eine Dienstleistung ankreuzen.'), 'err'); return; }
    var slug = cur ? cur.slug : slugify(F.titel_de.value + ' ' + F.ort.value);
    if (!cur && projekte.some(function (p) { return p.slug === slug; })) { status('Ein Projekt mit diesem Titel und Ort existiert bereits. Bitte das bestehende bearbeiten oder den Titel anpassen.', 'err'); return; }
    var num = function (v) { return String(v || '').trim().replace(',', '.'); };
    var data = {
      slug: slug, titel_de: F.titel_de.value.trim(), titel_en: F.titel_en.value.trim(), kategorie: F.kategorie.value, projektart: F.projektart.value,
      ort: F.ort.value.trim(), kanton: F.kanton.value, jahr_von: String(F.jahr_von.value), jahr_bis: String(F.jahr_bis.value || ''),
      bauvolumen_mchf: num(F.bauvolumen_mchf.value), bauherr: F.bauherr.value.trim(),
      leistungen_de: gew, leistungen_en: gew.map(function (d) { return lmap[d] || d; }),
      beschreibung_de: F.beschreibung_de.value.trim(), beschreibung_en: F.beschreibung_en.value.trim(),
      kennzahlen_de: lines(F.kennzahlen_de.value), kennzahlen_en: lines(F.kennzahlen_en.value),
      zitat_de: F.zitat_de.value.trim(), zitat_en: (cur && cur.zitat_de === F.zitat_de.value.trim() && cur.zitat_en) || '', zitat_von: F.zitat_von.value.trim(),
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

  /* ---------- Excel-Import ---------- */
  // .xlsx ist ein ZIP mit XML-Dateien: ohne Fremdbibliothek mit Bordmitteln des Browsers gelesen
  function unzip(buf) {
    var dv = new DataView(buf), u8 = new Uint8Array(buf), td = new TextDecoder(), i = buf.byteLength - 22, files = {};
    while (i >= 0 && dv.getUint32(i, true) !== 0x06054b50) i--;
    if (i < 0) return Promise.reject(new Error('Die Datei ist keine gültige Excel-Datei (.xlsx).'));
    var n = dv.getUint16(i + 10, true), off = dv.getUint32(i + 16, true), jobs = [];
    for (var k = 0; k < n; k++) {
      var method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true), nl = dv.getUint16(off + 28, true), el = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true), lo = dv.getUint32(off + 42, true);
      var name = td.decode(u8.subarray(off + 46, off + 46 + nl)); off += 46 + nl + el + cl;
      if (!/^xl\/(workbook\.xml|sharedStrings\.xml|_rels\/workbook\.xml\.rels|worksheets\/[^/]+\.xml)$/.test(name)) continue;
      var start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), raw = u8.subarray(start, start + csize);
      jobs.push((function (name, raw, method) {
        var p = method === 0 ? Promise.resolve(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength))
          : new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
        return p.then(function (b) { files[name] = td.decode(b); });
      })(name, raw, method));
    }
    return Promise.all(jobs).then(function () { return files; });
  }
  function readXlsx(buf) {
    return unzip(buf).then(function (f) {
      var xml = function (t) { return new DOMParser().parseFromString(t, 'application/xml'); }, tags = function (el, n) { return [].slice.call(el.getElementsByTagName(n)); };
      var wb = xml(f['xl/workbook.xml'] || ''), rels = xml(f['xl/_rels/workbook.xml.rels'] || ''), sh = tags(wb, 'sheet');
      var s = sh.filter(function (x) { return x.getAttribute('name') === 'Projekte'; })[0] || sh[0];
      if (!s) throw new Error('In der Datei wurde kein Tabellenblatt gefunden.');
      var rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      var rel = tags(rels, 'Relationship').filter(function (r) { return r.getAttribute('Id') === rid; })[0];
      var path = 'xl/' + (rel ? rel.getAttribute('Target').replace(/^\/?xl\//, '').replace(/^\//, '') : 'worksheets/sheet1.xml');
      var text = function (el) { return tags(el, 't').filter(function (t) { return t.parentNode.nodeName !== 'rPh'; }).map(function (t) { return t.textContent; }).join(''); };
      var strings = f['xl/sharedStrings.xml'] ? tags(xml(f['xl/sharedStrings.xml']), 'si').map(text) : [];
      if (!f[path]) throw new Error('Das Blatt «Projekte» konnte nicht gelesen werden.');
      return tags(xml(f[path]), 'row').map(function (row) {
        var out = [];
        tags(row, 'c').forEach(function (c) {
          var ref = (c.getAttribute('r') || '').replace(/\d+/g, ''), col = 0; for (var i = 0; i < ref.length; i++) col = col * 26 + ref.charCodeAt(i) - 64;
          var t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0], val = t === 'inlineStr' ? text(c) : v ? v.textContent : '';
          if (t === 's') val = strings[+val] || '';
          else if (t === 'b') val = val === '1' ? 'ja' : 'nein';
          else if (!t && val !== '' && !isNaN(+val)) val = String(+(+val).toFixed(6)); // Zahl ohne Rundungsreste
          out[col - 1] = String(val).replace(/\r\n?/g, '\n').trim();
        });
        return out;
      });
    });
  }
  var xlPlan = null;
  function pruefeExcel(rows) {
    var map = {}; (cfg.excel || []).forEach(function (c) { map[c.label.toLowerCase()] = c.key; });
    var head = (rows[0] || []).map(function (h) { return map[String(h || '').toLowerCase()]; });
    if (head.indexOf('titel_de') < 0 || head.indexOf('ort') < 0) throw new Error('Die Spaltentitel wurden nicht erkannt. Bitte die Vorlage über «Excel herunterladen» verwenden und die Kopfzeile nicht ändern.');
    var inv = function (o) { var r = {}; Object.keys(o).forEach(function (k) { r[String(o[k]).toLowerCase()] = k; }); return r; }, cats = inv(cfg.cats), types = inv(cfg.types), jahr = new Date().getFullYear();
    var bekannt = {}; cfg.leistungen.forEach(function (g) { g.items.forEach(function (it) { bekannt[it[0].toLowerCase()] = it[0]; }); });
    var yes = function (v) { return /^(ja|yes|x|1|true)$/i.test(v || ''); }, plan = [], seen = {};
    rows.slice(1).forEach(function (r, n) {
      var x = {}; head.forEach(function (k, i) { if (k) x[k] = r[i] || ''; });
      if (!Object.keys(x).some(function (k) { return k !== 'slug' && x[k]; })) return; // leere Zeile
      var err = [], zeile = n + 2, alt = x.slug ? projekte.filter(function (p) { return p.slug === x.slug; })[0] : null;
      if (x.slug && !alt) err.push('Kennung «' + x.slug + '» ist unbekannt (bei neuen Projekten leer lassen)');
      ['titel_de', 'ort', 'jahr_von'].forEach(function (k) { if (!x[k]) err.push({ titel_de: 'Titel', ort: 'Ort', jahr_von: 'Jahr von' }[k] + ' fehlt'); });
      var kat = cats[(x.kategorie || '').toLowerCase()] || (cfg.cats[x.kategorie] ? x.kategorie : ''), art = types[(x.projektart || '').toLowerCase()] || (cfg.types[x.projektart] ? x.projektart : '');
      if (!kat) err.push('Kategorie ' + (x.kategorie ? '«' + x.kategorie + '» unbekannt' : 'fehlt'));
      if (!art) err.push('Projektart ' + (x.projektart ? '«' + x.projektart + '» unbekannt' : 'fehlt'));
      var kt = (x.kanton || '').toUpperCase(); if (kt && !cfg.kantone[kt]) err.push('Kanton «' + x.kanton + '» unbekannt (Kürzel, z. B. LU)');
      var jv = +x.jahr_von, jb = x.jahr_bis ? +x.jahr_bis : 0;
      if (x.jahr_von && !(jv >= 1990 && jv <= jahr + 10 && jv % 1 === 0)) err.push('Jahr von «' + x.jahr_von + '» ungültig');
      if (x.jahr_bis && !(jb >= jv && jb <= jahr + 15 && jb % 1 === 0)) err.push('Jahr bis «' + x.jahr_bis + '» ungültig oder vor «Jahr von»');
      var bv = (x.bauvolumen_mchf || '').replace(',', '.'); if (bv && !(+bv > 0 && +bv < 2000)) err.push('Bauvolumen «' + x.bauvolumen_mchf + '» ist keine Zahl in Mio. CHF');
      var la = (x.lat || '').replace(',', '.'), lo = (x.lng || '').replace(',', '.');
      if ((la || lo) && !(+la > 45.7 && +la < 47.9 && +lo > 5.8 && +lo < 10.6)) err.push('Koordinaten liegen nicht in der Schweiz');
      var le = []; [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function (i) { var v = x['leistung_' + i]; if (!v) return; var b = bekannt[v.toLowerCase()]; if (!b) err.push('Leistung «' + v + '» ist nicht in der Liste'); else if (le.indexOf(b) < 0) le.push(b); });
      if (!le.length) err.push('mindestens eine Leistung fehlt');
      var slug = alt ? alt.slug : slugify((x.titel_de || '') + ' ' + (x.ort || ''));
      if (!alt && slug && (projekte.some(function (p) { return p.slug === slug; }) || seen[slug])) err.push('ein Projekt mit diesem Titel und Ort gibt es bereits (zum Ändern die Kennung aus der Liste eintragen)');
      seen[slug] = 1;
      var d = alt ? dataOf(alt) : dataOf({ slug: slug }), vorher = JSON.stringify(d);
      Object.assign(d, { titel_de: x.titel_de, titel_en: x.titel_en || '', kategorie: kat, projektart: art, ort: x.ort, kanton: kt, jahr_von: x.jahr_von, jahr_bis: x.jahr_bis || '', bauvolumen_mchf: bv, bauherr: x.bauherr || '',
        leistungen_de: le, leistungen_en: le.map(lEn), beschreibung_de: x.beschreibung_de || '', beschreibung_en: x.beschreibung_en || '',
        kennzahlen_de: lines(x.kennzahlen_de), kennzahlen_en: lines(x.kennzahlen_en), zitat_de: x.zitat_de || '', zitat_von: x.zitat_von || '', lat: la, lng: lo, featured: yes(x.featured), versteckt: yes(x.versteckt) });
      if (alt && alt.zitat_de !== d.zitat_de) d.zitat_en = '';
      // Vergleich ohne Unterschiede, die nur aus der Schreibweise stammen
      var norm = function (j) { var o = JSON.parse(j); ['beschreibung_de', 'beschreibung_en'].forEach(function (k) { o[k] = String(o[k]).replace(/\\n/g, '\n').replace(/\s+/g, ' ').trim(); }); ['bauvolumen_mchf', 'lat', 'lng'].forEach(function (k) { o[k] = o[k] === '' ? '' : String(+o[k]); }); if (o.jahr_bis === o.jahr_von) o.jahr_bis = ''; return JSON.stringify(o); };
      plan.push({ zeile: zeile, titel: x.titel_de || '(ohne Titel)', ort: x.ort || '', err: err, art: err.length ? 'fehler' : !alt ? 'neu' : norm(vorher) === norm(JSON.stringify(d)) ? 'gleich' : 'geaendert', data: d });
    });
    return plan;
  }
  function zeigePlan(plan) {
    xlPlan = plan; var box = $('xl-prev'), n = function (a) { return plan.filter(function (p) { return p.art === a; }).length; }, todo = n('neu') + n('geaendert');
    var lab = { neu: 'neu', geaendert: 'geändert', gleich: 'unverändert', fehler: 'Fehler' };
    box.innerHTML = '<h2>Excel-Import: Vorschau</h2><p><strong>' + n('neu') + '</strong> neu · <strong>' + n('geaendert') + '</strong> geändert · ' + n('gleich') + ' unverändert · <strong' + (n('fehler') ? ' class="xl-err"' : '') + '>' + n('fehler') + '</strong> mit Fehler</p>'
      + (plan.some(function (p) { return p.art !== 'gleich'; }) ? '<div class="table-wrap"><table><thead><tr><th>Zeile</th><th>Projekt</th><th>Ort</th><th>Status</th><th>Hinweis</th></tr></thead><tbody>' + plan.filter(function (p) { return p.art !== 'gleich'; }).map(function (p) {
        return '<tr class="xl-' + p.art + '"><td>' + p.zeile + '</td><td><strong>' + esc(p.titel) + '</strong></td><td>' + esc(p.ort) + '</td><td>' + lab[p.art] + '</td><td>' + esc(p.err.join(' · ')) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '')
      + (n('fehler') ? '<p class="meta">Zeilen mit Fehler werden nicht gespeichert. Bitte in Excel korrigieren und die Datei erneut hochladen.</p>' : '')
      + '<p class="a-actions"><button type="button" class="btn" id="xl-save"' + (todo ? '' : ' disabled') + '>' + (todo ? todo + (todo === 1 ? ' Projekt' : ' Projekte') + ' speichern' : 'Nichts zu speichern') + '</button><label class="check"><input type="checkbox" id="xl-pub"> Sofort veröffentlichen (1 Deploy)</label><button type="button" class="btn ghost" id="xl-cancel">Abbrechen</button></p>';
    box.hidden = false; box.scrollIntoView({ block: 'nearest' });
  }
  $('xl-up').addEventListener('click', function () { $('xl-file').value = ''; $('xl-file').click(); });
  $('xl-file').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return;
    if (!/\.xlsx$/i.test(f.name)) { status('Bitte eine Excel-Datei im Format .xlsx wählen.', 'err'); return; }
    status('Excel-Datei wird gelesen …');
    f.arrayBuffer().then(readXlsx).then(function (rows) { var plan = pruefeExcel(rows); if (!plan.length) throw new Error('Die Datei enthält keine ausgefüllten Zeilen.'); zeigePlan(plan); status(''); })
      .catch(function (err) { $('xl-prev').hidden = true; status('Excel konnte nicht gelesen werden: ' + err.message, 'err'); });
  });
  $('xl-prev').addEventListener('click', function (e) {
    if (e.target.id === 'xl-cancel') { $('xl-prev').hidden = true; xlPlan = null; return; }
    if (e.target.id !== 'xl-save' || !xlPlan) return;
    var todo = xlPlan.filter(function (p) { return p.art === 'neu' || p.art === 'geaendert'; }), pub = $('xl-pub').checked, btn = e.target; btn.disabled = true;
    status(todo.length + ' Projekte werden gespeichert …');
    commit('Excel-Import: ' + todo.length + (todo.length === 1 ? ' Projekt' : ' Projekte') + (pub ? '' : ' [skip netlify]'), todo.map(function (p) { return jsonEntry(p.data); }))
      .then(function () { $('xl-prev').hidden = true; xlPlan = null; return loadList(); })
      .then(function () { status(todo.length + (todo.length === 1 ? ' Projekt' : ' Projekte') + ' gespeichert. ' + (pub ? 'Die Website wird jetzt neu gebaut.' : 'Mit «Website jetzt aktualisieren» gehen sie online.') + ' Fotos bitte pro Projekt in der Maske hinzufügen.', 'ok'); })
      .catch(function (err) { btn.disabled = false; status('Speichern fehlgeschlagen: ' + err.message, 'err'); });
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
