// Online-Rechner: Richtwerte und Texte. Zahlen hier anpassen – sie werden beim Build in die Seiten eingebettet.
//
// KOSTENKENNWERTE (BKP 2 Gebäude, inkl. Honorare und MwSt., Preisstand 2026) – RICHTWERTE, keine Offertpreise:
//   min/max      = CHF pro m2 Geschossfläche (GF nach SIA 416)
//   m3min/m3max  = CHF pro m3 Gebäudevolumen (GV nach SIA 416)
//   h            = angenommene mittlere Geschosshöhe in m, mit der m2- und m3-Werte zueinander passen
// Die Werte sind Schätzungen und müssen mit eigenen abgerechneten Projekten kalibriert werden.
export const CONFIG = {
  kosten: {
    typen: {
      efh: { de: 'Einfamilienhaus', en: 'Single-family house', min: 3200, max: 4500, m3min: 950, m3max: 1350, h: 3.3 },
      mfh: { de: 'Mehrfamilienhaus', en: 'Apartment building', min: 2800, max: 3800, m3min: 850, m3max: 1150, h: 3.3 },
      buero: { de: 'Bürogebäude', en: 'Office building', min: 2800, max: 4000, m3min: 800, m3max: 1150, h: 3.5 },
      produktion: { de: 'Produktionsgebäude mit Büroanteil', en: 'Production building with offices', min: 1800, max: 2800, m3min: 360, m3max: 560, h: 5 },
      halle: { de: 'Gewerbe-/Produktionshalle (beheizt)', en: 'Commercial / production hall (heated)', min: 1400, max: 2400, m3min: 200, m3max: 340, h: 7 },
      lager: { de: 'Lagerhalle (einfach)', en: 'Warehouse (basic)', min: 900, max: 1600, m3min: 110, m3max: 200, h: 8 },
    },
    // Faktoren auf den Kennwert
    standard: { einfach: { de: 'Einfach', en: 'Basic', f: 0.9 }, mittel: { de: 'Mittel', en: 'Medium', f: 1.0 }, gehoben: { de: 'Gehoben', en: 'High', f: 1.2 } },
    eingriff: { neubau: { de: 'Neubau', en: 'New build', f: 1.0 }, gesamt: { de: 'Gesamtsanierung', en: 'Full refurbishment', f: 0.7 }, teil: { de: 'Teilsanierung', en: 'Partial refurbishment', f: 0.35 } },
    // Zuschläge in % von BKP 2: Vorbereitung (BKP 1), Umgebung (BKP 4), Baunebenkosten (BKP 5), Reserve
    zuschlag: { bkp1: 0.03, bkp4: 0.05, bkp5: 0.06, reserve: 0.05 },
  },
  dauer: {
    // Monate je Phase: [Vorstudie, Projektierung, Bewilligung, Ausschreibung, Realisierung]
    klein: { de: 'Klein (bis ca. CHF 1 Mio.)', en: 'Small (up to approx. CHF 1m)', m: [1, 3, 3, 2, 6] },
    mittel: { de: 'Mittel (ca. CHF 1–10 Mio.)', en: 'Medium (approx. CHF 1–10m)', m: [2, 5, 4, 3, 14] },
    gross: { de: 'Gross (über CHF 10 Mio.)', en: 'Large (over CHF 10m)', m: [4, 9, 6, 5, 24] },
  },
};

