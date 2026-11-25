// Lädt alle Bilder, die noch auf der alten Wix-Seite liegen, ins Repository (src/images/…)
// und leert danach die Spalte «bilder» in data/projekte.csv. Ab dann werden die Dateien aus
// src/images/projekte/<slug>/ automatisch (alphabetisch sortiert) verwendet.
// Aufruf (einmalig, lokal oder in einer Claude-Sitzung mit Internetzugang):  npm run bilder
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/texts.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WIX = 'https://static.wixstatic.com/media/';
async function load(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log('gespeichert:', path.relative(ROOT, file));
}
const ext = (u) => (u.match(/\.(jpe?g|png|webp)$/i) || ['.jpg'])[0].toLowerCase();

for (const [name, file] of [['logo', 'logo.png'], ['hero', 'hero.jpg'], ['portrait', 'martin-dahinden.jpg']]) {
  const target = path.join(ROOT, 'src/images', file);
  if (!fs.existsSync(target)) await load(SITE.remote[name], target).catch((e) => console.warn('übersprungen:', e.message));
}

const csvFile = path.join(ROOT, 'data/projekte.csv');
const lines = fs.readFileSync(csvFile, 'utf8').split(/\r?\n/);
const head = lines[0].split(';');
const iSlug = head.indexOf('slug'), iBild = head.indexOf('bilder');
for (let n = 1; n < lines.length; n++) {
  if (!lines[n].trim()) continue;
  const cells = lines[n].split(';');
  if (cells.length !== head.length) { console.warn(`Zeile ${n + 1} übersprungen (enthält Strichpunkte in Anführungszeichen – bitte von Hand prüfen)`); continue; }
  // Projektdokumentation (PDF) lokal ablegen
  const iDok = head.indexOf('dokument');
  if (/^https?:/.test(cells[iDok])) {
    const pdf = `dokumente/${cells[iSlug]}.pdf`;
    await load(cells[iDok], path.join(ROOT, 'src/static', pdf)).then(() => { cells[iDok] = '/' + pdf; lines[n] = cells.join(';'); }).catch((e) => console.warn('PDF übersprungen:', e.message));
  }
  const remote = cells[iBild].split('|').map((b) => b.trim()).filter((b) => b.startsWith('wix:') || /^https?:/.test(b));
  if (!remote.length) continue;
  let ok = true;
  // Enthält die Zeile mehr Bilder, als im Ordner liegen, gilt sie als vollständige Galerie: Ordner wird ersetzt.
  // Sonst werden die neuen Bilder hinten angehängt.
  const pdir = path.join(ROOT, 'src/images/projekte', cells[iSlug]);
  const vorhanden = fs.existsSync(pdir) ? fs.readdirSync(pdir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)) : [];
  const ersetzen = remote.length > vorhanden.length;
  if (ersetzen) for (const f of vorhanden) fs.unlinkSync(path.join(pdir, f));
  const start = ersetzen ? 0 : vorhanden.length;
  for (const [i, b] of remote.entries()) {
    const raw = b.startsWith('wix:') ? WIX + b.slice(4) : b;
    // Wix liefert eine verkleinerte Fassung (max. 2000 px) und wandelt PNG auf Wunsch in JPG um – spart Speicher im Repository
    const zielExt = raw.startsWith(WIX) ? '.jpg' : ext(raw);
    const url = raw.startsWith(WIX) ? `${raw}/v1/fit/w_2000,h_2000,q_85/bild.jpg` : raw;
    const file = path.join(pdir, String(start + i + 1).padStart(2, '0') + zielExt);
    await load(url, file).catch((e) => { ok = false; console.warn('Fehler:', e.message); });
  }
  if (ok) { cells[iBild] = ''; lines[n] = cells.join(';'); }
}
fs.writeFileSync(csvFile, lines.join('\n'));
console.log('Fertig. Bitte `npm run build` ausführen und das Ergebnis prüfen.');
