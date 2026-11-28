// Referenzblatt: pro Projekt ein PDF (DE und EN), bei jedem Build automatisch aus der Projektliste erzeugt.
// Aufbau immer gleich: Kopf, Titel, Titelbild, Beschrieb und Leistungen links, Eckdaten rechts, Kontakt; Seite 2 mit weiteren Bildern.
import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';

const INK = '#0e2f47', ACC = '#e7c984', DARKGOLD = '#8a6d24', SOFT = '#4d6172', ALT = '#f5f3ee', LINE = '#dfddd7';
const TX = {
  de: { pre: 'Referenz', head: 'Referenzblatt', obj: 'Referenzobjekt', projekt: 'Projekt', leist: 'Unsere Leistungen', kenn: 'Kennzahlen', eck: 'Eckdaten', ort: 'Standort', zeit: 'Zeitraum', kat: 'Kategorie', art: 'Projektart', vol: 'Bauvolumen', bh: 'Bauherrschaft', bilder: 'Impressionen', kontakt: 'Ihr Ansprechpartner', page: 'Seite', stand: 'Stand' },
  en: { pre: 'Reference', head: 'Reference sheet', obj: 'Reference project', projekt: 'Project', leist: 'Our services', kenn: 'Key figures', eck: 'Key data', ort: 'Location', zeit: 'Period', kat: 'Category', art: 'Project type', vol: 'Construction volume', bh: 'Client', bilder: 'Impressions', kontakt: 'Your contact', page: 'Page', stand: 'As of' },
};
export const refFile = (p, lang) => `${TX[lang].pre}_${p.slug}${lang === 'en' ? '_EN' : ''}.pdf`;

// Bilder für das PDF verkleinern (sonst würde jedes Blatt mehrere Megabyte gross)
const cache = new Map();
async function small(file) {
  if (!cache.has(file)) cache.set(file, await sharp(file).rotate().resize({ width: 1100, height: 1100, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 72 }).toBuffer());
  return cache.get(file);
}