export const TOOLS = [
  {
    id: 'kosten',
    kurz: { de: 'Erstellungskosten für Neubau oder Sanierung als Bandbreite schätzen.', en: 'Estimate construction cost for new build or refurbishment as a range.' },
    icon: 'kosten',
    slug: { de: 'baukosten-rechner', en: 'construction-cost-calculator' },
    title: { de: 'Baukosten-Rechner', en: 'Construction cost calculator' },
    desc: { de: 'Grobe Baukosten für Neubau oder Sanierung von Wohn-, Büro-, Gewerbe- und Industriebauten in der Schweiz schätzen – nach Geschossfläche (m²) oder Gebäudevolumen (m³), Gebäudetyp und Standard.', en: 'Estimate rough construction costs for new builds or refurbishments of residential, office, commercial and industrial buildings in Switzerland – by floor area (m²) or building volume (m³), building type and standard.' },
    intro: { de: 'Der Rechner liefert eine Bandbreite der Erstellungskosten (BKP 1, 2, 4 und 5 inkl. Reserve, ohne Grundstück und Betriebseinrichtungen) – wahlweise über die Geschossfläche in m² oder das Gebäudevolumen in m³. Er entspricht einer Grobschätzung in der Phase der strategischen Planung mit einer Genauigkeit von rund ±25 %.', en: 'The calculator returns a range for the construction cost (BKP cost groups 1, 2, 4 and 5 incl. contingency, excluding land and operating equipment) – based either on floor area in m² or building volume in m³. It corresponds to a rough estimate at strategic planning stage with an accuracy of roughly ±25%.' },
  },
  {
    id: 'areal',
    kurz: { de: 'Ausnützungsreserve, Investition und Ertrag eines Grundstücks berechnen.', en: 'Calculate development reserve, investment and income of a plot.' },
    icon: 'potenzial',
    slug: { de: 'arealpotenzial-rechner', en: 'site-potential-calculator' },
    title: { de: 'Arealpotenzial-Rechner', en: 'Site potential calculator' },
    desc: { de: 'Ausnützungsreserve eines Grundstücks oder Areals berechnen: zulässige Geschossfläche, Reserve gegenüber dem Bestand, grobe Investition und Ertragspotenzial.', en: 'Calculate the development reserve of a plot or site: permissible floor area, reserve compared with existing buildings, rough investment and income potential.' },
    intro: { de: 'Wie viel zusätzliche Fläche lässt Ihr Grundstück zu, und was würde deren Realisierung ungefähr kosten und einbringen? Die Ausnützungsziffer (oder die entsprechende Dichteziffer) finden Sie im Bau- und Zonenreglement Ihrer Gemeinde.', en: 'How much additional floor area does your plot allow, and roughly what would it cost and yield to build it? You will find the floor area ratio (or equivalent density figure) in your municipality’s building and zoning regulations.' },
  },
  {
    id: 'dauer',
    kurz: { de: 'Projektdauer von der Vorstudie bis zum Bezug ab Startdatum planen.', en: 'Plan project duration from preliminary study to occupation.' },
    icon: 'termine',
    slug: { de: 'bauzeit-rechner', en: 'project-duration-calculator' },
    title: { de: 'Bauzeit- und Terminrechner', en: 'Project duration calculator' },
    desc: { de: 'Wie lange dauert ein Bauprojekt? Phasen nach SIA 112 von der Vorstudie bis zum Bezug – mit realistischem Bezugstermin ab Ihrem Startdatum.', en: 'How long does a construction project take? SIA 112 phases from preliminary study to occupation – with a realistic move-in date from your start date.' },
    intro: { de: 'Die meisten Terminprobleme entstehen vor dem Spatenstich. Der Rechner zeigt, wie viel Zeit Vorstudie, Projektierung, Bewilligung und Ausschreibung typischerweise beanspruchen – und wann Sie realistischerweise einziehen oder produzieren können.', en: 'Most schedule problems arise before ground is broken. The calculator shows how much time preliminary studies, design, permitting and tendering typically take – and when you can realistically move in or start production.' },
  },
];

