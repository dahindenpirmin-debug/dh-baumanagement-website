// Statischer Website-Generator der DH Baumanagement AG.
// Aufruf: `npm run build` -> erzeugt den Ordner dist/ (wird von Netlify veröffentlicht).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import matter from 'gray-matter';
import crypto from 'node:crypto';
import { SITE, CATS, TYPES, T } from './src/texts.mjs';
import { TOOLS, CONFIG, toolForm, toolResult, toolLabels } from './src/tools.mjs';
import { buildProfile, profileFile } from './src/profil.mjs';
import { REGIONEN, RT } from './src/regionen.mjs';
import { KARTE } from './src/karte.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const LANGS = ['de', 'en'];
const PROD = !!process.env.NETLIFY;
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const u = (lang, p) => (lang === 'de' ? p : '/en' + p);
const abs = (p) => SITE.domain + p;
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const pages = []; // für Sitemap: {de, en}
// Versionskennung für CSS/JS: ändert sich bei jeder Änderung, damit Browser keine alten Dateien aus dem Cache verwenden
const VER = crypto.createHash('md5').update(['src/assets/css/style.css', 'src/assets/js/main.js', 'src/assets/js/tools.js', 'src/tools.mjs'].map((f) => fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), f))).join('')).digest('hex').slice(0, 8);

/* ---------- Helfer ---------- */
function write(urlPath, html) {
  const file = path.join(OUT, urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const first = text.split(/\r?\n/)[0];
  const d = (first.match(/;/g) || []).length >= (first.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === d) { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const head = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.some((c) => c.trim())).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}
const WIX = 'https://static.wixstatic.com/media/';
function img(src, w, h) {
  if (src.startsWith(WIX)) {
    const ext = (src.match(/\.(jpe?g|png|webp)$/i) || ['.jpg'])[0];
    return h ? `${src}/v1/fill/w_${w},h_${h},al_c,q_80,enc_auto/bild${ext}` : `${src}/v1/fit/w_${w},h_${w},q_85,enc_auto/bild${ext}`;
  }
  if (PROD && src.startsWith('/images/')) return `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}${h ? `&h=${h}&fit=cover` : ''}&q=80`;
  return src;
}
const brand = (name, file) => (exists('src/images/' + file) ? '/images/' + file : SITE.remote[name]);
const MARK = exists('src/images/logo-mark.png') ? '/images/logo-mark.png' : null;
const ICONS = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'src/assets/icons')).filter((f) => f.endsWith('.svg')).map((f) => [f.replace('.svg', ''), fs.readFileSync(path.join(ROOT, 'src/assets/icons', f), 'utf8').trim()]));
const ILLUS = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'src/assets/illus')).filter((f) => f.endsWith('.svg')).map((f) => [f.replace('.svg', ''), fs.readFileSync(path.join(ROOT, 'src/assets/illus', f), 'utf8').trim().replace('<svg ', '<svg width="64" height="50" ')]));
// Kategorie-Illustration (goldenes Objekt auf blauer Kachel); Fallback: Linien-Icon
// Helle Variante der Illustrationen für die Website: Baukörper blau, Seitenflächen blaugrau, Gold nur als Akzent
const hell = (svg) => svg.replace(/(<path d="M4 97[^>]*?)fill="#e7c984"/g, '$1fill="@G@"').replace(/fill="#0e2f47"/g, 'fill="var(--art-bg)"').replace(/stroke="#0e2f47"/g, 'stroke="var(--art-bg)"')
  .replace(/fill="#e7c984"/g, 'fill="#0e2f47"').replace(/fill="#f3e3b8"/g, 'fill="#5d7385"').replace(/fill="#cdb98a"/g, 'fill="#c3ccd3"').replace(/fill="#b9ad90"/g, 'fill="#aab5be"').replace(/stroke="#f3e3b8"/g, 'stroke="#e7c984"').replace(/@G@/g, '#e7c984');
const icon = (name) => (ILLUS[name] ? `<span class="art">${hell(ILLUS[name])}</span>` : ICONS[name] ? `<span class="icon">${ICONS[name]}</span>` : '');
const HEROP = SITE.heroProjekt && exists('src/images/projekte/' + SITE.heroProjekt) ? '/images/projekte/' + SITE.heroProjekt : null;
const LOGO = brand('logo', 'logo.png'), HERO = brand('hero', 'hero.jpg'), PORTRAIT = brand('portrait', 'martin-dahinden.jpg');

/* ---------- Daten laden ---------- */
const CSVCOLS = ['slug', 'titel_de', 'titel_en', 'kategorie', 'projektart', 'ort', 'kanton', 'jahr_von', 'jahr_bis', 'leistungen_de', 'leistungen_en', 'bauherr', 'beschreibung_de', 'beschreibung_en', 'kennzahlen_de', 'kennzahlen_en', 'bilder', 'dokument', 'featured', 'bauvolumen_mchf', 'lat', 'lng'];
let ALLROWS = [];
function loadProjects() {
  let rows = parseCSV(fs.readFileSync(path.join(ROOT, 'data/projekte.csv'), 'utf8'));
  // Projekte aus dem Admin-Bereich: eine JSON-Datei pro Projekt in data/projekte/. Sie ergänzen die CSV
  // und überschreiben eine CSV-Zeile mit demselben Slug.
  const jdir = path.join(ROOT, 'data/projekte');
  const neu = [];
  if (fs.existsSync(jdir)) for (const f of fs.readdirSync(jdir).filter((x) => x.endsWith('.json'))) {
    const j = JSON.parse(fs.readFileSync(path.join(jdir, f), 'utf8')), r = {};
    for (const [k, v] of Object.entries(j)) r[k] = Array.isArray(v) ? v.join('|') : v === true ? 'ja' : v === false || v == null ? '' : String(v);
    r.slug = r.slug || f.replace(/\.json$/, '');
    const i = rows.findIndex((x) => x.slug === r.slug);
    if (i >= 0) rows[i] = { ...rows[i], ...r }; else neu.push(r);
  }
  neu.sort((a, b) => (b.erfasst || '').localeCompare(a.erfasst || ''));
  rows = [...neu, ...rows].map((r) => ({ ...Object.fromEntries(CSVCOLS.map((k) => [k, ''])), ...r }));
  ALLROWS = rows;
  rows = rows.filter((r) => !r.versteckt);
  return rows.map((r, i) => {
    if (!r.slug) throw new Error(`projekte.csv Zeile ${i + 2}: slug fehlt`);
    if (!CATS[r.kategorie]) throw new Error(`projekte.csv «${r.slug}»: unbekannte kategorie «${r.kategorie}» (erlaubt: ${Object.keys(CATS).join(', ')})`);
    if (!TYPES[r.projektart]) throw new Error(`projekte.csv «${r.slug}»: unbekannte projektart «${r.projektart}» (erlaubt: ${Object.keys(TYPES).join(', ')})`);
    let bilder = r.bilder ? r.bilder.split('|').map((b) => b.trim()).filter(Boolean).map((b) => (b.startsWith('wix:') ? WIX + b.slice(4) : /^https?:/.test(b) ? b : `/images/projekte/${r.slug}/${b}`)) : [];
    const dir = path.join(ROOT, 'src/images/projekte', r.slug);
    if (fs.existsSync(dir)) bilder = [...fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort().map((f) => `/images/projekte/${r.slug}/${f}`), ...bilder.filter((b) => /^https?:/.test(b))];
    const zeit = (l) => (!r.jahr_bis || r.jahr_bis === r.jahr_von ? r.jahr_von : `${r.jahr_von}–${r.jahr_bis}`);
    return { ...r, bilder, zeit: zeit(), featured: /^(ja|yes|x|1)$/i.test(r.featured), order: i,
      t: { de: r.titel_de, en: r.titel_en || r.titel_de },
      leist: { de: r.leistungen_de.split('|').map((s) => s.trim()).filter(Boolean), en: (r.leistungen_en || r.leistungen_de).split('|').map((s) => s.trim()).filter(Boolean) },
      lat: parseFloat(r.lat) || null, lng: parseFloat(r.lng) || null,
      vol: r.bauvolumen_mchf ? (/[a-z]/i.test(r.bauvolumen_mchf) ? r.bauvolumen_mchf.trim() : r.bauvolumen_mchf.trim() + ' MCHF') : '',
      beschr: { de: r.beschreibung_de, en: r.beschreibung_en || '' }, kenn: { de: r.kennzahlen_de, en: r.kennzahlen_en || '' } };
  });
}
function loadArticles(lang) {
  const dir = path.join(ROOT, 'content/wissen', lang);
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort().map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
    const slug = f.replace(/^\d+-/, '').replace(/\.md$/, '');
    for (const k of ['id', 'title', 'description', 'category', 'summary']) if (!data[k]) throw new Error(`${lang}/${f}: Feld «${k}» fehlt`);
    const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date || '2026-11-25');
    return { ...data, date, slug, lang, md: content, html: marked.parse(content), min: Math.max(3, Math.round(content.split(/\s+/).length / 200)), url: u(lang, `/wissen/${slug}/`) };
  });
}
const projects = loadProjects();
const articles = { de: loadArticles('de'), en: loadArticles('en') };

