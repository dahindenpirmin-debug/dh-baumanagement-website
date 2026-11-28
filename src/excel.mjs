// Excel-Vorlage für Referenzen: wird bei jedem Build mit den aktuellen Projekten und Auswahllisten erzeugt
// (/admin/DH-Referenzen.xlsx). Dieselbe Spaltendefinition liest der Import im Admin-Bereich (config.json -> excel).
import ExcelJS from 'exceljs';

// key = Feld in CSV/JSON; label = Spaltentitel in Excel (daran erkennt der Import die Spalte)
export const EXCEL_COLS = [
  { key: 'slug', label: 'Kennung (nicht ändern; bei neuen Projekten leer)', w: 30 },
  { key: 'titel_de', label: 'Bauprojekt (Titel) *', w: 38 },
  { key: 'titel_en', label: 'Titel Englisch', w: 30 },
  { key: 'kategorie', label: 'Kategorie *', w: 28, list: 'kat' },
  { key: 'projektart', label: 'Projektart *', w: 26, list: 'art' },
  { key: 'ort', label: 'Ort *', w: 22 },
  { key: 'kanton', label: 'Kanton', w: 9, list: 'kt' },
  { key: 'jahr_von', label: 'Jahr von *', w: 10, int: true },
  { key: 'jahr_bis', label: 'Jahr bis', w: 10, int: true },
  { key: 'bauvolumen_mchf', label: 'Bauvolumen MCHF', w: 13, dec: true },
  { key: 'bauherr', label: 'Bauherrschaft', w: 22 },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ key: 'leistung_' + n, label: 'Leistung ' + n + (n === 1 ? ' *' : ''), w: 30, list: 'leist' })),
  { key: 'beschreibung_de', label: 'Beschrieb Deutsch', w: 60, wrap: true },
  { key: 'beschreibung_en', label: 'Beschrieb Englisch', w: 40, wrap: true },
  { key: 'kennzahlen_de', label: 'Kennzahlen Deutsch (mit | trennen)', w: 40, wrap: true },
  { key: 'kennzahlen_en', label: 'Kennzahlen Englisch (mit | trennen)', w: 30, wrap: true },
  { key: 'zitat_de', label: 'Kundenstimme', w: 36, wrap: true },
  { key: 'zitat_von', label: 'Kundenstimme von', w: 26 },
  { key: 'lat', label: 'Breite (lat)', w: 11, dec: true },
  { key: 'lng', label: 'Länge (lng)', w: 11, dec: true },
  { key: 'featured', label: 'Aktuell (ja/nein)', w: 12, list: 'jn' },
  { key: 'versteckt', label: 'Ausgeblendet (ja/nein)', w: 14, list: 'jn' },
];

const NAVY = 'FF0E2F47', GOLD = 'FFE7C984', FILL = 'FFFFF7E0';
const colName = (n) => { let s = ''; for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; };

