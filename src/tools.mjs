// Online-Rechner: Richtwerte und Texte. Zahlen hier anpassen – sie werden beim Build in die Seiten eingebettet.
// WICHTIG: Die Kostenkennwerte sind Richtwerte (CHF pro m2 Geschossfläche, BKP 2, inkl. MwSt.) und sollten
// mit eigenen abgerechneten Projekten kalibriert werden.
export const CONFIG = {
  kosten: {
    typen: {
      efh: { de: 'Einfamilienhaus', en: 'Single-family house', min: 3200, max: 4500 },
      mfh: { de: 'Mehrfamilienhaus', en: 'Apartment building', min: 2800, max: 3800 },
      buero: { de: 'Bürogebäude', en: 'Office building', min: 2800, max: 4000 },
      produktion: { de: 'Produktionsgebäude mit Büroanteil', en: 'Production building with offices', min: 1800, max: 2800 },
      halle: { de: 'Gewerbe-/Produktionshalle (beheizt)', en: 'Commercial / production hall (heated)', min: 1400, max: 2400 },
      lager: { de: 'Lagerhalle (einfach)', en: 'Warehouse (basic)', min: 900, max: 1600 },
    },
    standard: { einfach: { de: 'Einfach', en: 'Basic', f: 0.9 }, mittel: { de: 'Mittel', en: 'Medium', f: 1.0 }, gehoben: { de: 'Gehoben', en: 'High', f: 1.2 } },
    eingriff: { neubau: { de: 'Neubau', en: 'New build', f: 1.0 }, gesamt: { de: 'Gesamtsanierung', en: 'Full refurbishment', f: 0.7 }, teil: { de: 'Teilsanierung', en: 'Partial refurbishment', f: 0.35 } },
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
    slug: { de: 'baukosten-rechner', en: 'construction-cost-calculator' },
    title: { de: 'Baukosten-Rechner', en: 'Construction cost calculator' },
    desc: { de: 'Grobe Baukosten für Neubau oder Sanierung von Wohn-, Büro-, Gewerbe- und Industriebauten in der Schweiz schätzen – nach Geschossfläche, Gebäudetyp und Standard.', en: 'Estimate rough construction costs for new builds or refurbishments of residential, office, commercial and industrial buildings in Switzerland – by floor area, building type and standard.' },
    intro: { de: 'Der Rechner liefert eine Bandbreite der Erstellungskosten (BKP 1, 2, 4 und 5 inkl. Reserve, ohne Grundstück und Betriebseinrichtungen). Er entspricht einer Grobschätzung in der Phase der strategischen Planung mit einer Genauigkeit von rund ±25 %.', en: 'The calculator returns a range for the construction cost (BKP cost groups 1, 2, 4 and 5 incl. contingency, excluding land and operating equipment). It corresponds to a rough estimate at strategic planning stage with an accuracy of roughly ±25%.' },
  },
  {
    id: 'areal',
    slug: { de: 'arealpotenzial-rechner', en: 'site-potential-calculator' },
    title: { de: 'Arealpotenzial-Rechner', en: 'Site potential calculator' },
    desc: { de: 'Ausnützungsreserve eines Grundstücks oder Areals berechnen: zulässige Geschossfläche, Reserve gegenüber dem Bestand, grobe Investition und Ertragspotenzial.', en: 'Calculate the development reserve of a plot or site: permissible floor area, reserve compared with existing buildings, rough investment and income potential.' },
    intro: { de: 'Wie viel zusätzliche Fläche lässt Ihr Grundstück zu, und was würde deren Realisierung ungefähr kosten und einbringen? Die Ausnützungsziffer (oder die entsprechende Dichteziffer) finden Sie im Bau- und Zonenreglement Ihrer Gemeinde.', en: 'How much additional floor area does your plot allow, and roughly what would it cost and yield to build it? You will find the floor area ratio (or equivalent density figure) in your municipality’s building and zoning regulations.' },
  },
  {
    id: 'dauer',
    slug: { de: 'bauzeit-rechner', en: 'project-duration-calculator' },
    title: { de: 'Bauzeit- und Terminrechner', en: 'Project duration calculator' },
    desc: { de: 'Wie lange dauert ein Bauprojekt? Phasen nach SIA 112 von der Vorstudie bis zum Bezug – mit realistischem Bezugstermin ab Ihrem Startdatum.', en: 'How long does a construction project take? SIA 112 phases from preliminary study to occupation – with a realistic move-in date from your start date.' },
    intro: { de: 'Die meisten Terminprobleme entstehen vor dem Spatenstich. Der Rechner zeigt, wie viel Zeit Vorstudie, Projektierung, Bewilligung und Ausschreibung typischerweise beanspruchen – und wann Sie realistischerweise einziehen oder produzieren können.', en: 'Most schedule problems arise before ground is broken. The calculator shows how much time preliminary studies, design, permitting and tendering typically take – and when you can realistically move in or start production.' },
  },
];