/* ---------- Layout ---------- */
const orgLd = {
  '@context': 'https://schema.org', '@type': ['ProfessionalService', 'LocalBusiness'], '@id': SITE.domain + '/#organisation', name: SITE.name, url: SITE.domain, logo: LOGO.startsWith('/') ? abs(LOGO) : LOGO,
  image: HERO.startsWith('/') ? abs(HERO) : HERO, telephone: SITE.phoneIntl, email: SITE.email, vatID: SITE.uid,
  address: { '@type': 'PostalAddress', streetAddress: SITE.street, postalCode: SITE.zip, addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  areaServed: ['Luzern', 'Zentralschweiz', 'Aargau', 'Zürich', 'Bern', 'Schweiz'], sameAs: [SITE.linkedin],
  founder: { '@type': 'Person', name: 'Martin Dahinden', jobTitle: 'Projektleiter und Inhaber' },
  knowsAbout: ['Baumanagement', 'Bauherrenvertretung', 'Gesamtprojektleitung', 'Bauleitung', 'Kostenplanung', 'Arealentwicklung', 'Industriebau', 'Gewerbebau', 'Sanierung'],
};
const crumbLd = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })) });

function layout({ lang, title, desc, paths, body, ld = [], ogImage, active = '', noindex = false, crumbs }) {
  const t = T[lang], other = lang === 'de' ? 'en' : 'de', self = paths[lang];
  if (!noindex) pages.push(paths);
  const nav = [['leistungen', '/leistungen/'], ['projekte', '/projekte/'], ['wissen', '/wissen/'], ['tools', '/tools/'], ['kontakt', '/kontakt/']];
  const lds = [orgLd, ...(crumbs ? [crumbLd(crumbs)] : []), ...ld];
  const og = ogImage ? (ogImage.startsWith('/') ? abs(ogImage) : ogImage) : abs('/og-image.jpg');
  return `<!doctype html>
<html lang="${lang === 'de' ? 'de-CH' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | ${SITE.name}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${abs(self)}">
<link rel="alternate" hreflang="de-CH" href="${abs(paths.de)}">
<link rel="alternate" hreflang="en" href="${abs(paths.en)}">
<link rel="alternate" hreflang="x-default" href="${abs(paths.de)}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(self)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:locale" content="${lang === 'de' ? 'de_CH' : 'en_GB'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/css/style.css?v=${VER}">
${lds.map((l) => `<script type="application/ld+json">${JSON.stringify(l).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#inhalt">${t.skip}</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="logo" href="${u(lang, '/')}" aria-label="${SITE.name} – Home">${exists('src/images/logo-quer-hell.svg') ? `<img src="/images/logo-quer-hell.svg" alt="${SITE.name}" width="252" height="46">` : `<img src="${img(LOGO, 400, 0)}" alt="${SITE.name}" width="200" height="56">`}</a>
    <button class="burger" aria-expanded="false" aria-controls="nav" aria-label="${t.menu}"><span></span><span></span><span></span></button>
    <nav id="nav" aria-label="Hauptnavigation">
      <ul>${nav.map(([k, p]) => `<li><a href="${u(lang, p)}"${active === k ? ' aria-current="page"' : ''}>${t.nav[k]}</a></li>`).join('')}
      <li class="lang"><a href="${paths[other]}" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a></li></ul>
    </nav>
  </div>
</header>
<main id="inhalt">
${body}
</main>
<footer class="site-footer">
  <div class="wrap cols">
    <div><strong>${SITE.name}</strong><br>${SITE.street}<br>${SITE.zip} ${SITE.city}</div>
    <div><a href="tel:${SITE.phoneIntl}">${SITE.phone}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.linkedin}" rel="noopener">LinkedIn</a></div>
    <div>${nav.map(([k, p]) => `<a href="${u(lang, p)}">${t.nav[k]}</a>`).join('<br>')}</div>
    <div><strong>${RT[lang].nav}</strong><br>${REGIONEN.map((r) => `<a href="${regUrl(r, lang)}">${r.name[lang]}</a>`).join('<br>')}</div>
    <div><a href="${profileUrl(lang)}" download>${t.profil.b}</a><br><a href="${u(lang, '/impressum-datenschutz/')}">${t.footer.legal}</a><br>${SITE.uid}<br>© ${new Date().getFullYear()} ${SITE.name}</div>
  </div>
</footer>
<script src="/assets/js/main.js?v=${VER}" defer></script>
</body>
</html>`;
}
const regUrl = (r, lang) => u(lang, `/regionen/${r.slug[lang]}/`);
const regRefs = (r) => projects.filter((p) => r.kantone.includes(p.kanton));
const regBlock = (lang) => `<aside class="region-hint"><strong>${RT[lang].block}</strong><p>${RT[lang].blockText} ${REGIONEN.map((r) => `<a href="${regUrl(r, lang)}">${r.name[lang]}</a>`).join(' · ')}</p></aside>`;
const cta = (lang) => `<section class="cta"><div class="wrap"><h2>${T[lang].cta.h}</h2><p>${T[lang].cta.p}</p><p><a class="btn" href="${u(lang, '/kontakt/')}">${T[lang].cta.b}</a> <a class="btn ghost" href="tel:${SITE.phoneIntl}">${SITE.phone}</a></p></div></section>`;
const grafik = (name, lang, alt) => (exists(`src/images/grafiken/${name}-${lang}.svg`) ? `<div class="grafik"><img src="/images/grafiken/${name}-${lang}.svg" alt="${alt}" loading="lazy" width="1200" height="${name === 'leistungen' ? 430 : 330}"></div>` : '');
const profileUrl = (lang, v) => '/downloads/' + profileFile(lang, v);
const anyVol = () => projects.some((p) => p.vol);
const profileBox = (lang) => `<section class="alt"><div class="wrap download"><div><h2>${T[lang].profil.h}</h2><p>${T[lang].profil.p}</p></div><div class="btns"><a class="btn" href="${profileUrl(lang)}" download>${T[lang].profil.b1}</a><a class="btn ghost" href="${profileUrl(lang, 'portfolio')}" download>${T[lang].profil.b2}</a></div></div></section>`;
const pageHead = (h1, lead, crumbs) => `<section class="page-head"><div class="wrap">${crumbs ? `<nav class="crumbs" aria-label="Breadcrumb">${crumbs.map(([n, p], i) => (i < crumbs.length - 1 ? `<a href="${p}">${esc(n)}</a>` : `<span>${esc(n)}</span>`)).join(' › ')}</nav>` : ''}<h1>${esc(h1)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</div></section>`;

/* ---------- Bausteine ---------- */
const KT = { ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz', OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Freiburg', SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen', AR: 'Appenzell Ausserrhoden', AI: 'Appenzell Innerrhoden', SG: 'St. Gallen', GR: 'Graubünden', AG: 'Aargau', TG: 'Thurgau', TI: 'Tessin', VD: 'Waadt', VS: 'Wallis', NE: 'Neuenburg', GE: 'Genf', JU: 'Jura' };
const pdata = (p, lang) => `data-slug="${p.slug}" data-cat="${p.kategorie}" data-type="${p.projektart}" data-kt="${p.kanton || ''}" data-von="${p.jahr_von}" data-bis="${p.jahr_bis || p.jahr_von}" data-q="${esc([p.t[lang], p.ort, KT[p.kanton] || '', CATS[p.kategorie][lang], TYPES[p.projektart][lang], p.leist[lang].join(' '), p.bauherr || ''].join(' ').toLowerCase())}"`;
const mapXY = (lat, lng) => [(lng - KARTE.LNG0) * KARTE.COS * KARTE.K, (KARTE.LAT1 - lat) * KARTE.K];
function mapSvg(lang) {
  const cl = [];
  for (const p of projects.filter((x) => x.lat && x.lng)) {
    const [x, y] = mapXY(p.lat, p.lng), c = cl.find((k) => Math.hypot(k.x - x, k.y - y) < 20);
    if (c) { c.items.push(p); c.x = (c.x * (c.items.length - 1) + x) / c.items.length; c.y = (c.y * (c.items.length - 1) + y) / c.items.length; } else cl.push({ x, y, items: [p] });
  }
  const ref = (n) => (lang === 'de' ? (n === 1 ? '1 Referenz' : `${n} Referenzen`) : n === 1 ? '1 reference' : `${n} references`);
  return `<svg viewBox="0 0 ${KARTE.W} ${KARTE.H}" role="group" aria-label="${lang === 'de' ? 'Karte der Schweiz mit unseren Referenzen' : 'Map of Switzerland with our references'}"><path class="land" d="${KARTE.land}"/><path class="grenzen" d="${KARTE.grenzen}"/><path class="seen" d="${KARTE.seen}"/>${cl.sort((a, b) => a.y - b.y).map((c) => { const orte = [...new Set(c.items.map((p) => p.ort))].join(', '), n = c.items.length; return `<g class="pin" tabindex="0" role="button" data-slugs="${c.items.map((p) => p.slug).join(',')}" aria-label="${esc(orte)}: ${ref(n)}"><title>${esc(orte)}: ${ref(n)}</title><circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${n > 1 ? 13 : 9}"/>${n > 1 ? `<text x="${c.x.toFixed(1)}" y="${(c.y + 4.5).toFixed(1)}">${n}</text>` : ''}</g>`; }).join('')}</svg>`;
}
function projectCard(p, lang) {
  const pic = p.bilder[0];
  return `<article class="card project" ${pdata(p, lang)}>
  <a href="${u(lang, `/projekte/${p.slug}/`)}">
    <div class="thumb">${pic ? `<img src="${img(pic, 640, 480)}" alt="${esc(p.t[lang])}, ${esc(p.ort)}" loading="lazy" width="640" height="480">` : `<div class="ph" aria-hidden="true">${ILLUS[p.kategorie === 'wohnen' ? 'wohnbau' : 'gewerbe'] || ''}</div>`}</div>
    <div class="card-body"><p class="tag">${CATS[p.kategorie][lang]} · ${TYPES[p.projektart][lang]}</p><h3>${esc(p.t[lang])}</h3><p class="meta">${esc(p.ort)}${p.kanton ? ' ' + p.kanton : ''} · ${p.zeit}${p.vol ? ' · ' + esc(p.vol) : ''}</p><p class="meta leist">${p.leist[lang].map(esc).join(', ')}</p></div>
  </a></article>`;
}
const articleCard = (a, lang) => `<article class="card"><a href="${a.url}"><div class="card-body"><p class="tag">${esc(a.category)}</p><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><p class="meta">${a.min} ${T[lang].wissen.min}</p></div></a></article>`;
const toolCard = (tl, lang) => `<article class="card"><a href="${u(lang, `/tools/${tl.slug[lang]}/`)}"><div class="card-body">${icon(tl.icon)}<h3>${tl.title[lang]}</h3><p>${tl.kurz[lang]}</p><p class="more">${T[lang].tools.open} →</p></div></a></article>`;

/* ---------- Seiten ---------- */
function buildHome(lang) {
  const t = T[lang], h = t.home, paths = { de: '/', en: '/en/' };
  const body = `<section class="hero" style="background-image:linear-gradient(90deg,rgba(10,36,54,.94) 0%,rgba(14,47,71,.78) 45%,rgba(14,47,71,.15) 100%),url('${img(HEROP || HERO, 2000, 1100)}')">
  <div class="wrap"><p class="eyebrow">${SITE.name} · ${SITE.city}</p><h1>${h.h1.replace('Gesamtdienstleistungsanbieter', 'Gesamtdienst&shy;leistungs&shy;anbieter')}</h1><p class="lead">${h.lead}</p>
  <p><a class="btn" href="${u(lang, '/kontakt/')}">${h.cta1}</a> <a class="btn ghost light" href="${u(lang, '/projekte/')}">${h.cta2}</a></p></div></section>
<section class="facts"><div class="wrap grid3">${h.facts.map(([n, l]) => `<div><strong>${n}</strong><span>${l}</span></div>`).join('')}</div></section>
<section><div class="wrap"><h2>${h.servicesH}</h2><div class="grid4">${t.services.map((s) => `<article class="card"><a href="${u(lang, '/leistungen/')}#${s.id}"><div class="card-body">${icon(s.icon)}<h3>${s.t}</h3><p>${s.k}</p></div></a></article>`).join('')}</div></div></section>
<section class="alt"><div class="wrap"><h2>${t.segments.h}</h2><div class="grid4">${t.segments.items.map(([a, b, l, ic, k]) => `<article class="card"><a href="${u(lang, l)}"><div class="card-body">${icon(ic)}<h3>${a}</h3><p>${k}</p></div></a></article>`).join('')}</div></div></section>
<section><div class="wrap"><div class="h-row"><h2>${h.projectsH}</h2><a href="${u(lang, '/projekte/')}">${h.projectsAll} →</a></div><div class="grid3">${projects.filter((p) => p.featured).slice(0, 6).map((p) => projectCard(p, lang)).join('')}</div></div></section>
<section class="alt about"><div class="wrap split"><img src="${img(PORTRAIT, 600, 720)}" alt="Martin Dahinden, ${lang === 'de' ? 'Projektleiter und Inhaber' : 'project manager and owner'}" loading="lazy" width="600" height="720">
  <div><h2>${h.aboutH}</h2><p class="quote">${h.quote}</p><p>${h.about}</p><p class="claim">${h.claim}</p><p><a class="btn ghost" href="${profileUrl(lang)}" download>${t.profil.b}</a></p></div></div></section>
<section><div class="wrap"><div class="h-row"><h2>${RT[lang].h1}</h2><a href="${u(lang, '/regionen/')}">${RT[lang].nav} →</a></div><div class="grid4">${REGIONEN.map((r) => `<article class="card"><a href="${regUrl(r, lang)}"><div class="card-body"><h3>${r.name[lang]}</h3><p>${RT[lang].anzahl(regRefs(r).length)}</p><p class="more">${RT[lang].mehr} →</p></div></a></article>`).join('')}</div></div></section>
<section class="alt"><div class="wrap"><div class="h-row"><h2>${h.knowH}</h2><a href="${u(lang, '/wissen/')}">${h.knowAll} →</a></div><div class="grid3">${articles[lang].filter((a) => a.featured).slice(0, 3).map((a) => articleCard(a, lang)).join('')}</div></div></section>
<section><div class="wrap"><h2>${h.toolsH}</h2><p class="lead">${h.toolsLead}</p><div class="grid3">${TOOLS.map((tl) => toolCard(tl, lang)).join('')}</div></div></section>
${cta(lang)}`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.domain, inLanguage: ['de-CH', 'en'] }];
  write(paths[lang], layout({ lang, title: h.title, desc: h.desc, paths, body, ld }));
}

function buildLeistungen(lang) {
  const t = T[lang], paths = { de: '/leistungen/', en: '/en/leistungen/' };
  const crumbs = [[t.crumbHome, u(lang, '/')], [t.nav.leistungen, paths[lang]]];
  const body = `${pageHead(t.leistungen.h1, t.leistungen.lead, crumbs)}

<section><div class="wrap">${t.services.map((s) => `<article class="service" id="${s.id}"><div>${icon(s.icon)}<h2>${s.t}</h2><p>${s.p}</p></div><ul class="check">${s.li.map((x) => `<li>${x}</li>`).join('')}</ul></article>`).join('')}</div></section>
<section class="alt"><div class="wrap"><h2>${t.leistungen.whatH}</h2><div class="grid3">${t.strengths.map(([a, b]) => `<div class="card"><div class="card-body"><h3>${a}</h3><p>${b}</p></div></div>`).join('')}</div></div></section>
<section><div class="wrap"><h2>${t.segments.h}</h2><div class="grid4">${t.segments.items.map(([a, b, l, ic]) => `<article class="card"><a href="${u(lang, l)}"><div class="card-body">${icon(ic)}<h3>${a}</h3><p>${b}</p></div></a></article>`).join('')}</div></div></section>
${profileBox(lang)}
${cta(lang)}`;
  const ld = t.services.map((s) => ({ '@context': 'https://schema.org', '@type': 'Service', name: s.t, description: s.p, provider: { '@id': SITE.domain + '/#organisation' }, areaServed: 'CH' }));
  write(paths[lang], layout({ lang, title: t.leistungen.title, desc: t.leistungen.desc, paths, body, ld, active: 'leistungen', crumbs }));
}

function buildProjekte(lang) {
  const t = T[lang], tp = t.projekte, paths = { de: '/projekte/', en: '/en/projekte/' };
  const crumbs = [[t.crumbHome, u(lang, '/')], [t.nav.projekte, paths[lang]]];
  const F = lang === 'de' ? { map: 'Punkt anklicken, um die Referenzen an diesem Ort zu zeigen.', q: 'Suche (Projekt, Ort, Leistung)', cat: 'Kategorie', type: 'Projektart', kt: 'Kanton', von: 'Jahr ab', bis: 'Jahr bis', one: 'Referenz', many: 'Referenzen', reset: 'Zurücksetzen', empty: 'Keine Referenz entspricht dieser Auswahl.' } : { map: 'Click a point to show the references at that location.', q: 'Search (project, location, service)', cat: 'Category', type: 'Project type', kt: 'Canton', von: 'Year from', bis: 'Year to', one: 'reference', many: 'references', reset: 'Reset', empty: 'No reference matches this selection.' };
  const opts = (obj, field) => Object.entries(obj).filter(([k]) => projects.some((p) => p[field] === k)).map(([k, v]) => `<option value="${k}">${v[lang]}</option>`).join('');
  const ys = projects.flatMap((p) => [+p.jahr_von, +(p.jahr_bis || p.jahr_von)]).filter(Boolean), years = []; for (let y = Math.max(...ys); y >= Math.min(...ys); y--) years.push(y);
  const btns = (group, obj) => `<div class="filter" role="group" data-group="${group}"><button class="on" data-val="">${tp.all}</button>${Object.entries(obj).filter(([k]) => projects.some((p) => p[group === 'cat' ? 'kategorie' : 'projektart'] === k)).map(([k, v]) => `<button data-val="${k}">${v[lang]}</button>`).join('')}</div>`;
  const body = `${pageHead(tp.h1, tp.lead, crumbs)}
<section><div class="wrap">
  <div class="refmap">${mapSvg(lang)}<p class="meta">${F.map}</p></div>
  <form class="reffilter" id="p-filter" onsubmit="return false">
    <input type="search" id="f-q" placeholder="${F.q}" aria-label="${F.q}">
    <select id="f-cat" aria-label="${F.cat}"><option value="">${F.cat}</option>${opts(CATS, 'kategorie')}</select>
    <select id="f-type" aria-label="${F.type}"><option value="">${F.type}</option>${opts(TYPES, 'projektart')}</select>
    <select id="f-kt" aria-label="${F.kt}"><option value="">${F.kt}</option>${[...new Set(projects.map((p) => p.kanton).filter(Boolean))].sort((x, y) => (KT[x] || x).localeCompare(KT[y] || y)).map((k) => `<option value="${k}">${KT[k] || k}</option>`).join('')}</select>
    <select id="f-von" aria-label="${F.von}"><option value="">${F.von}</option>${years.map((y) => `<option>${y}</option>`).join('')}</select>
    <select id="f-bis" aria-label="${F.bis}"><option value="">${F.bis}</option>${years.map((y) => `<option>${y}</option>`).join('')}</select>
  </form>
  <div class="refbar"><strong id="p-count" data-one="${F.one}" data-many="${F.many}">${projects.length} ${F.many}</strong>
    <div class="filter view" role="group"><button class="on" data-view="grid">${tp.grid}</button><button data-view="table">${tp.table}</button><button type="button" id="f-reset">${F.reset}</button></div></div>
  <p id="p-empty" class="lead" hidden>${F.empty}</p>
  <div class="grid3" id="p-grid">${projects.map((p) => projectCard(p, lang)).join('')}</div>
  <div class="table-wrap" id="p-table" hidden><table><thead><tr>${[...tp.th.slice(0, 5), ...(anyVol() ? [t.profil.vol] : []), tp.th[5]].map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>
  ${projects.map((p) => `<tr ${pdata(p, lang)}><td><a href="${u(lang, `/projekte/${p.slug}/`)}">${esc(p.t[lang])}</a></td><td>${CATS[p.kategorie][lang]}</td><td>${TYPES[p.projektart][lang]}</td><td>${esc(p.ort)}${p.kanton ? ' ' + p.kanton : ''}</td><td>${p.zeit}</td>${anyVol() ? `<td>${esc(p.vol) || '–'}</td>` : ''}<td>${p.leist[lang].map(esc).join(', ')}</td></tr>`).join('\n  ')}
  </tbody></table></div>
</div></section>
${profileBox(lang)}
${cta(lang)}`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.t[lang], url: abs(u(lang, `/projekte/${p.slug}/`)) })) }];
  write(paths[lang], layout({ lang, title: tp.title, desc: tp.desc, paths, body, ld, active: 'projekte', crumbs }));

  for (const p of projects) {
    const pp = { de: `/projekte/${p.slug}/`, en: `/en/projekte/${p.slug}/` };
    const typ = TYPES[p.projektart][lang], f = tp.facts;
    const auto = tp.auto({ typ, ort: p.ort, kanton: p.kanton, zeit: p.zeit, leist: p.leist[lang].join(', ') });
    const text = p.beschr[lang] || auto;
    const cr = [...crumbs.slice(0, 1), [t.nav.projekte, paths[lang]], [p.t[lang], pp[lang]]];
    const more = projects.filter((x) => x.kategorie === p.kategorie && x.slug !== p.slug).slice(0, 3);
    const pbody = `${pageHead(p.t[lang], '', cr)}
<section><div class="wrap split top">
  <div>${text.split(/\n{2,}|\\n\\n/).map((x) => `<p>${esc(x)}</p>`).join('')}${p.kenn[lang] ? `<ul class="check">${p.kenn[lang].split('|').map((k) => `<li>${esc(k.trim())}</li>`).join('')}</ul>` : ''}
  ${p.dokument ? `<p><a class="btn ghost" href="${esc(p.dokument)}">${f.doc}</a></p>` : ''}</div>
  <dl class="facts-list"><dt>${f.cat}</dt><dd>${CATS[p.kategorie][lang]}</dd><dt>${f.type}</dt><dd>${typ}</dd><dt>${f.loc}</dt><dd>${esc(p.ort)}${p.kanton ? ' ' + p.kanton : ''}</dd><dt>${f.time}</dt><dd>${p.zeit}</dd>${p.vol ? `<dt>${t.profil.vol}</dt><dd>${esc(p.vol)}</dd>` : ''}${p.bauherr ? `<dt>${f.client}</dt><dd>${esc(p.bauherr)}</dd>` : ''}<dt>${f.serv}</dt><dd>${p.leist[lang].map(esc).join('<br>')}</dd></dl>
</div></section>
${p.bilder.length ? `<section class="alt"><div class="wrap gallery">${p.bilder.map((b, i) => `<a href="${img(b, 1800)}"><img src="${img(b, 900, 675)}" alt="${esc(p.t[lang])}, ${esc(p.ort)} – ${lang === 'de' ? 'Bild' : 'image'} ${i + 1}" loading="${i ? 'lazy' : 'eager'}" width="900" height="675"></a>`).join('')}</div></section>` : ''}
${more.length ? `<section><div class="wrap"><div class="h-row"><h2>${tp.more}</h2><a href="${paths[lang]}">${tp.back} →</a></div><div class="grid3">${more.map((x) => projectCard(x, lang)).join('')}</div></div></section>` : ''}
${cta(lang)}`;
    const pld = [{ '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.t[lang], description: text, url: abs(pp[lang]), creator: { '@id': SITE.domain + '/#organisation' }, temporalCoverage: p.jahr_bis && p.jahr_bis !== p.jahr_von ? `${p.jahr_von}/${p.jahr_bis}` : p.jahr_von, genre: `${CATS[p.kategorie][lang]} – ${typ}`, locationCreated: { '@type': 'Place', name: p.ort, address: { '@type': 'PostalAddress', addressLocality: p.ort, addressRegion: p.kanton || undefined, addressCountry: 'CH' } }, image: p.bilder.map((b) => (b.startsWith('/') ? abs(b) : b)) }];
    write(pp[lang], layout({ lang, title: `${p.t[lang]}, ${p.ort}`, desc: text.slice(0, 158), paths: pp, body: pbody, ld: pld, active: 'projekte', crumbs: cr, ogImage: p.bilder[0] ? img(p.bilder[0], 1200, 630) : undefined }));
  }
}

function buildWissen(lang) {
  const t = T[lang], tw = t.wissen, paths = { de: '/wissen/', en: '/en/wissen/' }, list = articles[lang];
  const crumbs = [[t.crumbHome, u(lang, '/')], [t.nav.wissen, paths[lang]]];
  const cats = [...new Set(list.map((a) => a.category))];
  const body = `${pageHead(tw.h1, tw.lead, crumbs)}
${cats.map((c, i) => `<section${i % 2 ? ' class="alt"' : ''}><div class="wrap"><h2>${esc(c)}</h2><div class="grid3">${list.filter((a) => a.category === c).map((a) => articleCard(a, lang)).join('')}</div></div></section>`).join('\n')}
${cta(lang)}`;
  write(paths[lang], layout({ lang, title: tw.title, desc: tw.desc, paths, body, active: 'wissen', crumbs, ld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: tw.h1, url: abs(paths[lang]), publisher: { '@id': SITE.domain + '/#organisation' } }] }));

  for (const a of list) {
    const o = lang === 'de' ? 'en' : 'de', tr = articles[o].find((x) => x.id === a.id);
    const ap = { [lang]: a.url, [o]: tr ? tr.url : paths[o] };
    const cr = [...crumbs, [a.title, a.url]];
    const rel = [...list.filter((x) => x.category === a.category && x.id !== a.id), ...list.filter((x) => x.category !== a.category)].slice(0, 3);
    const toolHint = a.tool ? TOOLS.find((x) => x.id === a.tool) : null;
    const abody = `<article class="post">${pageHead(a.title, '', cr)}
<div class="wrap narrow">
  <p class="meta">${esc(a.category)} · ${a.min} ${tw.min} · ${tw.updated}: <time datetime="${a.date}">${a.date.split('-').reverse().join('.')}</time></p>
  <aside class="brief"><strong>${tw.brief}</strong><p>${esc(a.summary)}</p></aside>
  <div class="prose">${a.html}</div>
  ${toolHint ? `<aside class="tool-hint"><strong>${toolHint.title[lang]}</strong><p>${toolHint.desc[lang]}</p><a class="btn" href="${u(lang, `/tools/${toolHint.slug[lang]}/`)}">${t.tools.open}</a></aside>` : ''}
  ${a.faq?.length ? `<section class="faq"><h2>${tw.faq}</h2>${a.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : ''}
  ${regBlock(lang)}
  <p class="byline">${tw.by}</p><p class="disclaimer">${tw.disclaimer}</p>
</div></article>
<section class="alt"><div class="wrap"><h2>${tw.related}</h2><div class="grid3">${rel.map((x) => articleCard(x, lang)).join('')}</div></div></section>
${cta(lang)}`;
    const ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description, abstract: a.summary, inLanguage: lang === 'de' ? 'de-CH' : 'en', datePublished: a.date, dateModified: a.date, mainEntityOfPage: abs(a.url), articleSection: a.category, author: { '@type': 'Person', name: 'Martin Dahinden', jobTitle: 'dipl. Techniker HF Hochbau', worksFor: { '@id': SITE.domain + '/#organisation' } }, publisher: { '@id': SITE.domain + '/#organisation' } }];
    if (a.faq?.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: a.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
    write(a.url, layout({ lang, title: a.title, desc: a.description, paths: ap, body: abody, ld, active: 'wissen', crumbs: cr }));
  }
}

function buildTools(lang) {
  const t = T[lang], tt = t.tools, paths = { de: '/tools/', en: '/en/tools/' }, l = toolLabels(lang);
  const crumbs = [[t.crumbHome, u(lang, '/')], [t.nav.tools, paths[lang]]];
  write(paths[lang], layout({ lang, title: tt.title, desc: tt.desc, paths, active: 'tools', crumbs, body: `${pageHead(tt.h1, tt.lead, crumbs)}<section><div class="wrap grid3">${TOOLS.map((x) => toolCard(x, lang)).join('')}</div></section>${cta(lang)}` }));
  for (const tool of TOOLS) {
    const tp = { de: `/tools/${tool.slug.de}/`, en: `/en/tools/${tool.slug.en}/` };
    const cr = [...crumbs, [tool.title[lang], tp[lang]]];
    const body = `${pageHead(tool.title[lang], tool.intro[lang], cr)}
<section><div class="wrap split top tool" data-tool="${tool.id}" data-lang="${lang}">
  <form class="tool-form" onsubmit="return false">${toolForm(tool, lang)}<button class="btn" type="submit">${l.calc}</button></form>
  ${toolResult(tool, lang, tt.note, u(lang, '/impressum-datenschutz/'), t.footer.legal)}
</div></section>
<script type="application/json" id="tool-config">${JSON.stringify({ c: CONFIG, l, s: { name: SITE.name, addr: `${SITE.street}, ${SITE.zip} ${SITE.city}`, phone: SITE.phone, email: SITE.email, web: SITE.domain.replace('https://', ''), claim: t.home.h1 } })}</script>
<script src="/assets/js/tools.js?v=${VER}" defer></script>
<section class="alt"><div class="wrap grid3">${TOOLS.filter((x) => x.id !== tool.id).map((x) => toolCard(x, lang)).join('')}</div></section>`;
    const ld = [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: tool.title[lang], description: tool.desc[lang], url: abs(tp[lang]), applicationCategory: 'BusinessApplication', operatingSystem: 'All', offers: { '@type': 'Offer', price: '0', priceCurrency: 'CHF' }, provider: { '@id': SITE.domain + '/#organisation' } }];
    write(tp[lang], layout({ lang, title: tool.title[lang], desc: tool.desc[lang], paths: tp, body, ld, active: 'tools', crumbs: cr }));
  }
}