const L = {
  de: { typ: 'Gebäudetyp', basis: 'Berechnen über', basisM2: 'Geschossfläche (m²)', basisM3: 'Gebäudevolumen (m³)', gf: 'Geschossfläche (m²)', gv: 'Gebäudevolumen (m³)', std: 'Ausbaustandard', eing: 'Vorhaben', calc: 'Berechnen', res: 'Resultat', range: 'Erstellungskosten (Bandbreite)', bkp2: 'davon Gebäude (BKP 2)', perm2: 'Kennwert pro m² Geschossfläche', perm3: 'Kennwert pro m³ Gebäudevolumen', neben: 'Vorbereitung, Umgebung, Nebenkosten, Reserve', incl: 'Erstellungskosten inkl. MwSt., inkl. Vorbereitung (3 %), Umgebung (5 %), Baunebenkosten (6 %) und Reserve (5 %); ohne Grundstück, Betriebseinrichtungen und Ausstattung.',
    gsf: 'Grundstücksfläche (m²)', az: 'Ausnützungsziffer (z. B. 0.8)', bestand: 'Bestehende Geschossfläche (m²)', nutz: 'Geplante Nutzung der Reserve', miete: 'Erwarteter Mietertrag (CHF pro m² und Jahr)', maxgf: 'Zulässige Geschossfläche', reserve: 'Ausnützungsreserve', invest: 'Grobe Investition für die Reserve', ertrag: 'Möglicher Mietertrag pro Jahr', rendite: 'Bruttorendite auf die Baukosten', norez: 'Keine Reserve: Der Bestand schöpft die Ausnützung bereits aus. Potenzial liegt allenfalls in einer Um- oder Aufzonung, einem Gestaltungsplan oder einer effizienteren Nutzung.',
    gross: 'Projektgrösse', start: 'Projektstart', bew: 'Baubewilligung erforderlich', ja: 'Ja', nein: 'Nein', phasen: ['Vorstudie / Machbarkeit', 'Projektierung', 'Bewilligungsverfahren', 'Ausschreibung & Vergabe', 'Realisierung'], total: 'Gesamtdauer', bezug: 'Voraussichtlicher Bezug', mon: 'Monate', einsprache: 'Ohne Einsprachen und Rechtsmittel gerechnet. Einsprachen können das Bewilligungsverfahren um Monate bis Jahre verlängern.',
    eingaben: 'Ihre Eingaben', stand: 'Erstellt am', pdf: 'PDF herunterladen', anfrage: 'Mit diesem Resultat anfragen', mail: 'Per E-Mail senden', fName: 'Name', fFirma: 'Firma (optional)', fEmail: 'E-Mail', fTel: 'Telefon', fMsg: 'Ihre Nachricht (optional)', fSend: 'Anfrage mit PDF senden', fHint: 'Das PDF mit Ihrem Resultat wird automatisch angehängt.', sending: 'Wird gesendet …', sent: 'Vielen Dank! Ihre Anfrage mit dem PDF ist bei uns eingegangen. Wir melden uns innerhalb von 24 Stunden.', fail: 'Das Senden hat nicht geklappt. Bitte laden Sie das PDF herunter und senden Sie es an', mailSubject: 'Anfrage', mailBody: 'Guten Tag\n\nich habe Ihren Online-Rechner verwendet und möchte das Resultat mit Ihnen besprechen.\n\n', mailAttach: 'Das PDF wurde soeben heruntergeladen – bitte fügen Sie es dieser E-Mail als Anhang bei.', mailNote: 'Das PDF wurde heruntergeladen und Ihr E-Mail-Programm geöffnet. Bitte fügen Sie das PDF als Anhang bei.', pdfNote: 'Richtwerte ohne Gewähr. Massgebend sind Standort, Baugrund, Ausbaustandard, Marktlage und Vorschriften im Einzelfall. Für eine belastbare Aussage prüfen wir Ihr Vorhaben gerne persönlich.' },
  en: { typ: 'Building type', basis: 'Calculate by', basisM2: 'Floor area (m²)', basisM3: 'Building volume (m³)', gf: 'Gross floor area (m²)', gv: 'Building volume (m³)', std: 'Fit-out standard', eing: 'Project', calc: 'Calculate', res: 'Result', range: 'Construction cost (range)', bkp2: 'of which building (BKP 2)', perm2: 'Benchmark per m² floor area', perm3: 'Benchmark per m³ building volume', neben: 'Preparatory and external works, ancillary costs, contingency', incl: 'Construction cost incl. VAT, incl. preparatory works (3%), external works (5%), ancillary costs (6%) and contingency (5%); excl. land, operating equipment and furnishings.',
    gsf: 'Plot area (m²)', az: 'Floor area ratio (e.g. 0.8)', bestand: 'Existing floor area (m²)', nutz: 'Planned use of the reserve', miete: 'Expected rental income (CHF per m² per year)', maxgf: 'Permissible floor area', reserve: 'Development reserve', invest: 'Rough investment for the reserve', ertrag: 'Potential rental income per year', rendite: 'Gross yield on construction cost', norez: 'No reserve: the existing buildings already use the permitted density. Potential may lie in rezoning, a special design plan or more efficient use.',
    gross: 'Project size', start: 'Project start', bew: 'Building permit required', ja: 'Yes', nein: 'No', phasen: ['Preliminary study / feasibility', 'Design', 'Permit procedure', 'Tendering & award', 'Construction'], total: 'Total duration', bezug: 'Expected occupation', mon: 'months', einsprache: 'Calculated without objections or appeals. Objections can extend the permit procedure by months or even years.',
    eingaben: 'Your inputs', stand: 'Created on', pdf: 'Download PDF', anfrage: 'Enquire with this result', mail: 'Send by email', fName: 'Name', fFirma: 'Company (optional)', fEmail: 'Email', fTel: 'Phone', fMsg: 'Your message (optional)', fSend: 'Send enquiry with PDF', fHint: 'The PDF with your result is attached automatically.', sending: 'Sending …', sent: 'Thank you! We have received your enquiry with the PDF and will get back to you within 24 hours.', fail: 'Sending did not work. Please download the PDF and send it to', mailSubject: 'Enquiry', mailBody: 'Hello\n\nI have used your online calculator and would like to discuss the result with you.\n\n', mailAttach: 'The PDF has just been downloaded – please attach it to this email.', mailNote: 'The PDF has been downloaded and your email program opened. Please attach the PDF.', pdfNote: 'Benchmark values without guarantee. Location, ground conditions, fit-out standard, market situation and regulations in the individual case are decisive. For a robust statement we will gladly review your project in person.' },
};

