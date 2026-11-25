// Unternehmensprofil mit Referenzliste als PDF. Wird bei jedem Build aus src/texts.mjs und
// data/projekte.csv neu erzeugt – neue Projekte erscheinen automatisch in der Referenzliste.
import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const INK = '#0e2f47', ACC = '#e7c984', DARKGOLD = '#8a6d24', SOFT = '#4d6172', ALT = '#f5f3ee', LINE = '#dfddd7', GOLD = '#e7c984';
const TX = {
  de: { file: 'DH-Baumanagement-Unternehmensprofil.pdf', title: 'Unternehmensprofil', sub: 'mit Referenzliste', about: 'Über uns', strengths: 'Was uns ausmacht', person: 'Ihr Ansprechpartner', role: 'Projektleiter und Inhaber, dipl. Techniker HF Hochbau', services: 'Leistungen', segments: 'Für wen wir bauen', refs: 'Referenzen', selected: 'Ausgewählte Projekte', th: ['Projekt', 'Ort', 'Zeitraum', 'Art', 'Unsere Leistungen'], contact: 'Kontakt', facts: 'Unternehmen', factRows: (s) => [['Firma', s.name], ['Sitz', `${s.street}, ${s.zip} ${s.city}`], ['UID', s.uid], ['Tätigkeitsgebiet', 'Zentralschweiz, Aargau, Zürich, Bern'], ['Schwerpunkte', 'Industrie- und Gewerbebauten, Arealentwicklung, Wohnbau, Sanierung']], stand: 'Stand', page: 'Seite', count: (n) => `${n} Projekte` },
  en: { file: 'DH-Baumanagement-Company-Profile.pdf', title: 'Company profile', sub: 'with reference list', about: 'About us', strengths: 'What defines us', person: 'Your contact', role: 'Project manager and owner, dipl. Techniker HF Hochbau', services: 'Services', segments: 'Who we build for', refs: 'References', selected: 'Selected projects', th: ['Project', 'Location', 'Period', 'Type', 'Our services'], contact: 'Contact', facts: 'Company', factRows: (s) => [['Company', s.name], ['Registered office', `${s.street}, ${s.zip} ${s.city}, Switzerland`], ['Company ID (UID)', s.uid], ['Area of activity', 'Central Switzerland, Aargau, Zurich, Bern'], ['Focus', 'Industrial and commercial buildings, site development, residential, refurbishment']], stand: 'As of', page: 'Page', count: (n) => `${n} projects` },
};
export const profileFile = (lang) => TX[lang].file;