function buildRegionen(lang) {
  const t = T[lang], rt = RT[lang], paths = { de: '/regionen/', en: '/en/regionen/' };
  const crumbs = [[t.crumbHome, u(lang, '/')], [rt.nav, paths[lang]]];
  const body = `${pageHead(rt.h1, rt.lead, crumbs)}
<section><div class="wrap grid4">${REGIONEN.map((r) => `<article class="card"><a href="${regUrl(r, lang)}"><div class="card-body"><h3>${r.name[lang]}</h3><p>${r.lead[lang]}</p><p class="meta">${rt.anzahl(regRefs(r).length)}</p><p class="more">${rt.mehr} →</p></div></a></article>`).join('')}</div>
<div class="wrap"><p class="lead" style="margin-top:32px">${rt.sonst}</p></div></section>
${cta(lang)}`;
  write(paths[lang], layout({ lang, title: rt.title, desc: rt.desc, paths, body, crumbs }));
  for (const r of REGIONEN) {
    const rp = { de: `/regionen/${r.slug.de}/`, en: `/en/regionen/${r.slug.en}/` }, refs = regRefs(r), cr = [...crumbs, [r.name[lang], rp[lang]]];
    const art = articles[lang].find((a) => a.id === r.artikel);
    const rbody = `${pageHead(r.title[lang], r.lead[lang], cr)}
<section><div class="wrap split top"><div>${r.text[lang].map((x) => `<p>${x}</p>`).join('')}${art ? `<p><strong>${rt.lesen}:</strong> <a href="${art.url}">${esc(art.title)}</a></p>` : ''}</div>
<div><h2>${rt.was}</h2><ul class="check">${r.punkte[lang].map((x) => `<li>${x}</li>`).join('')}</ul></div></div></section>
${refs.length ? `<section class="alt"><div class="wrap"><div class="h-row"><h2>${rt.refs}</h2><a href="${u(lang, '/projekte/')}">${t.home.projectsAll} →</a></div><div class="grid3">${refs.map((p) => projectCard(p, lang)).join('')}</div></div></section>` : ''}
<section><div class="wrap"><h2>${rt.andere}</h2><div class="grid3">${REGIONEN.filter((x) => x !== r).map((x) => `<article class="card"><a href="${regUrl(x, lang)}"><div class="card-body"><h3>${x.name[lang]}</h3><p>${rt.anzahl(regRefs(x).length)}</p><p class="more">${rt.mehr} →</p></div></a></article>`).join('')}</div></div></section>
${cta(lang)}`;
    const ld = [{ '@context': 'https://schema.org', '@type': 'Service', name: r.title[lang], description: r.desc[lang], provider: { '@id': SITE.domain + '/#organisation' }, areaServed: r.kantone.map((k) => ({ '@type': 'AdministrativeArea', name: 'Kanton ' + k })), serviceType: 'Baumanagement, Bauleitung, Bauherrenvertretung' }];
    write(rp[lang], layout({ lang, title: r.title[lang], desc: r.desc[lang], paths: rp, body: rbody, ld, crumbs: cr }));
  }
}

