// Unternehmensprofil mit Referenzliste als PDF. Wird bei jedem Build aus src/texts.mjs und
// data/projekte.csv neu erzeugt – neue Projekte erscheinen automatisch in der Referenzliste.
import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const INK = '#0e2f47', ACC = '#e7c984', DARKGOLD = '#8a6d24', SOFT = '#4d6172', ALT = '#f5f3ee', LINE = '#dfddd7', GOLD = '#e7c984';
const TX = {
  de: { file: 'DH-Baumanagement-Unternehmensprofil.pdf', file2: 'DH-Baumanagement-Portfolio.pdf', sub2: 'mit Projektportfolio', portfolio: 'Projektportfolio', vol: 'MCHF', title: 'Unternehmensprofil', sub: 'mit Referenzliste', about: 'Über uns', strengths: 'Was uns ausmacht', person: 'Ihr Ansprechpartner', role: 'Projektleiter und Inhaber, dipl. Techniker HF Hochbau', services: 'Leistungen', segments: 'Für wen wir bauen', refs: 'Referenzen', selected: 'Ausgewählte Projekte', th: ['Projekt', 'Ort', 'Zeitraum', 'Art', 'Unsere Leistungen'], contact: 'Kontakt', facts: 'Unternehmen', factRows: (s) => [['Firma', s.name], ['Sitz', `${s.street}, ${s.zip} ${s.city}`], ['UID', s.uid], ['Tätigkeitsgebiet', 'Deutschschweiz mit Schwerpunkt Zürich und Zentralschweiz'], ['Schwerpunkte', 'Industrie- und Gewerbebauten, Arealentwicklung, Wohnbau, Sanierung']], stand: 'Stand', page: 'Seite', count: (n) => `${n} Projekte` },
  en: { file: 'DH-Baumanagement-Company-Profile.pdf', file2: 'DH-Baumanagement-Portfolio-EN.pdf', sub2: 'with project portfolio', portfolio: 'Project portfolio', vol: 'MCHF', title: 'Company profile', sub: 'with reference list', about: 'About us', strengths: 'What defines us', person: 'Your contact', role: 'Project manager and owner, dipl. Techniker HF Hochbau', services: 'Services', segments: 'Who we build for', refs: 'References', selected: 'Selected projects', th: ['Project', 'Location', 'Period', 'Type', 'Our services'], contact: 'Contact', facts: 'Company', factRows: (s) => [['Company', s.name], ['Registered office', `${s.street}, ${s.zip} ${s.city}, Switzerland`], ['Company ID (UID)', s.uid], ['Area of activity', 'German-speaking Switzerland, focus on Zurich and Central Switzerland'], ['Focus', 'Industrial and commercial buildings, site development, residential, refurbishment']], stand: 'As of', page: 'Page', count: (n) => `${n} projects` },
};
export const profileFile = (lang, variant) => (variant === 'portfolio' ? TX[lang].file2 : TX[lang].file);