export async function buildExcel({ file, rows, cats, types, kantone, leistungen }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DH Baumanagement AG';
  const ws = wb.addWorksheet('Projekte', { views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] });
  const li = wb.addWorksheet('Listen'), an = wb.addWorksheet('Anleitung');
  const font = { name: 'Arial', size: 10 };

  // Auswahllisten
  const lists = { kat: Object.values(cats), art: Object.values(types), kt: Object.keys(kantone), leist: leistungen.flatMap((g) => g.items.map((x) => x[0])), jn: ['ja', 'nein'] };
  const titel = { kat: 'Kategorien', art: 'Projektarten', kt: 'Kantone', leist: 'Leistungen', jn: 'Ja/Nein' }, ref = {};
  Object.keys(lists).forEach((k, c) => {
    li.getColumn(c + 1).width = k === 'leist' || k === 'kat' ? 44 : 26;
    const h = li.getCell(1, c + 1); h.value = titel[k]; h.font = { ...font, bold: true, color: { argb: 'FFFFFFFF' } }; h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    lists[k].forEach((v, r) => { const z = li.getCell(r + 2, c + 1); z.value = v; z.font = font; });
    ref[k] = `Listen!$${colName(c)}$2:$${colName(c)}$${lists[k].length + 1}`;
  });

  // Kopfzeile
  ws.columns = EXCEL_COLS.map((c) => ({ width: c.w }));
  const head = ws.getRow(1); head.height = 44;
  EXCEL_COLS.forEach((c, i) => {
    const h = head.getCell(i + 1); h.value = c.label;
    h.font = { ...font, bold: true, color: { argb: 'FFFFFFFF' } }; h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    h.alignment = { vertical: 'middle', wrapText: true }; h.border = { bottom: { style: 'medium', color: { argb: GOLD } } };
  });

  // Bestehende Projekte
  const split = (v) => String(v || '').split('|').map((x) => x.trim()).filter(Boolean);
  const num = (v) => (v === '' || v == null || isNaN(+v) ? null : +v);
  rows.forEach((r, n) => {
    const le = split(r.leistungen_de), row = ws.getRow(n + 2);
    EXCEL_COLS.forEach((c, i) => {
      let v = r[c.key];
      if (c.key === 'kategorie') v = cats[r.kategorie] || r.kategorie;
      else if (c.key === 'projektart') v = types[r.projektart] || r.projektart;
      else if (c.key.startsWith('leistung_')) v = le[+c.key.slice(9) - 1] || '';
      else if (c.key === 'featured' || c.key === 'versteckt') v = /^(ja|yes|x|1|true)$/i.test(String(v || '')) ? 'ja' : '';
      else if (c.int || c.dec) v = num(v);
      else v = String(v || '').replace(/\\n/g, '\n');
      row.getCell(i + 1).value = v === '' ? null : v;
    });
  });

  // Format und Gültigkeit für bestehende und 200 leere Zeilen
  const last = rows.length + 201;
  for (let r = 2; r <= last; r++) {
    EXCEL_COLS.forEach((c, i) => {
      const z = ws.getCell(r, i + 1); z.font = c.key === 'slug' ? { ...font, color: { argb: 'FF8A8A8A' } } : font;
      z.alignment = { vertical: 'top', wrapText: !!c.wrap };
      if (c.label.includes('*')) z.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL } };
      if (c.dec) z.numFmt = c.key === 'bauvolumen_mchf' ? '0.0##' : '0.0000';
      if (c.int) z.numFmt = '0';
      if (c.list) z.dataValidation = { type: 'list', allowBlank: true, formulae: [ref[c.list]], showErrorMessage: true, errorTitle: 'Bitte aus der Liste wählen', error: 'Nur die vorgegebenen Werte sind möglich (siehe Blatt «Listen»).' };
      else if (c.int) z.dataValidation = { type: 'whole', operator: 'between', allowBlank: true, formulae: [1990, 2100], showErrorMessage: true, errorTitle: 'Jahr', error: 'Bitte eine Jahreszahl eingeben, z. B. 2026.' };
      else if (c.key === 'bauvolumen_mchf') z.dataValidation = { type: 'decimal', operator: 'between', allowBlank: true, formulae: [0, 2000], showErrorMessage: true, errorTitle: 'Bauvolumen', error: 'Nur die Zahl in Mio. CHF, z. B. 4.2.' };
    });
  }
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: EXCEL_COLS.length } };

  // Anleitung
  an.getColumn(1).width = 110;
  [
    ['Referenzen DH Baumanagement AG – Excel-Vorlage', true],
    [''],
    ['So funktioniert es', true],
    ['1. Blatt «Projekte»: Jede Zeile ist ein Projekt. Bestehende Projekte sind bereits eingetragen und dienen als Beispiel.'],
    ['2. Neues Projekt: unterste freie Zeile ausfüllen. Die Spalte «Kennung» bleibt leer, sie wird beim Hochladen aus Titel und Ort gebildet.'],
    ['3. Bestehendes Projekt ändern: Werte in der Zeile überschreiben. Die Kennung nicht ändern, sonst entsteht ein neues Projekt.'],
    ['4. Gelb hinterlegte Spalten mit * sind Pflicht: Titel, Kategorie, Projektart, Ort, Jahr von, Leistung 1.'],
    ['5. Kategorie, Projektart, Kanton, Leistungen, Aktuell und Ausgeblendet nur aus der Auswahlliste wählen (Pfeil in der Zelle).'],
    ['6. Datei speichern und im Admin-Bereich der Website unter «Excel hochladen» auswählen. Vor dem Speichern erscheint eine Vorschau mit neuen, geänderten und fehlerhaften Zeilen.'],
    [''],
    ['Hinweise zu den Feldern', true],
    ['Jahr bis: bei laufenden Projekten das geplante Endjahr. Leer = gleiches Jahr wie «Jahr von».'],
    ['Bauvolumen MCHF: nur die Zahl in Mio. CHF, z. B. 4.2. Leer lassen, wenn es nicht genannt werden soll.'],
    ['Bauherrschaft: nur mit Einverständnis nennen, sonst «Privat» oder leer.'],
    ['Leistung 1 bis 10: je Zelle eine Leistung aus der Liste. Die englische Bezeichnung wird automatisch zugeordnet.'],
    ['Kennzahlen: mehrere Angaben mit | trennen, z. B. Geschossfläche 2400 m² | 12 Wohnungen.'],
    ['Aktuell: «ja» zeigt das Projekt auf der Startseite unter «Aktuelle Projekte». Projekte, die im laufenden Jahr oder später enden, erscheinen dort automatisch.'],
    ['Ausgeblendet: «ja» nimmt das Projekt von der Website, ohne es zu löschen.'],
    ['Breite/Länge: Standort für die Karte (z. B. 47.17 / 8.11). Einfacher im Admin-Bereich per Klick auf die Karte setzen.'],
    ['Fotos lassen sich nicht über Excel hochladen. Nach dem Import das Projekt im Admin-Bereich öffnen und die Fotos dort hinzufügen.'],
    [''],
    ['Spaltentitel und die Blätter «Projekte» und «Listen» bitte nicht umbenennen: Der Import erkennt die Spalten am Titel.'],
  ].forEach(([t, b], i) => { const z = an.getCell(i + 1, 1); z.value = t; z.font = { ...font, bold: !!b, size: i === 0 ? 14 : 10, color: { argb: b ? NAVY : 'FF222222' } }; z.alignment = { wrapText: true, vertical: 'top' }; });

  await wb.xlsx.writeFile(file);
}