function buildKontakt(lang) {
  const t = T[lang], k = t.kontakt, f = k.f, paths = { de: '/kontakt/', en: '/en/kontakt/' }, thanks = { de: '/danke/', en: '/en/danke/' };
  const crumbs = [[t.crumbHome, u(lang, '/')], [t.nav.kontakt, paths[lang]]];
  const body = `${pageHead(k.h1, k.lead, crumbs)}
<section><div class="wrap split top">
  <form class="contact" name="kontakt" method="POST" action="${thanks[lang]}" data-netlify="true" netlify-honeypot="website">
    <input type="hidden" name="form-name" value="kontakt"><input type="hidden" name="sprache" value="${lang}">
    <p class="hp"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></p>
    <label class="field"><span>${f.name} *</span><input name="name" required autocomplete="name"></label>
    <label class="field"><span>${f.firma}</span><input name="firma" autocomplete="organization"></label>
    <label class="field"><span>${f.email} *</span><input type="email" name="email" required autocomplete="email"></label>
    <label class="field"><span>${f.tel}</span><input type="tel" name="telefon" autocomplete="tel"></label>
    <label class="field"><span>${f.art}</span><select name="vorhaben">${f.arts.map((a) => `<option>${a}</option>`).join('')}</select></label>
    <label class="field"><span>${f.msg} *</span><textarea name="nachricht" rows="7" required></textarea></label>
    <p class="disclaimer">${f.privacy} <a href="${u(lang, '/impressum-datenschutz/')}">${t.footer.legal}</a></p>
    <button class="btn" type="submit">${f.send}</button>
  </form>
  <div><h2>${k.findH}</h2><address><strong>${SITE.name}</strong><br>${SITE.street}<br>${SITE.zip} ${SITE.city}<br><br><a href="tel:${SITE.phoneIntl}">${SITE.phone}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a></address>
  <p><a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.name}, ${SITE.street}, ${SITE.zip} ${SITE.city}`)}" rel="noopener">Google Maps</a></p>
  <img class="round" src="${img(PORTRAIT, 480, 480)}" alt="Martin Dahinden" loading="lazy" width="240" height="240"><p><strong>Martin Dahinden</strong><br>${lang === 'de' ? 'Projektleiter und Inhaber' : 'Project manager and owner'}</p></div>