const opts = (obj, lang) => Object.entries(obj).map(([k, v]) => `<option value="${k}">${v[lang]}</option>`).join('');
const field = (id, label, inner) => `<label class="field" for="${id}"><span id="${id}-label">${label}</span>${inner}</label>`;

export function toolForm(tool, lang) {
  const l = L[lang], c = CONFIG;
  if (tool.id === 'kosten') return `
    ${field('k-typ', l.typ, `<select id="k-typ">${opts(c.kosten.typen, lang)}</select>`)}
    <fieldset class="seg"><legend>${l.basis}</legend>
      <label><input type="radio" name="k-basis" value="m2" checked><span>${l.basisM2}</span></label>
      <label><input type="radio" name="k-basis" value="m3"><span>${l.basisM3}</span></label>
    </fieldset>
    ${field('k-menge', l.gf, `<input id="k-menge" type="number" min="20" step="10" value="1500" inputmode="numeric">`)}
    ${field('k-std', l.std, `<select id="k-std">${opts(c.kosten.standard, lang).replace('value="mittel"', 'value="mittel" selected')}</select>`)}
    ${field('k-eing', l.eing, `<select id="k-eing">${opts(c.kosten.eingriff, lang)}</select>`)}`;
  if (tool.id === 'areal') return `
    ${field('a-gsf', l.gsf, `<input id="a-gsf" type="number" min="100" step="50" value="8000" inputmode="numeric">`)}
    ${field('a-az', l.az, `<input id="a-az" type="number" min="0.1" max="5" step="0.05" value="0.8" inputmode="decimal">`)}
    ${field('a-bestand', l.bestand, `<input id="a-bestand" type="number" min="0" step="50" value="3500" inputmode="numeric">`)}
    ${field('a-nutz', l.nutz, `<select id="a-nutz">${opts(c.kosten.typen, lang).replace('value="halle"', 'value="halle" selected')}</select>`)}
    ${field('a-miete', l.miete, `<input id="a-miete" type="number" min="0" step="5" value="140" inputmode="numeric">`)}`;
  return `
    ${field('d-gross', l.gross, `<select id="d-gross">${opts(c.dauer, lang).replace('value="mittel"', 'value="mittel" selected')}</select>`)}
    ${field('d-start', l.start, `<input id="d-start" type="month">`)}
    ${field('d-bew', l.bew, `<select id="d-bew"><option value="1">${l.ja}</option><option value="0">${l.nein}</option></select>`)}`;
}

