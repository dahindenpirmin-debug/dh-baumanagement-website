// Regionenseiten: eine Seite pro Region mit eigenem Text und den Referenzen aus den zugehörigen Kantonen.
// Neue Region = neuer Eintrag hier. Nur Regionen aufnehmen, in denen es echte Referenzen gibt.
export const REGIONEN = [
  {
    slug: { de: 'zuerich', en: 'zurich' }, kantone: ['ZH'],
    name: { de: 'Zürich', en: 'Zurich' },
    title: { de: 'Baumanagement und Bauleitung in Zürich', en: 'Construction management and site management in Zurich' },
    desc: { de: 'Baumanagement, Bauleitung und Bauherrenvertretung im Kanton Zürich: Stadt Zürich, Zürichsee, Glattal und Oberland. Mit Referenzen aus Zürich, Uster, Zumikon und Uetikon am See.', en: 'Construction management, site management and owner’s representation in the Canton of Zurich: City of Zurich, Lake Zurich, Glattal and Oberland. With references in Zurich, Uster, Zumikon and Uetikon am See.' },
    lead: { de: 'Im Kanton Zürich begleiten wir Bauherrschaften von der Stadt Zürich über das Glattal und das Oberland bis an den Zürichsee, vom Einfamilienhaus bis zum Umbau im laufenden Bahnhofbetrieb.', en: 'In the Canton of Zurich we support owners from the City of Zurich through the Glattal and Oberland to Lake Zurich – from single-family homes to conversions in a live railway station.' },
    text: {
      de: ['Zürich ist der dichteste und anspruchsvollste Baumarkt der Schweiz: knappe Baufelder, enge Logistik, Nachbarschaften mit hoher Aufmerksamkeit und ein Bewilligungsverfahren mit eigenen Regeln. Wer hier baut, braucht eine Projektleitung, die Kosten und Termine früh absichert und die Abläufe mit Behörden und Nachbarn kennt.', 'Wir arbeiten im Kanton Zürich seit Jahren für private Bauherrschaften, Investoren und institutionelle Auftraggeber. Unser Sitz liegt in Grosswangen im Kanton Luzern; Projektsitzungen und Bauleitung finden vor Ort auf der Baustelle statt.'],
      en: ['Zurich is the densest and most demanding construction market in Switzerland: tight plots, constrained logistics, attentive neighbourhoods and a permit procedure with rules of its own. Building here requires project management that secures cost and schedule early and knows how to work with authorities and neighbours.', 'We have worked in the Canton of Zurich for years for private owners, investors and institutional clients. Our office is in Grosswangen in the Canton of Lucerne; project meetings and site management take place on site.'],
    },
    punkte: {
      de: ['Bauherrenvertretung und Gesamtprojektleitung für Wohn- und Gewerbebauten', 'Bauleitung und Baumanagement, auch in dicht bebauter Umgebung', 'Umbau und Sanierung im laufenden Betrieb', 'Baueingabe über eBaugesucheZH und Koordination mit den Bauämtern', 'Kostenplanung, Ausschreibung und Vergabe im Zürcher Markt'],
      en: ['Owner’s representation and overall project management for residential and commercial buildings', 'Site management and construction management, including in dense urban settings', 'Conversion and refurbishment during live operations', 'Permit applications via eBaugesucheZH and coordination with building offices', 'Cost planning, tendering and award in the Zurich market'],
    },
    artikel: 'baubewilligung-zuerich',
  },
  {
    slug: { de: 'zentralschweiz-luzern', en: 'central-switzerland-lucerne' }, kantone: ['LU', 'ZG', 'SZ', 'NW', 'OW', 'UR'],
    name: { de: 'Zentralschweiz und Luzern', en: 'Central Switzerland and Lucerne' },
    title: { de: 'Baumanagement und Bauleitung in Luzern und der Zentralschweiz', en: 'Construction management in Lucerne and Central Switzerland' },
    desc: { de: 'Baumanagement, Bauleitung und Bauherrenvertretung in Luzern, Sursee, Willisau, Zug und Schwyz. Die DH Baumanagement AG ist in Grosswangen zu Hause.', en: 'Construction management, site management and owner’s representation in Lucerne, Sursee, Willisau, Zug and Schwyz. DH Baumanagement AG is based in Grosswangen.' },
    lead: { de: 'Die Zentralschweiz ist unsere Heimat. Von Grosswangen aus sind wir rasch in Luzern, Sursee, Willisau, Zug und Schwyz und kennen Gemeinden, Planer und Unternehmer der Region.', en: 'Central Switzerland is our home. From Grosswangen we are quickly in Lucerne, Sursee, Willisau, Zug and Schwyz, and we know the region’s municipalities, designers and contractors.' },
    text: {
      de: ['Die meisten unserer Projekte liegen im Kanton Luzern: Mehrfamilienhäuser, Modernisierungen in der Stadt Luzern, die Sanierung eines Gewerbegebäudes in Triengen oder das Mängelmanagement in einem Hotel am See. Dazu kommen Projekte in den Nachbarkantonen.', 'Kurze Wege sind hier ein handfester Vorteil: Wir sind schnell auf der Baustelle, kennen die regionalen Unternehmer und wissen, wie die Bauämter der Gemeinden arbeiten.'],
      en: ['Most of our projects are in the Canton of Lucerne: apartment buildings, modernisations in the City of Lucerne, the refurbishment of a commercial building in Triengen or defects management in a lakeside hotel. Projects in neighbouring cantons complete the picture.', 'Short distances are a tangible advantage here: we are on site quickly, know the regional contractors and understand how municipal building offices work.'],
    },
    punkte: {
      de: ['Gesamtdienstleistung von der Beratung bis zur Nachbetreuung', 'Bauleitung für Ein- und Mehrfamilienhäuser', 'Sanierung und Modernisierung von Wohn- und Gewerbeliegenschaften', 'Zustandsanalysen und Bewertungen', 'Neubau und Umbau von Gewerbe- und Industriebauten'],
      en: ['Full service from consulting to aftercare', 'Site management for single- and multi-family homes', 'Refurbishment and modernisation of residential and commercial properties', 'Condition surveys and valuations', 'New build and conversion of commercial and industrial buildings'],
    },
    artikel: 'baubewilligung',
  },
  {
    slug: { de: 'aargau', en: 'aargau' }, kantone: ['AG'],
    name: { de: 'Aargau', en: 'Aargau' },
    title: { de: 'Baumanagement und Arealentwicklung im Aargau', en: 'Construction management and site development in Aargau' },
    desc: { de: 'Gesamtprojektleitung, Baumanagement und Arealentwicklung im Kanton Aargau, mit der mehrjährigen Entwicklung und Sanierung des HAVO-Areals in Aarburg als Referenz.', en: 'Overall project management, construction management and site development in the Canton of Aargau, with the multi-year development and refurbishment of the HAVO site in Aarburg as a reference.' },
    lead: { de: 'Im Aargau begleiten wir vor allem Gewerbe- und Industrieprojekte. In Aarburg führen wir seit 2022 eine Arealentwicklung mit Sanierung und Neubau über mehrere Jahre.', en: 'In Aargau we mainly support commercial and industrial projects. In Aarburg we have been leading a multi-year site development with refurbishment and new construction since 2022.' },
    text: {
      de: ['Der Aargau ist ein Industrie- und Logistikkanton mit vielen gewachsenen Arealen, die erneuert, verdichtet oder neu genutzt werden. Solche Vorhaben dauern Jahre und brauchen eine Projektleitung, die Bestand, Mieter, Behörden und Investitionen zusammenhält.', 'Von Grosswangen aus ist der Westaargau mit Zofingen, Aarburg und Oftringen unser unmittelbares Nachbargebiet.'],
      en: ['Aargau is an industrial and logistics canton with many established sites being renewed, densified or repurposed. Such projects take years and need project management that keeps existing buildings, tenants, authorities and investment aligned.', 'From Grosswangen, western Aargau with Zofingen, Aarburg and Oftringen is our immediate neighbour.'],
    },
    punkte: {
      de: ['Arealentwicklung in Etappen', 'Gesamtprojektleitung und Kostenplanung für Industriebauten', 'Sanierung von Gewerbeliegenschaften', 'Planungskoordination und Baumanagement'],
      en: ['Phased site development', 'Overall project management and cost planning for industrial buildings', 'Refurbishment of commercial properties', 'Design coordination and construction management'],
    },
    artikel: 'arealentwicklung',
  },
  {
    slug: { de: 'bern-oberaargau', en: 'bern-oberaargau' }, kantone: ['BE'],
    name: { de: 'Bern und Oberaargau', en: 'Bern and Oberaargau' },
    title: { de: 'Baumanagement im Kanton Bern und im Oberaargau', en: 'Construction management in the Canton of Bern and the Oberaargau' },
    desc: { de: 'Baumanagement und Bauleitung für Gewerbe- und Industriebauten im Kanton Bern, mit dem Neubau eines Produktions- und Bürogebäudes in Kleindietwil als Referenz.', en: 'Construction management and site management for commercial and industrial buildings in the Canton of Bern, with a new production and office building in Kleindietwil as a reference.' },
    lead: { de: 'Im Oberaargau und im angrenzenden Emmental sind wir für Gewerbe- und Industriebetriebe tätig, die neu bauen oder ihren Standort erweitern.', en: 'In the Oberaargau and the adjoining Emmental we work for commercial and industrial companies building new facilities or expanding their site.' },
    text: {
      de: ['Der Oberaargau grenzt direkt an unser Stammgebiet im Luzerner Hinterland. Langenthal, Huttwil und Kleindietwil liegen näher an Grosswangen als die Stadt Luzern.', 'Viele Betriebe der Region bauen neben dem Tagesgeschäft. Wir übernehmen Kosten, Termine und Bauleitung, damit die Geschäftsleitung entscheiden kann, statt Baustellen zu koordinieren.'],
      en: ['The Oberaargau borders directly on our home territory in the Lucerne hinterland. Langenthal, Huttwil and Kleindietwil are closer to Grosswangen than the City of Lucerne.', 'Many companies in the region build alongside their daily business. We take on cost, schedule and site management so that management can decide rather than coordinate construction sites.'],
    },
    punkte: {
      de: ['Neubau von Produktions- und Bürogebäuden', 'Baumanagement und Bauleitung', 'Umbau im laufenden Betrieb', 'Machbarkeitsstudien für Gewerbestandorte'],
      en: ['New production and office buildings', 'Construction management and site management', 'Conversion during live operations', 'Feasibility studies for commercial sites'],
    },
    artikel: 'gewerbehalle',
  },
];