</div></section>`;
  write(paths[lang], layout({ lang, title: k.title, desc: k.desc, paths, body, active: 'kontakt', crumbs, ld: [{ '@context': 'https://schema.org', '@type': 'ContactPage', url: abs(paths[lang]) }] }));
  write(thanks[lang], layout({ lang, title: k.thanksH, desc: k.thanks, paths: thanks, noindex: true, body: `${pageHead(k.thanksH, k.thanks)}<section><div class="wrap"><a class="btn" href="${u(lang, '/')}">${t.nf.b}</a></div></section>` }));
}

function buildLegal(lang) {
  const t = T[lang], paths = { de: '/impressum-datenschutz/', en: '/en/impressum-datenschutz/' };
  const file = path.join(ROOT, 'content/seiten', `impressum-datenschutz.${lang}.md`);
  const html = marked.parse(fs.readFileSync(file, 'utf8'));
  write(paths[lang], layout({ lang, title: t.legal.title, desc: t.legal.title + ' – ' + SITE.name, paths, body: `${pageHead(t.legal.h1)}<section><div class="wrap narrow prose">${html}</div></section>` }));
}

/* ---------- SEO- und KI-Dateien ---------- */
function buildMeta() {
  const today = new Date().toISOString().slice(0, 10);
  write('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...new Map(pages.map((p) => [p.de, p])).values()].flatMap((p) => LANGS.map((l) => `<url><loc>${abs(p[l])}</loc><lastmod>${today}</lastmod><xhtml:link rel="alternate" hreflang="de-CH" href="${abs(p.de)}"/><xhtml:link rel="alternate" hreflang="en" href="${abs(p.en)}"/></url>`)).join('\n')}
</urlset>`);
  write('/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\n# KI-Crawler sind ausdrücklich willkommen\nUser-agent: GPTBot\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Claude-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
  const li = (lang) => articles[lang].map((a) => `- [${a.title}](${abs(a.url)}): ${a.description}`).join('\n');
  write('/llms.txt', `# ${SITE.name}

> Baumanagement, Gesamtprojektleitung und Bauherrenvertretung aus ${SITE.city} (Kanton Luzern, Schweiz), tätig in der ganzen Deutschschweiz mit Schwerpunkt Zürich und Zentralschweiz. Schwerpunkte: Industrie- und Gewerbebauten, Arealentwicklungen, Ein- und Mehrfamilienhäuser, Sanierungen. Inhaber und Projektleiter: Martin Dahinden, dipl. Techniker HF Hochbau.

Kontakt: ${SITE.street}, ${SITE.zip} ${SITE.city} · Telefon ${SITE.phone} · ${SITE.email} · UID ${SITE.uid}

## Leistungen
${T.de.services.map((s) => `- ${s.t}: ${s.p}`).join('\n')}

## Referenzprojekte
${projects.map((p) => `- [${p.t.de}](${abs(`/projekte/${p.slug}/`)}): ${TYPES[p.projektart].de}, ${CATS[p.kategorie].de}, ${p.ort}${p.kanton ? ' ' + p.kanton : ''}, ${p.zeit}. Leistungen: ${p.leist.de.join(', ')}.`).join('\n')}

## Wissen (Deutsch)
${li('de')}

## Insights (English)
${li('en')}

## Online-Rechner
${TOOLS.map((x) => `- [${x.title.de}](${abs(`/tools/${x.slug.de}/`)}): ${x.desc.de}`).join('\n')}

## Regionen
${REGIONEN.map((r) => `- [${r.title.de}](${abs(`/regionen/${r.slug.de}/`)}): ${r.desc.de}`).join('\n')}

## Downloads
- [Unternehmensprofil mit Referenzliste (PDF)](${SITE.domain}${profileUrl('de')})
- [Portfolio mit allen Projekten und Bildern (PDF)](${SITE.domain}${profileUrl('de', 'portfolio')})
- [Company profile with reference list (PDF)](${SITE.domain}${profileUrl('en')})
- [Portfolio with all projects and images (PDF)](${SITE.domain}${profileUrl('en', 'portfolio')})

## Optional
- [Alle Wissensbeiträge im Volltext](${SITE.domain}/llms-full.txt)
`);
  write('/llms-full.txt', LANGS.flatMap((l) => articles[l].map((a) => `# ${a.title}\n\nURL: ${abs(a.url)}\nSprache: ${l}\nKurzfassung: ${a.summary}\n\n${a.md.trim()}\n\n${(a.faq || []).map((f) => `F: ${f.q}\nA: ${f.a}`).join('\n\n')}`)).join('\n\n---\n\n'));
  write('/site.webmanifest', JSON.stringify({ name: SITE.name, short_name: 'DH Baumanagement', start_url: '/', display: 'browser', background_color: '#0e2f47', theme_color: '#0e2f47', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }, null, 1));
  write('/_redirects', `# Alte Wix-Adressen
/dhreferenzen /projekte/ 301
/en/dhreferenzen /en/projekte/ 301
/en/projects /en/projekte/ 301
/en/services /en/leistungen/ 301
/en/contact /en/kontakt/ 301
/blog/* /wissen/ 301
`);
  for (const lang of LANGS) { /* 404 */ }
  write('/404.html', layout({ lang: 'de', title: T.de.nf.h, desc: T.de.nf.p, paths: { de: '/404.html', en: '/404.html' }, noindex: true, body: `${pageHead(T.de.nf.h + ' / ' + T.en.nf.h, T.de.nf.p + ' ' + T.en.nf.p)}<section><div class="wrap"><a class="btn" href="/">${T.de.nf.b}</a> <a class="btn ghost" href="/en/">${T.en.nf.b}</a></div></section>` }));
}