// Annahmen offenlegen: Die Kennwerte kommen direkt aus CONFIG, damit Anzeige und Berechnung nie auseinanderlaufen.
export function toolAnnahmen(tool, lang) {
  const de = lang === 'de', nf = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '’'), pc = (f) => Math.round(f * 100) + '\u00a0%', K = CONFIG.kosten, z = K.zuschlag;
  const tbl = (head, rows) => `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  let body = '';
  if (tool.id === 'kosten') body = `<p>${de ? 'Kennwerte für BKP 2 (Gebäude) bei mittlerem Standard, Neubau, Preisstand 2026, ohne MWST:' : 'Benchmarks for BKP 2 (building) at medium standard, new build, 2026 prices, excluding VAT:'}</p>
${tbl(de ? ['Gebäudetyp', 'CHF pro m² Geschossfläche', 'CHF pro m³ Gebäudevolumen'] : ['Building type', 'CHF per m² floor area', 'CHF per m³ building volume'], Object.values(K.typen).map((t) => [t[lang], `${nf(t.min)} – ${nf(t.max)}`, `${nf(t.m3min)} – ${nf(t.m3max)}`]))}
<ul><li>${de ? 'Standard' : 'Standard'}: ${Object.values(K.standard).map((x) => `${x[lang]} × ${x.f.toFixed(2)}`).join(', ')}</li>
<li>${de ? 'Eingriff' : 'Scope'}: ${Object.values(K.eingriff).map((x) => `${x[lang]} × ${x.f.toFixed(2)}`).join(', ')}</li>
<li>${de ? `Zuschläge auf BKP 2: Vorbereitung (BKP 1) ${pc(z.bkp1)}, Umgebung (BKP 4) ${pc(z.bkp4)}, Baunebenkosten (BKP 5) ${pc(z.bkp5)}, Reserve ${pc(z.reserve)}` : `Additions to BKP 2: preparation (BKP 1) ${pc(z.bkp1)}, external works (BKP 4) ${pc(z.bkp4)}, ancillary costs (BKP 5) ${pc(z.bkp5)}, contingency ${pc(z.reserve)}`}</li>
<li>${de ? 'Nicht enthalten: Grundstück, Erschliessung ausserhalb der Parzelle, Betriebseinrichtungen, Altlasten, Finanzierung, MWST' : 'Not included: land, off-site infrastructure, operating equipment, contamination, financing, VAT'}</li></ul>`;
  else if (tool.id === 'dauer') body = `<p>${de ? 'Richtdauern in Monaten je Phase, ohne Einsprachen und Rekurse:' : 'Indicative durations in months per phase, excluding objections and appeals:'}</p>
${tbl(de ? ['Projektgrösse', 'Vorstudie', 'Projektierung', 'Bewilligung', 'Ausschreibung', 'Realisierung'] : ['Project size', 'Preliminary study', 'Design', 'Permit', 'Tender', 'Construction'], Object.values(CONFIG.dauer).map((d) => [d[lang], ...d.m]))}`;
  else body = `<ul><li>${de ? 'Mögliche Geschossfläche = Grundstücksfläche × Ausnützungsziffer; Reserve = mögliche minus bestehende Geschossfläche' : 'Possible floor area = plot area × floor area ratio; reserve = possible minus existing floor area'}</li>