const L = {
  de: { typ: 'Gebäudetyp', gf: 'Geschossfläche (m²)', std: 'Ausbaustandard', eing: 'Vorhaben', calc: 'Berechnen', res: 'Resultat', range: 'Bandbreite Erstellungskosten', bkp2: 'davon Gebäude (BKP 2)', perm2: 'Kennwert pro m² Geschossfläche', incl: 'inkl. Vorbereitung, Umgebung, Baunebenkosten und 5 % Reserve; ohne Grundstück, Betriebseinrichtungen und Ausstattung.',
    gsf: 'Grundstücksfläche (m²)', az: 'Ausnützungsziffer (z. B. 0.8)', bestand: 'Bestehende Geschossfläche (m²)', nutz: 'Geplante Nutzung der Reserve', miete: 'Erwarteter Mietertrag (CHF pro m² und Jahr)', maxgf: 'Zulässige Geschossfläche', reserve: 'Ausnützungsreserve', invest: 'Grobe Investition für die Reserve', ertrag: 'Möglicher Mietertrag pro Jahr', rendite: 'Bruttorendite auf die Baukosten', norez: 'Keine Reserve: Der Bestand schöpft die Ausnützung bereits aus. Potenzial liegt allenfalls in einer Um- oder Aufzonung, einem Gestaltungsplan oder einer effizienteren Nutzung.',
    gross: 'Projektgrösse', start: 'Projektstart', bew: 'Baubewilligung erforderlich', ja: 'Ja', nein: 'Nein', phasen: ['Vorstudie / Machbarkeit', 'Projektierung', 'Bewilligungsverfahren', 'Ausschreibung & Vergabe', 'Realisierung'], total: 'Gesamtdauer', bezug: 'Voraussichtlicher Bezug', mon: 'Monate', einsprache: 'Ohne Einsprachen und Rechtsmittel gerechnet. Einsprachen können das Bewilligungsverfahren um Monate bis Jahre verlängern.' },
  en: { typ: 'Building type', gf: 'Gross floor area (m²)', std: 'Fit-out standard', eing: 'Project', calc: 'Calculate', res: 'Result', range: 'Construction cost range', bkp2: 'of which building (BKP 2)', perm2: 'Benchmark per m² floor area', incl: 'incl. preparatory works, external works, ancillary costs and 5% contingency; excl. land, operating equipment and furnishings.',
    gsf: 'Plot area (m²)', az: 'Floor area ratio (e.g. 0.8)', bestand: 'Existing floor area (m²)', nutz: 'Planned use of the reserve', miete: 'Expected rental income (CHF per m² per year)', maxgf: 'Permissible floor area', reserve: 'Development reserve', invest: 'Rough investment for the reserve', ertrag: 'Potential rental income per year', rendite: 'Gross yield on construction cost', norez: 'No reserve: the existing buildings already use the permitted density. Potential may lie in rezoning, a special design plan or more efficient use.',
    gross: 'Project size', start: 'Project start', bew: 'Building permit required', ja: 'Yes', nein: 'No', phasen: ['Preliminary study / feasibility', 'Design', 'Permit procedure', 'Tendering & award', 'Construction'], total: 'Total duration', bezug: 'Expected occupation', mon: 'months', einsprache: 'Calculated without objections or appeals. Objections can extend the permit procedure by months or even years.' },
};

const opts = (obj, lang) => Object.entries(obj).map(([k, v]) => `<option value="${k}">${v[lang]}</option>`).join('');
const field = (id, label, inner) => `<label class="field" for="${id}"><span>${label}</span>${inner}</label>`;

export function toolForm(tool, lang) {
  const l = L[lang], c = CONFIG;
  if (tool.id === 'kosten') return `
    ${field('k-typ', l.typ, `<select id="k-typ">${opts(c.kosten.typen, lang)}</select>`)}
    ${field('k-gf', l.gf, `<input id="k-gf" type="number" min="20" step="10" value="1500" inputmode="numeric">`)}
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
export const toolLabels = (lang) => L[lang];