export const RT = {
  de: { nav: 'Regionen', pfad: 'regionen', h1: 'In der ganzen Deutschschweiz tätig', title: 'Regionen: Baumanagement in Zürich, Zentralschweiz, Aargau und Bern', desc: 'Die DH Baumanagement AG arbeitet in der ganzen Deutschschweiz mit Schwerpunkt Zürich und Zentralschweiz. Regionen, Referenzen und Ansprechpartner im Überblick.', lead: 'Von Grosswangen aus betreuen wir Bauvorhaben in der ganzen Deutschschweiz, mit Schwerpunkt Zürich und Zentralschweiz. In diesen Regionen haben wir Projekte realisiert:', was: 'Was wir hier tun', refs: 'Referenzen in der Region', keine: 'Weitere Referenzen', mehr: 'Mehr zur Region', lesen: 'Dazu lesen', andere: 'Weitere Regionen', anzahl: (n) => (n === 1 ? '1 Referenz' : `${n} Referenzen`), block: 'In Ihrer Region', blockText: 'Wir begleiten Bauvorhaben in der ganzen Deutschschweiz:', sonst: 'Ihr Vorhaben liegt in einer anderen Region der Deutschschweiz? Wir sind auch in Basel, Solothurn und der Ostschweiz für Sie da; sprechen Sie uns an.' },
  en: { nav: 'Regions', pfad: 'regionen', h1: 'Working across German-speaking Switzerland', title: 'Regions: construction management in Zurich, Central Switzerland, Aargau and Bern', desc: 'DH Baumanagement AG works across German-speaking Switzerland with a focus on Zurich and Central Switzerland. Regions, references and contacts at a glance.', lead: 'From Grosswangen we look after construction projects across German-speaking Switzerland, with a focus on Zurich and Central Switzerland. We have delivered projects in these regions:', was: 'What we do here', refs: 'References in the region', keine: 'More references', mehr: 'More about the region', lesen: 'Related reading', andere: 'Other regions', anzahl: (n) => (n === 1 ? '1 reference' : `${n} references`), block: 'In your region', blockText: 'We support construction projects across German-speaking Switzerland:', sonst: 'Is your project in another part of German-speaking Switzerland? We also work in Basel, Solothurn and Eastern Switzerland – get in touch.' },
};