<li>${de ? 'Investition: Kennwerte des Baukosten-Rechners für die gewählte Nutzung (mittlerer Standard, Neubau)' : 'Investment: benchmarks of the construction cost calculator for the selected use (medium standard, new build)'}</li>
<li>${de ? 'Ertrag: Ihre Eingabe für den Mietertrag pro m² und Jahr; Bruttorendite = Jahresertrag ÷ Investition' : 'Income: your input for rent per m² per year; gross yield = annual income ÷ investment'}</li>
<li>${de ? 'Die Ausnützungsziffer und ihre Berechnung richten sich nach der Bau- und Zonenordnung der Gemeinde; massgebend ist die Auskunft des Bauamts' : 'The floor area ratio and its calculation follow the municipal building and zoning regulations; the building office’s information is decisive'}</li></ul>`;
  return `<details class="annahmen"><summary>${de ? 'Mit diesen Annahmen rechnen wir' : 'The assumptions behind this calculator'}</summary>${body}
<p class="haftung"><strong>${de ? 'Haftungsausschluss' : 'Disclaimer'}:</strong> ${de ? 'Der Rechner liefert eine unverbindliche Grobschätzung auf Basis von Erfahrungswerten. Das Resultat ist keine Offerte, kein Kostenvoranschlag und keine Zusicherung. Die DH Baumanagement AG übernimmt keine Haftung für Entscheide, die auf dieser Schätzung beruhen. Verbindliche Zahlen erhalten Sie nach einer Prüfung Ihres Vorhabens.' : 'The calculator provides a non-binding rough estimate based on empirical values. The result is not a quotation, not a cost estimate and not an assurance. DH Baumanagement AG accepts no liability for decisions based on this estimate. You will receive binding figures after a review of your project.'}</p></details>`;
}

// Resultatbereich mit Aktionen und Anfrageformular (Netlify Forms, PDF wird per Skript angehängt)
export function toolResult(tool, lang, note, legalUrl, legalLabel) {
  const l = L[lang];
  return `<div class="tool-result" aria-live="polite"><h2>${l.res}</h2><div class="out"></div><p class="disclaimer">${note}</p>
    <div class="tool-actions"><button class="btn" type="button" data-act="form">${l.anfrage}</button><button class="btn ghost" type="button" data-act="pdf">${l.pdf}</button><button class="btn ghost" type="button" data-act="mail">${l.mail}</button></div>
    <form class="tool-lead" name="rechner-anfrage" method="POST" enctype="multipart/form-data" data-netlify="true" netlify-honeypot="website" hidden>
      <input type="hidden" name="form-name" value="rechner-anfrage"><input type="hidden" name="sprache" value="${lang}"><input type="hidden" name="rechner" value="${tool.title[lang]}"><input type="hidden" name="zusammenfassung">
      <p class="hp"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></p>
      <label class="field"><span>${l.fName} *</span><input name="name" required autocomplete="name"></label>
      <label class="field"><span>${l.fFirma}</span><input name="firma" autocomplete="organization"></label>
      <label class="field"><span>${l.fEmail} *</span><input type="email" name="email" required autocomplete="email"></label>
      <label class="field"><span>${l.fTel}</span><input type="tel" name="telefon" autocomplete="tel"></label>
      <label class="field"><span>${l.fMsg}</span><textarea name="nachricht" rows="4"></textarea></label>
      <input type="file" name="resultat" accept="application/pdf" hidden>
      <p class="disclaimer">${l.fHint} <a href="${legalUrl}">${legalLabel}</a></p>
      <button class="btn" type="submit">${l.fSend}</button>
    </form>
    <p class="tool-msg" role="status"></p></div>`;
}
export const toolLabels = (lang) => L[lang];