export function buildProfile({ TEAM = [], variant = 'liste', lang, outDir, root, SITE, T, CATS, TYPES, projects }) {
  const t = T[lang], x = TX[lang], M = 50, W = 595.28, H = 841.89, CW = W - 2 * M;
  const doc = new PDFDocument({ size: 'A4', margins: { top: 70, bottom: 60, left: M, right: M }, bufferPages: true, info: { Title: `${SITE.name} – ${x.title}`, Author: SITE.name, Subject: x.title } });
  fs.mkdirSync(outDir, { recursive: true });
  const PF = variant === 'portfolio';
  const stream = fs.createWriteStream(path.join(outDir, profileFile(lang, variant)));
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
  doc.font('Helvetica').fontSize(20).fillColor(GOLD).text(PF ? x.sub2 : x.sub, M, 380);
  doc.fontSize(13).fillColor('#e7eaec').text(t.home.h1, M, 440, { width: CW });
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
  // Team: Name und Funktion, als Block zusammengehalten
  if (TEAM.length > 1) {
    need(30 + TEAM.length * 18); doc.y += 12;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(DARKGOLD).text((lang === 'de' ? 'Unser Team' : 'Our team').toUpperCase(), M, doc.y, { characterSpacing: 1 }); doc.y += 5;
    for (const m of TEAM) { const y = doc.y; doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(m.name, M, y, { width: 150 }); doc.font('Helvetica').fillColor(SOFT).text(m.rolle[lang], M + 160, y, { width: CW - 160 }); doc.moveTo(M, doc.y + 3).lineTo(W - M, doc.y + 3).lineWidth(0.5).strokeColor(LINE).stroke(); doc.y += 8; }
  }

  /* Leistungen */
  h1(x.services);
  p(t.leistungen.lead); doc.moveDown(0.6);
  // Jeder Leistungsschritt: Illustration links, Text rechts, Block bleibt auf einer Seite zusammen
  const il = (name) => local(`images/illus-hell/${name}.png`);
  const tile = (name, x0, y0, sz) => { doc.roundedRect(x0, y0, sz, sz, 4).fill(ALT); const f = il(name); if (f) doc.image(f, x0 + sz * 0.12, y0 + sz * 0.14, { fit: [sz * 0.76, sz * 0.72], align: 'center', valign: 'center' }); };
  t.services.forEach((s, i) => {
    const tx = M + 98, tw = CW - 98;
    doc.font('Helvetica').fontSize(10.5); const hp = doc.heightOfString(s.p, { width: tw, lineGap: 3 });
    const bw = (tw - 16) / 2, lh = (li) => doc.font('Helvetica').fontSize(9).heightOfString(li, { width: bw - 14, lineGap: 2 }) + 3;
    const pairs = []; for (let k = 0; k < s.li.length; k += 2) pairs.push(s.li.slice(k, k + 2));
    const hl = pairs.reduce((n, r) => n + Math.max(...r.map(lh)), 0);
    need(Math.max(80, 36 + hp + hl) + 8);
    const y0 = doc.y;
    tile(s.icon, M, y0, 80);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(DARKGOLD).text(`0${i + 1}`, tx, y0 + 1, { characterSpacing: 1 });
    doc.font('Helvetica-Bold').fontSize(12.5).fillColor(INK).text(s.t, tx, y0 + 13, { width: tw }); doc.moveDown(0.25);
    p(s.p, { color: SOFT, x: tx, w: tw }); doc.moveDown(0.35);
    for (const r of pairs) { const y = doc.y, rh = Math.max(...r.map(lh)); r.forEach((li, j) => { const bx = tx + j * (bw + 16); doc.rect(bx + 2, y + 4, 4, 4).fill(ACC); doc.font('Helvetica').fontSize(9).fillColor(INK).text(li, bx + 14, y, { width: bw - 14, lineGap: 2 }); }); doc.y = y + rh; }
    doc.y = Math.max(doc.y, y0 + 80) + 8;
    if (i < t.services.length - 1) { doc.moveTo(M, doc.y).lineTo(W - M, doc.y).lineWidth(0.5).strokeColor(LINE).stroke(); doc.y += 11; }
  });

  /* Marktsegmente: gleiche Logik wie die Leistungen (Illustration links, Text rechts), eigene Seite */
  h1(x.segments);
  doc.y += 4;
  t.segments.items.forEach((it, i) => {
    const tx = M + 98, tw = CW - 98, y0 = doc.y;
    tile(it[3], M, y0, 80);
    doc.font('Helvetica-Bold').fontSize(12.5).fillColor(INK).text(it[0], tx, y0 + 12, { width: tw }); doc.moveDown(0.3);
    p(it[1], { color: SOFT, x: tx, w: tw });
    doc.y = Math.max(doc.y, y0 + 80) + 12;
    if (i < t.segments.items.length - 1) { doc.moveTo(M, doc.y).lineTo(W - M, doc.y).lineWidth(0.5).strokeColor(LINE).stroke(); doc.y += 14; }
  });

  /* Projektportfolio: jede Referenz als gleich aufgebaute Karte (Bild, Kategorie · Art, Titel, Ort · Zeitraum · Bauvolumen, Leistungen) */
  const byCat = (key) => projects.filter((pr) => pr.kategorie === key).sort((a, b) => (b.jahr_bis || b.jahr_von).localeCompare(a.jahr_bis || a.jahr_von));
  if (PF) {
    h1(x.portfolio);
    const gap = 20, cw = (CW - gap) / 2, ih = 132, rowH = ih + 96;
    const card = (pr, cx, cy) => {
      const f = pr.bilder[0] && local(pr.bilder[0]);
      doc.save(); doc.rect(cx, cy, cw, ih).clip();
      if (f) doc.image(f, cx, cy, { cover: [cw, ih], align: 'center', valign: 'center' });
      else { doc.rect(cx, cy, cw, ih).fill(ALT); const pi = il(pr.kategorie === 'wohnen' ? 'wohnbau' : 'gewerbe'); if (pi) doc.image(pi, cx + cw / 2 - 45, cy + ih / 2 - 35, { fit: [90, 70], align: 'center', valign: 'center' }); }
      doc.restore();
      doc.rect(cx, cy, cw, ih).lineWidth(0.5).strokeColor(LINE).stroke(); doc.rect(cx, cy + ih, cw, 2).fill(ACC);
      doc.font('Helvetica-Bold').fontSize(7).fillColor(DARKGOLD).text(`${CATS[pr.kategorie][lang]} · ${TYPES[pr.projektart][lang]}`.toUpperCase(), cx, cy + ih + 11, { width: cw, height: 9, ellipsis: true, characterSpacing: 0.6 });
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(pr.t[lang], cx, cy + ih + 23, { width: cw, height: 26, ellipsis: true });
      doc.font('Helvetica').fontSize(9).fillColor(INK).text(`${pr.ort}${pr.kanton ? ' ' + pr.kanton : ''}  ·  ${pr.zeit}${pr.vol ? '  ·  ' + pr.vol : ''}`, cx, cy + ih + 51, { width: cw, height: 11, ellipsis: true });
      doc.font('Helvetica').fontSize(8.5).fillColor(SOFT).text(pr.leist[lang].join(', '), cx, cy + ih + 65, { width: cw, height: 22, ellipsis: true });
    };
    for (const [key, cat] of Object.entries(CATS)) {
      const list = byCat(key); if (!list.length) continue;
      need(rowH + 44); doc.moveDown(0.4);
      doc.font('Helvetica-Bold').fontSize(13).fillColor(INK).text(cat[lang], M, doc.y, { continued: true }).font('Helvetica').fontSize(9).fillColor(SOFT).text(`   ${x.count(list.length)}`);
      doc.y += 10;
      let rowY = doc.y;
      list.forEach((pr, i) => {
        if (i % 2 === 0) { need(rowH); rowY = Math.max(doc.y, 78); }
        card(pr, M + (i % 2) * (cw + gap), rowY);
        doc.y = i % 2 === 1 || i === list.length - 1 ? rowY + rowH : rowY;
      });
    }
  }

  /* Referenzliste */
  const hasVol = projects.some((pr) => pr.vol);
  if (!PF) h1(x.refs);
  const pad = 4, TH = hasVol ? [...x.th.slice(0, 4), x.vol, x.th[4]] : x.th;
  const cellsOf = (pr) => [pr.t[lang], `${pr.ort}${pr.kanton ? ' ' + pr.kanton : ''}`, pr.zeit, TYPES[pr.projektart][lang], ...(hasVol ? [pr.vol.replace(' MCHF', '') || '–'] : []), pr.leist[lang].join(', ')].map((c) => String(c).replace(/ & /g, ' &\u00a0'));
  // Spaltenbreiten aus dem Inhalt: Jede Spalte ist mindestens so breit wie ihr längstes Wort, damit nie mitten im Wort umbrochen wird.
  const allRows = projects.map(cellsOf), nC = TH.length, last = nC - 1;
  const wordW = (txt, bold, size) => { doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size); return Math.max(...String(txt).split(/ +/).map((w) => doc.widthOfString(w))); };
  const minW = TH.map((h, i) => Math.ceil(Math.max(doc.font('Helvetica-Bold').fontSize(7.5).widthOfString(String(h).toUpperCase()) + String(h).length * 0.5, ...allRows.map((r) => wordW(r[i], i === 0, 8.8))) + 2 * pad + 3));
  const cols = minW.slice();
  for (let i = 1; i < last; i++) cols[i] = Math.max(minW[i], i === 1 ? 70 : 0);
  const rest = CW - cols.slice(1, last).reduce((a, b) => a + b, 0);
  cols[0] = Math.max(minW[0], Math.round(rest * 0.46)); cols[last] = rest - cols[0];
  if (cols[last] < minW[last]) { cols[last] = minW[last]; cols[0] = rest - cols[last]; }
  const rowH = (cells, head) => Math.max(...cells.map((c, i) => doc.font(head || i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(head ? 7.5 : 8.8).heightOfString(head ? String(c).toUpperCase() : String(c), { width: cols[i] - 2 * pad, characterSpacing: head ? 0.5 : 0 }))) + 2 * pad;
  const row = (cells, head) => {
    const hgt = rowH(cells, head);
    if (doc.y + hgt > H - 70) { doc.addPage(); doc.y = 78; if (!head) row(TH, true); doc.font('Helvetica').fontSize(8.8); }
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
  for (const [key, cat] of PF ? [] : Object.entries(CATS)) {
    const list = byCat(key);
    if (!list.length) continue;
    // Eine Kategorie bleibt zusammen: passt sie nicht mehr auf die Seite, beginnt sie auf einer neuen.
    const blockH = 44 + rowH(TH, true) + list.reduce((n, pr) => n + rowH(cellsOf(pr), false), 0);
    if (doc.y + blockH > H - 70 && blockH < H - 150) { doc.addPage(); doc.y = 78; } else { need(110); doc.moveDown(0.9); }
    doc.font('Helvetica-Bold').fontSize(13).fillColor(INK).text(cat[lang], M, doc.y, { continued: true }).font('Helvetica').fontSize(9).fillColor(SOFT).text(`   ${x.count(list.length)}`);
    doc.moveDown(0.5);
    row(TH, true);
    for (const pr of list) row(cellsOf(pr));
  }

  /* Kontakt */
  if (doc.y + 150 > H - 70) { h1(x.contact); p(t.cta.p); doc.moveDown(1); } else doc.moveDown(2);
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
    doc.font('Helvetica').fontSize(8.5).fillColor(GOLD).text(PF ? x.portfolio : x.title, W - M - 200, 17, { width: 200, align: 'right', lineBreak: false });
    doc.font('Helvetica').fontSize(8).fillColor(SOFT).text(`${SITE.street} · ${SITE.zip} ${SITE.city} · ${SITE.phone} · ${SITE.email}`, M, H - 40, { lineBreak: false });
    doc.text(`${x.page} ${i + 1} / ${range.count}`, W - M - 100, H - 40, { width: 100, align: 'right', lineBreak: false });
  }
  doc.end();
  return new Promise((ok, no) => { stream.on('finish', ok); stream.on('error', no); });
}