export async function buildRefSheet({ eigen = true, p, lang, outDir, root, SITE, CATS, TYPES, text }) {
  const x = TX[lang], M = 50, W = 595.28, H = 841.89, CW = W - 2 * M;
  const nb = (s) => String(s).replace(/ & /g, ' & '); // «&» nie allein am Zeilenende
  const files = p.bilder.map((b) => path.join(root, 'src', b.replace(/^\//, ''))).filter((f) => /\.(jpe?g|png)$/i.test(f) && fs.existsSync(f)).slice(0, 7);
  const imgs = await Promise.all(files.map(small));
  const doc = new PDFDocument({ size: 'A4', margins: { top: 70, bottom: 0, left: M, right: M }, bufferPages: true, info: { Title: `${x.head}: ${p.t[lang]}`, Author: SITE.name, Subject: x.head } });
  fs.mkdirSync(outDir, { recursive: true });
  const stream = fs.createWriteStream(path.join(outDir, refFile(p, lang)));
  doc.pipe(stream);
  const logo = path.join(root, 'src/images/logo.png');
  const pic = (buf, px, py, pw, ph) => { doc.save(); doc.rect(px, py, pw, ph).clip(); doc.image(buf, px, py, { cover: [pw, ph], align: 'center', valign: 'center' }); doc.restore(); doc.rect(px, py, pw, ph).lineWidth(0.5).strokeColor(LINE).stroke(); };
  const label = (s, lx, ly, lw) => doc.font('Helvetica-Bold').fontSize(8).fillColor(DARKGOLD).text(s.toUpperCase(), lx, ly, { width: lw, characterSpacing: 1 });

  /* Titel */
  label(`${x.obj}  ·  ${CATS[p.kategorie][lang]}`, M, 66, CW);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(INK).text(nb(p.t[lang]), M, 82, { width: CW, lineGap: 1 });
  doc.rect(M, doc.y + 6, 40, 3).fill(ACC);
  doc.font('Helvetica').fontSize(11.5).fillColor(SOFT).text(`${p.ort}${p.ktx}  ·  ${p.zeit}${p.t[lang].toLowerCase().startsWith(TYPES[p.projektart][lang].split(/[ &]/)[0].toLowerCase()) ? '' : '  ·  ' + nb(TYPES[p.projektart][lang])}`, M, doc.y + 18, { width: CW });
  let y = doc.y + 14;

  /* Titelbild */
  if (imgs[0]) { pic(imgs[0], M, y, CW, 236); doc.rect(M, y + 236, CW, 3).fill(ACC); y += 236 + 24; } else y += 6;

  /* Eckdaten rechts */
  const LW = 296, RX = M + LW + 26, RW = CW - LW - 26, pad = 14;
  const rows = [[x.ort, `${p.ort}${p.ktx}`], [x.zeit, p.zeit], [x.kat, CATS[p.kategorie][lang]], ...(p.t[lang].toLowerCase().startsWith(TYPES[p.projektart][lang].split(/[ &]/)[0].toLowerCase()) ? [] : [[x.art, nb(TYPES[p.projektart][lang])]]), ...(p.vol ? [[x.vol, p.vol]] : []), ...(p.bauherr ? [[x.bh, lang === 'en' && p.bauherr === 'Privat' ? 'Private' : p.bauherr]] : [])];
  const valH = (v) => doc.font('Helvetica-Bold').fontSize(10.5).heightOfString(String(v), { width: RW - 2 * pad });
  const boxH = pad + 16 + rows.reduce((n, [, v]) => n + 11 + valH(v) + 9, 0) + pad - 9;
  doc.rect(RX, y, RW, boxH).fill(ALT); doc.rect(RX, y, RW, 3).fill(ACC);
  label(x.eck, RX + pad, y + pad, RW - 2 * pad);
  let ry = y + pad + 16;
  for (const [k, v] of rows) {
    doc.font('Helvetica').fontSize(7.5).fillColor(SOFT).text(k.toUpperCase(), RX + pad, ry, { width: RW - 2 * pad, characterSpacing: 0.6 });
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(String(v), RX + pad, ry + 11, { width: RW - 2 * pad });
    ry = doc.y + 9;
  }

  /* Beschrieb, Leistungen, Kennzahlen links */
  const bullets = (list) => { for (const li of list) { const by = doc.y; doc.rect(M + 2, by + 4.5, 4, 4).fill(ACC); doc.font('Helvetica').fontSize(10.5).fillColor(INK).text(nb(li), M + 14, by, { width: LW - 14, lineGap: 2 }); doc.y += 3; } };
  doc.y = y;
  if (eigen) { // eigener Beschrieb; ohne ihn beginnt die Spalte direkt mit den Leistungen (keine Wiederholung der Eckdaten)
    label(x.projekt, M, y, LW); doc.y += 5;
    for (const para of String(text).split(/\n{2,}|\\n\\n/)) { doc.font('Helvetica').fontSize(10.5).fillColor(INK).text(para.trim(), M, doc.y, { width: LW, lineGap: 3.2 }); doc.y += 7; }
    doc.y += 9;
  }
  label(x.leist, M, doc.y, LW); doc.y += 5; bullets(p.leist[lang]);
  const kenn = String(p.kenn[lang] || '').split('|').map((s) => s.trim()).filter(Boolean);
  if (kenn.length) { doc.y += 12; label(x.kenn, M, doc.y, LW); doc.y += 5; bullets(kenn); }
  if (p.zitat && p.zitat[lang]) { // Kundenstimme
    doc.y += 14; const qy = doc.y;
    doc.font('Helvetica-Oblique').fontSize(11).fillColor(INK).text('«' + p.zitat[lang] + '»', M + 14, qy + 2, { width: LW - 14, lineGap: 3 });
    if (p.zitatVon) doc.font('Helvetica').fontSize(9).fillColor(SOFT).text(p.zitatVon, M + 14, doc.y + 5, { width: LW - 14 });
    doc.rect(M, qy, 3, doc.y - qy + 2).fill(ACC);
  }
  const endY = Math.max(doc.y, y + boxH);

  /* Kontakt: unten auf Seite 1, sonst auf einer neuen Seite */
  const kontakt = (ky) => {
    doc.rect(M, ky, CW, 78).fill(INK); doc.rect(M, ky, 4, 78).fill(ACC);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(ACC).text(x.kontakt.toUpperCase(), M + 22, ky + 15, { characterSpacing: 1 });
    doc.font('Helvetica-Bold').fontSize(12.5).fillColor('#ffffff').text('Martin Dahinden', M + 22, ky + 30);
    doc.font('Helvetica').fontSize(10).fillColor('#e7eaec').text(`${SITE.phone}  ·  ${SITE.email}  ·  ${SITE.domain.replace('https://', '')}`, M + 22, ky + 49);
    if (fs.existsSync(logo)) doc.image(logo, W - M - 92, ky + 14, { fit: [74, 50], align: 'right' });
  };
  const KY = H - 70 - 78 - 6;
  if (endY + 18 <= KY) kontakt(KY);

  /* Seite 2: weitere Bilder, immer im gleichen Raster */
  const more = imgs.slice(1);
  if (more.length) {
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(18).fillColor(INK).text(x.bilder, M, 70); doc.rect(M, doc.y + 5, 40, 3).fill(ACC);
    doc.font('Helvetica').fontSize(10).fillColor(SOFT).text(`${nb(p.t[lang])}, ${p.ort}`, M, doc.y + 16, { width: CW });
    const gy = doc.y + 14, gap = 12, cols = more.length === 1 ? 1 : 2, rowsN = Math.ceil(more.length / cols), cw = (CW - gap * (cols - 1)) / cols;
    const availH = (endY + 18 <= KY ? H - 70 : KY - 14) - gy, ih = Math.min(cols === 1 ? 330 : 200, (availH - gap * (rowsN - 1)) / rowsN);
    more.forEach((b, i) => { const last = i === more.length - 1 && more.length % cols === 1 && cols === 2; pic(b, M + (i % cols) * (cw + gap), gy + Math.floor(i / cols) * (ih + gap), last ? CW : cw, ih); });
    if (endY + 18 > KY) kontakt(KY);
  } else if (endY + 18 > KY) { doc.addPage(); kontakt(78); }

  /* Kopf- und Fusszeile auf jeder Seite */
  const range = doc.bufferedPageRange(), date = new Date().toLocaleDateString('de-CH');
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.rect(0, 0, W, 42).fill(INK); doc.rect(0, 42, W, 2).fill(ACC);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(ACC).text(SITE.name, M, 16, { lineBreak: false });
    doc.font('Helvetica').fontSize(8.5).fillColor(ACC).text(x.head, W - M - 200, 17, { width: 200, align: 'right', lineBreak: false });
    doc.font('Helvetica').fontSize(8).fillColor(SOFT).text(`${SITE.name} · ${SITE.street} · ${SITE.zip} ${SITE.city} · ${x.stand} ${date}`, M, H - 40, { lineBreak: false });
    doc.text(`${x.page} ${i + 1} / ${range.count}`, W - M - 100, H - 40, { width: 100, align: 'right', lineBreak: false });
  }
  doc.end();
  return new Promise((ok, no) => { stream.on('finish', ok); stream.on('error', no); });
}