/* ---------- Ablauf ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(ROOT, 'src/assets'), path.join(OUT, 'assets'), { recursive: true });
if (exists('src/images')) fs.cpSync(path.join(ROOT, 'src/images'), path.join(OUT, 'images'), { recursive: true });
fs.cpSync(path.join(ROOT, 'src/static'), OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/vendor'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'node_modules/jspdf/dist/jspdf.umd.min.js'), path.join(OUT, 'assets/vendor/jspdf.umd.min.js'));
/* Admin-Bereich: statische Seite + Daten für Liste, Auswahlfelder und Karte */
fs.mkdirSync(path.join(OUT, 'admin'), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, 'src/admin'))) fs.copyFileSync(path.join(ROOT, 'src/admin', f), path.join(OUT, 'admin', f));
fs.writeFileSync(path.join(OUT, 'admin/config.json'), JSON.stringify({ repo: SITE.repo, branch: SITE.branch, cats: Object.fromEntries(Object.entries(CATS).map(([k, v]) => [k, v.de])), types: Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v.de])), kantone: KT, karte: KARTE }));
fs.writeFileSync(path.join(OUT, 'admin/projekte.json'), JSON.stringify(ALLROWS.map((r) => ({ ...r, bilder: undefined, fotos: (projects.find((p) => p.slug === r.slug) || { bilder: [] }).bilder.length }))));
for (const lang of LANGS) for (const variant of ['liste', 'portfolio']) await buildProfile({ variant, lang, outDir: path.join(OUT, 'downloads'), root: ROOT, SITE, T, CATS, TYPES, projects });
for (const lang of LANGS) { buildHome(lang); buildLeistungen(lang); buildProjekte(lang); buildWissen(lang); buildTools(lang); buildRegionen(lang); buildKontakt(lang); buildLegal(lang); }
buildMeta();
const unpaired = articles.de.filter((a) => !articles.en.some((b) => b.id === a.id)).map((a) => a.id);
if (unpaired.length) console.warn('Hinweis: keine englische Fassung für', unpaired.join(', '));
console.log(`Fertig: ${projects.length} Projekte, ${articles.de.length} DE- und ${articles.en.length} EN-Beiträge, ${pages.length} Seiten -> dist/`);