export function buildProfile({ lang, outDir, root, SITE, T, CATS, TYPES, projects }) {
  const t = T[lang], x = TX[lang], M = 50, W = 595.28, H = 841.89, CW = W - 2 * M;
  const doc = new PDFDocument({ size: 'A4', margins: { top: 70, bottom: 60, left: M, right: M }, bufferPages: true, info: { Title: `${SITE.name} – ${x.title}`, Author: SITE.name, Subject: x.title } });
  fs.mkdirSync(outDir, { recursive: true });
  const stream = fs.createWriteStream(path.join(outDir, x.file));
  doc.pipe(stream);
  const local = (p) => { const f = path.join(root, 'src', p.replace(/^\//, '')); return /\.(jpe?g|png)$/i.test(f) && fs.existsSync(f) ? f : null; };
  const logo = local('images/logo.png'), hero = local('images/hero.jpg'), portrait = local('images/martin-dahinden.jpg');
  const date = new Date().toLocaleDateString('de-CH');

  /* Titelseite */
  doc.page.margins.bottom = 0;
  doc.rect(0, 0, W, H).fill(INK);
  if (hero) { doc.save().opacity(0.28).image(hero, 0, 0, { cover: [W, 430], align: 'center', valign: 'center' }).restore(); }
  doc.rect(M, 300, 60, 4).fill(ACC);
  const mark = local('images/wasserzeichen.png'); if (mark) doc.image(mark, 60, 40, { width: 640 });
  if (logo) doc.image(logo, M, 70, { fit: [230, 130] });
  else doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text(SITE.name, M, 80);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(40).text(x.title, M, 330);
  doc.font('Helvetica').fontSize(20).fillColor(GOLD).text(x.sub, M, 380);
  doc.fontSize(13).fillColor('#e7eaec').text(t.home.h1, M, 440, { width: CW });
  doc.fontSize(10).fillColor('#cfd6da').text(t.home.claim, M, 470, { width: CW });
  doc.fontSize(10).fillColor('#ffffff').text(`${SITE.name}  ·  ${SITE.street}  ·  ${SITE.zip} ${SITE.city}`, M, H - 110).text(`${SITE.phone}  ·  ${SITE.email}  ·  ${SITE.domain.replace('https://', '')}`, M, H - 94);
  doc.fillColor(GOLD).fontSize(9).text(`${x.stand} ${date}`, M, H - 70);

  /* Bausteine */
  const need = (h) => { if (doc.y + h > H - 70) doc.addPage(); };
  const h1 = (s) => { doc.addPage(); doc.font('Helvetica-Bold').fontSize(24).fillColor(INK).text(s, M, 78); doc.rect(M, doc.y + 6, 40, 3).fill(ACC); doc.y += 26; };
  const h2 = (s) => { need(140); doc.moveDown(0.8); doc.font('Helvetica-Bold').fontSize(9).fillColor(DARKGOLD).text(s.toUpperCase(), M, doc.y, { characterSpacing: 1 }); doc.moveDown(0.5); };
  const p = (s, o = {}) => doc.font('Helvetica').fontSize(10.5).fillColor(o.color || INK).text(s, o.x || M, doc.y, { width: o.w || CW, lineGap: 3 });
  const item = (title, text) => { need(70); doc.font('Helvetica-Bold').fontSize(11.5).fillColor(INK).text(title, M, doc.y); doc.moveDown(0.2); p(text, { color: SOFT }); doc.moveDown(0.7); };

  /* Über uns */
  h1(x.about);
  p(t.home.lead);
  h2(x.facts);
  for (const [k, v] of x.factRows(SITE)) { const y = doc.y; doc.font('Helvetica').fontSize(10).fillColor(SOFT).text(k, M, y, { width: 130 }); doc.font('Helvetica-Bold').fillColor(INK).text(v, M + 140, y, { width: CW - 140 }); doc.moveTo(M, doc.y + 3).lineTo(W - M, doc.y + 3).lineWidth(0.5).strokeColor(LINE).stroke(); doc.y += 9; }
  h2(x.strengths);
  for (const [a, b] of t.strengths) item(a, b);
  h2(x.person);
  need(150);
  const py = doc.y, tx = portrait ? M + 125 : M, tw = portrait ? CW - 125 : CW;
  if (portrait) doc.image(portrait, M, py, { cover: [108, 130], align: 'center', valign: 'center' });
  doc.font('Helvetica-Bold').fontSize(12.5).fillColor(INK).text('Martin Dahinden', tx, py, { width: tw });
  doc.font('Helvetica').fontSize(9.5).fillColor(DARKGOLD).text(x.role, tx, doc.y + 2, { width: tw }); doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(10).fillColor(SOFT).text(t.home.about, tx, doc.y, { width: tw, lineGap: 2.5 }); doc.moveDown(0.5);
  doc.font('Helvetica-Oblique').fontSize(10.5).fillColor(INK).text(t.home.quote, tx, doc.y, { width: tw });
  if (portrait && doc.y < py + 136) doc.y = py + 136;

  /* Leistungen */
  h1(x.services);
  p(t.leistungen.lead); doc.moveDown(0.6);
  const gL = local(`images/grafiken/leistungen-${lang}.png`); if (gL) { doc.image(gL, M, doc.y, { width: CW }); doc.y += CW * 430 / 1200 + 14; }
  for (const s of t.services) {
    need(120);
    doc.font('Helvetica-Bold').fontSize(12.5).fillColor(INK).text(s.t, M, doc.y); doc.moveDown(0.25);
    p(s.p, { color: SOFT }); doc.moveDown(0.35);
    for (const li of s.li) { const y = doc.y; doc.rect(M + 2, y + 4, 4, 4).fill(ACC); doc.font('Helvetica').fontSize(10).fillColor(INK).text(li, M + 14, y, { width: CW - 14, lineGap: 2 }); doc.y += 2; }
    doc.moveDown(0.9);
  }
  need(330); h2(x.segments);
  const gS = local(`images/grafiken/marktsegmente-${lang}.png`); if (gS) { doc.image(gS, M, doc.y, { width: CW }); doc.y += CW * 330 / 1200 + 18; }
  for (const [a, b] of t.segments.items) item(a, b);

  /* Ausgewählte Projekte mit Bild (nur lokal vorhandene Bilder) */
  const pics = projects.filter((pr) => pr.featured && pr.bilder[0] && local(pr.bilder[0]));
  if (pics.length) {
    h1(x.selected);
    const cw = (CW - 20) / 2, ih = cw * 0.66, rowH = ih + 62;
    pics.forEach((pr, i) => {
      if (i % 2 === 0) need(rowH);
      const cx = M + (i % 2) * (cw + 20), cy = doc.y;
      doc.image(local(pr.bilder[0]), cx, cy, { cover: [cw, ih], align: 'center', valign: 'center' });
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(pr.t[lang], cx, cy + ih + 8, { width: cw });
      doc.font('Helvetica').fontSize(9).fillColor(SOFT).text(`${pr.ort}${pr.kanton ? ' ' + pr.kanton : ''} · ${pr.zeit} · ${pr.leist[lang].join(', ')}`, cx, doc.y + 1, { width: cw });
      doc.y = i % 2 === 1 || i === pics.length - 1 ? cy + rowH : cy;
    });
  }

  /* Referenzliste */
  h1(x.refs);
  const cols = [140, 85, 62, 85, CW - 372], pad = 5;
  const row = (cells, head) => {
    doc.font(head ? 'Helvetica-Bold' : 'Helvetica').fontSize(head ? 7.5 : 8.8);
    const hgt = Math.max(...cells.map((c, i) => doc.heightOfString(String(c), { width: cols[i] - 2 * pad }))) + 2 * pad;
    if (doc.y + hgt > H - 70) { doc.addPage(); doc.y = 78; if (!head) row(x.th, true); doc.font('Helvetica').fontSize(8.8); }
    const y = doc.y; let cx = M;
    if (head) doc.rect(M, y, CW, hgt).fill(ALT);
    cells.forEach((c, i) => {
      doc.font(head || i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(head ? 7.5 : 8.8).fillColor(head ? SOFT : INK)
        .text(head ? String(c).toUpperCase() : String(c), cx + pad, y + pad, { width: cols[i] - 2 * pad, characterSpacing: head ? 0.5 : 0 });
      cx += cols[i];
    });
    doc.moveTo(M, y + hgt).lineTo(W - M, y + hgt).lineWidth(0.5).strokeColor(LINE).stroke();
    doc.y = y + hgt;
  };
  for (const [key, cat] of Object.entries(CATS)) {
    const list = projects.filter((pr) => pr.kategorie === key).sort((a, b) => (b.jahr_bis || b.jahr_von).localeCompare(a.jahr_bis || a.jahr_von));
    if (!list.length) continue;
    need(110); doc.moveDown(0.9);
    doc.font('Helvetica-Bold').fontSize(13).fillColor(INK).text(cat[lang], M, doc.y, { continued: true }).font('Helvetica').fontSize(9).fillColor(SOFT).text(`   ${x.count(list.length)}`);
    doc.moveDown(0.5);
    row(x.th, true);
    for (const pr of list) row([pr.t[lang], `${pr.ort}${pr.kanton ? ' ' + pr.kanton : ''}`, pr.zeit, TYPES[pr.projektart][lang], pr.leist[lang].join(', ')]);
  }

  /* Kontakt */
  need(150); doc.moveDown(2);
  const ky = doc.y; doc.rect(M, ky, CW, 104).fill(INK); doc.rect(M, ky, 4, 104).fill(ACC);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD).text(x.contact.toUpperCase(), M + 22, ky + 18, { characterSpacing: 1 });
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff').text(t.cta.h, M + 22, ky + 34);
  doc.font('Helvetica').fontSize(10.5).fillColor('#e7eaec').text(`Martin Dahinden  ·  ${SITE.phone}  ·  ${SITE.email}`, M + 22, ky + 58).text(`${SITE.name}  ·  ${SITE.street}  ·  ${SITE.zip} ${SITE.city}  ·  ${SITE.domain.replace('https://', '')}`, M + 22, ky + 74);

  /* Kopf- und Fusszeilen ab Seite 2 */
  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) {
    doc.switchToPage(i); doc.page.margins.bottom = 0;
    doc.rect(0, 0, W, 42).fill(INK); doc.rect(0, 42, W, 2).fill(ACC);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(GOLD).text(SITE.name, M, 16, { lineBreak: false });
    doc.font('Helvetica').fontSize(8.5).fillColor(GOLD).text(x.title, W - M - 200, 17, { width: 200, align: 'right', lineBreak: false });
    doc.font('Helvetica').fontSize(8).fillColor(SOFT).text(`${SITE.street} · ${SITE.zip} ${SITE.city} · ${SITE.phone} · ${SITE.email}`, M, H - 40, { lineBreak: false });
    doc.text(`${x.page} ${i + 1} / ${range.count}`, W - M - 100, H - 40, { width: 100, align: 'right', lineBreak: false });
  }
  doc.end();
  return new Promise((ok, no) => { stream.on('finish', ok); stream.on('error', no); });
}
