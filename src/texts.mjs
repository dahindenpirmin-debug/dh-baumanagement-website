// Zentrale Stammdaten und Seitentexte (DE/EN). Texte hier ändern – der Build erzeugt alle Seiten neu.
export const SITE = {
  name: 'DH Baumanagement AG',
  domain: 'https://www.dh-baumanagement.ch',
  street: 'Dorfstrasse 3', zip: '6022', city: 'Grosswangen', region: 'LU', country: 'CH',
  phone: '041 982 01 45', phoneIntl: '+41419820145',
  email: 'info@dh-baumanagement.ch',
  uid: 'CHE-274.853.539',
  linkedin: 'https://www.linkedin.com/company/dh-baumanagement-ag/',
  geo: { lat: 47.1339, lng: 8.0497 },
  // Titelbild der Startseite: Foto eines eigenen Projekts (Pfad unter src/images/projekte/). Leer = allgemeines Titelbild.
  heroProjekt: 'wohnueberbauung-drei-eichen-zumikon/02.jpg',
  // Repository für den Admin-Bereich (/admin/)
  repo: 'dahindenpirmin-debug/dh-baumanagement-website', branch: 'main',
  // Bilder der bisherigen Wix-Seite. Sobald lokale Dateien in src/images/ liegen (logo.png, hero.jpg, martin-dahinden.jpg), werden diese verwendet.
  remote: {
    logo: 'https://static.wixstatic.com/media/f8c5a9_49629bb0d4174019885ce4015c9bfa68~mv2.png',
    hero: 'https://static.wixstatic.com/media/f8c5a9_236d3343538a49ef9e26e5594f7bfc53~mv2_d_2000_1500_s_2.jpg',
    portrait: 'https://static.wixstatic.com/media/f3bfb9_162adafceb344da7b41ccc5b4a1d886d~mv2.jpg',
  },
};

// Projektkategorien – neue Kategorie = neue Zeile hier, danach in der CSV verwenden.
export const CATS = {
  wohnen: { de: 'Ein- und Mehrfamilienhäuser', en: 'Single- and multi-family homes' },
  gewerbe: { de: 'Industrie- und Gewerbebauten', en: 'Industrial and commercial buildings' },
};
// Team. Reihenfolge = Anzeige. `bild` (optional) liegt unter src/images/team/ oder src/images/; ohne Bild erscheinen die Initialen.
// Nur Angaben aufnehmen, die der Benutzer genannt hat (keine erfundenen Lebensläufe).
export const TEAM = [
  { name: 'Martin Dahinden', rolle: { de: 'Inhaber und Projektleiter', en: 'Owner and project manager' }, bild: 'martin-dahinden.jpg' },
  { name: 'Manuel Unternährer', rolle: { de: 'Junior Bauleiter', en: 'Junior site manager' } },
  { name: 'Pirmin Dahinden', rolle: { de: 'Finanzen und Administration', en: 'Finance and administration' }, bild: 'pirmin-dahinden.jpg' },
];

// Vordefinierte Dienstleistungen für Referenzen. Im Admin-Bereich als Auswahl (Häkchen); die englische
// Bezeichnung wird automatisch zugeordnet. Neue Leistung = neue Zeile [Deutsch, Englisch] in der passenden Gruppe.
// Bestehende Bezeichnungen nicht umbenennen, ohne die Projekte anzupassen.
export const LEISTUNGEN = [
  { gruppe: 'Leitung und Vertretung', items: [['Gesamtdienstleistung', 'Full service'], ['Gesamtprojektleitung', 'Overall project management'], ['Projektleitung', 'Project management'], ['Bauherrenvertretung', 'Owner’s representation'], ['Baumanagement', 'Construction management'], ['Bauleitung', 'Site management']] },
  { gruppe: 'Planung und Bewilligung', items: [['Planung', 'Design'], ['Planungskoordination', 'Design coordination'], ['Fachplaner-Koordination', 'Specialist coordination'], ['Baueingabe', 'Permit application'], ['Terminplanung', 'Scheduling']] },
  { gruppe: 'Kosten und Vergabe', items: [['Kostenplanung', 'Cost planning'], ['Kostenkontrolle', 'Cost control'], ['Devisierung', 'Tender documents'], ['Ausschreibung', 'Tendering'], ['Vergaben', 'Contract award'], ['Werkverträge', 'Works contracts']] },
  { gruppe: 'Abschluss und Betrieb', items: [['Abnahme', 'Acceptance'], ['Mängelmanagement', 'Defects management'], ['Schlussabrechnung', 'Final account'], ['Nachbetreuung', 'Aftercare']] },
  { gruppe: 'Beratung und Entwicklung', items: [['Machbarkeitsstudie', 'Feasibility study'], ['Zustandsanalyse', 'Condition survey'], ['Bewertung', 'Valuation'], ['Arealentwicklung', 'Site development'], ['Vermarktung', 'Marketing']] },
];

export const TYPES = {
  neubau: { de: 'Neubau', en: 'New build' },
  umbau: { de: 'Umbau & Erweiterung', en: 'Conversion & extension' },
  sanierung: { de: 'Sanierung & Modernisierung', en: 'Refurbishment & modernisation' },
  arealentwicklung: { de: 'Arealentwicklung', en: 'Site development' },
};

export const T = {
  de: {
    nav: { home: 'Home', leistungen: 'Leistungen', projekte: 'Projekte', wissen: 'Wissen', tools: 'Tools', ueber: 'Über uns', kontakt: 'Kontakt' },
    werte: { h: 'Unsere Werte', lead: 'Was uns wichtig ist und woran Sie uns messen können.', items: [
      ['Wir sind professionell', 'Saubere Planung, klare Abläufe und fundiertes Fachwissen: Wir arbeiten strukturiert, dokumentieren nachvollziehbar und stehen für die Qualität unserer Arbeit ein.'],
      ['Wir sind Partner unserer Kunden', 'Wir vertreten Ihre Interessen gegenüber Planern, Unternehmern und Behörden und begegnen Ihnen auf Augenhöhe. Wir bleiben bewusst überschaubar, damit wir Sie und Ihr Projekt persönlich kennen.'],
      ['Wir bauen, als wäre es unser eigenes Projekt', 'Mit Ihrem Geld, Ihrer Zeit und Ihrer Liegenschaft gehen wir so sorgfältig um wie mit unseren eigenen. Das heisst auch: hinschauen, nachfragen und Verantwortung übernehmen.'],
      ['Wir passen uns an und suchen nach Lösungen', 'Jeder Kunde und jedes Projekt ist anders. Wir richten uns nach Ihren Abläufen und suchen die technisch und wirtschaftlich beste Lösung, statt Probleme weiterzureichen.'],
      ['Wir sind ehrlich und transparent', 'Wir informieren offen über Kosten, Termine und Risiken, auch wenn es unbequem ist. So können Sie rechtzeitig entscheiden.'],
      ['Wir halten, was wir versprechen', 'Verlässlichkeit ist die Basis jeder Zusammenarbeit. Zusagen zu Terminen und Kosten nehmen wir ernst und stehen dafür ein.'],
    ] },
    ueber: { title: 'Über uns: Team und Werte der DH Baumanagement AG', desc: 'Team und Werte der DH Baumanagement AG in Grosswangen: Martin Dahinden, Inhaber und Projektleiter, Manuel Unternährer, Junior Bauleiter, und Pirmin Dahinden, Finanzen und Administration.', h1: 'Über uns', lead: 'Ein kleines Team, das Ihr Projekt persönlich kennt. Bei uns sprechen Sie mit den Menschen, die Ihr Bauvorhaben tatsächlich führen.', teamH: 'Unser Team', teamP: 'Wir bleiben bewusst überschaubar. So wissen wir bei jedem Projekt, worum es geht, und Sie haben einen festen Ansprechpartner.', link: 'Unser Team kennenlernen' },
    skip: 'Zum Inhalt springen', menu: 'Menü',
    home: {
      title: 'Baumanagement Zürich & Zentralschweiz',
      desc: 'Projektleitung, Baumanagement und Bauherrenvertretung für Wohn-, Gewerbe- und Industriebauten in Zürich, der Zentralschweiz und der ganzen Deutschschweiz.',
      h1: 'Ihr persönlicher Gesamtdienstleistungsanbieter',
      lead: 'Wir unterstützen Sie bei der Entwicklung, Realisierung und Modernisierung Ihres Bauvorhabens – und begleiten Sie von Anfang bis Schluss. Ein Ansprechpartner, klare Kosten, verlässliche Termine.',
      cta1: 'Projekt besprechen', cta2: 'Referenzen ansehen',
      facts: [['15+', 'Jahre Erfahrung in Bau und Immobilien'], ['2', 'Schwerpunkte: Wohnbau sowie Gewerbe & Industrie'], ['1', 'Ansprechpartner von der Idee bis zur Übergabe']],
      servicesH: 'Unsere Kompetenz: Gesamtdienstleistung',
      projectsH: 'Ausgewählte Projekte', projectsAll: 'Alle Projekte',
      aboutH: 'Über uns', quote: '«Ihr Projekt ist meine Leidenschaft – Bauen ist meine Passion.»',
      about: 'Martin Dahinden, Projektleiter und Inhaber, hat das Bauen von Grund auf gelernt: Lehre als Zimmermann EFZ ab 2008, Zimmermann bei der Strüby Holzbau AG, Abschluss als dipl. Techniker HF Hochbau 2017 und fünf Jahre als Bau- und Projektleiter bei der Strüby Konzept AG. Von 2020 bis 2025 war er zudem im Mandat als Schätzungsexperte für die Gebäudeversicherung Luzern tätig.',
      claim: '… weil auch bei uns nur durch gutes Zusammenspiel Erfolg erzielt wird …',
      knowH: 'Wissen für Bauherrschaften', knowAll: 'Alle Beiträge',
      toolsH: 'Online-Rechner', toolsLead: 'Erste Zahlen in zwei Minuten – als Grundlage für das Gespräch mit uns.',
    },
    strengths: [
      ['Alles aus einer Hand', 'Sie haben über den ganzen Lebenszyklus Ihrer Liegenschaft einen einzigen Ansprechpartner. Wir koordinieren im Hintergrund Planer, Behörden und Unternehmer – und tragen die Verantwortung für Kosten, Termine und Qualität.'],
      ['Erfahren', 'Wir bieten nur an, was zu unseren Kernkompetenzen gehört. Handwerkliche Herkunft verbunden mit Know-how in Entwicklung, Planung und Realisierung – gestützt auf über 15 Jahre Erfahrung in Bau und Immobilien.'],
      ['Klare Werte', 'Professionell, partnerschaftlich, ehrlich und verlässlich: Wir bauen so, als wäre es unser eigenes Projekt.', '/ueber-uns/#werte'],
    ],
    services: [
      { id: 'beratung', k: 'Zustand, Potenzial und Kostenrahmen klären, bevor geplant wird.', icon: 'beratung', t: 'Beratung & Bewertung', p: 'Bevor Geld in Pläne fliesst, klären wir, was sich lohnt: Zustand, Potenzial und Wert der Liegenschaft sowie ein belastbarer Kostenrahmen.', li: ['Zustandsanalyse und Massnahmenplanung', 'Machbarkeitsstudien und Variantenvergleich', 'Grobkostenschätzung und Investitionsrechnung', 'Technische Due Diligence beim Kauf', 'Liegenschaftsbewertung'] },
      { id: 'entwicklung', k: 'Projektleitung und Baumanagement durch alle SIA-Phasen.', icon: 'realisierung', t: 'Entwicklung & Realisierung', p: 'Wir führen Ihr Projekt als Gesamtprojektleitung oder Baumanagement durch alle SIA-Phasen – beim Einfamilienhaus genauso wie beim Produktionsgebäude oder dem mehrjährigen Arealprojekt.', li: ['Gesamtprojektleitung und Bauherrenvertretung', 'Planungskoordination und Bewilligungsverfahren', 'Kostenplanung, Ausschreibung und Vergabe', 'Bauleitung, Termin- und Qualitätskontrolle', 'Abnahme, Mängelmanagement und Schlussabrechnung'] },
      { id: 'nachbetreuung', k: 'Garantiezeit begleiten und den Wert der Liegenschaft erhalten.', icon: 'nachbetreuung', t: 'Nachbetreuung', p: 'Mit der Schlüsselübergabe hört unsere Arbeit nicht auf. Wir begleiten die Garantiezeit und sorgen dafür, dass der Wert der Liegenschaft erhalten bleibt.', li: ['Garantie- und Mängelmanagement', 'Unterhalts- und Erneuerungsplanung', 'Begleitung von Mieterausbauten', 'Beratung bei Schäden und Versicherungsfällen'] },
      { id: 'vermarktung', k: 'Positionierung, Unterlagen und Übergabe an Käufer oder Mieter.', icon: 'vermarktung', t: 'Vermarktung & Verkauf', p: 'Auf Wunsch übernehmen wir auch die Vermarktung: von der Positionierung über Unterlagen bis zur Übergabe an Käuferschaft oder Mieter.', li: ['Positionierung und Preisfindung', 'Verkaufs- und Vermietungsunterlagen', 'Käufer- und Mieterbetreuung', 'Koordination von Käuferwünschen im Bau'] },
    ],
    segments: {
      h: 'Für wen wir bauen',
      items: [
        ['Gewerbe & Industrie', 'Produktions-, Lager- und Bürogebäude, Umbauten im laufenden Betrieb und Sanierungen mit engen Zeitfenstern. Wir sprechen die Sprache der Betriebe: Verfügbarkeit, Logistik, Sicherheit.', '/projekte/?kategorie=gewerbe', 'gewerbe', 'Produktions-, Lager- und Bürogebäude, auch im laufenden Betrieb.'],
        ['Arealentwicklung', 'Mehrjährige Entwicklungen in Etappen: Bestandsaufnahme, Nutzungsstrategie, Masterplan, Investitionsplanung und Umsetzung – mit einer Hand am Tagesgeschäft und einem Blick auf das Jahr 2035.', '/wissen/arealentwicklung-schritt-fuer-schritt/', 'areal', 'Mehrjährige Entwicklungen in Etappen, vom Bestand zum Masterplan.'],
        ['Wohnbau', 'Ein- und Mehrfamilienhäuser für private Bauherrschaften, Investoren und Genossenschaften – vom Vorprojekt bis zur Übergabe an die Bewohner.', '/projekte/?kategorie=wohnen', 'wohnbau', 'Ein- und Mehrfamilienhäuser für Private, Investoren und Genossenschaften.'],
        ['Umbau & Sanierung', 'Aufstockungen, Modernisierungen und Instandsetzungen: sorgfältige Bestandsaufnahme, realistische Reserven und saubere Abläufe, auch wenn das Gebäude bewohnt oder in Betrieb bleibt.', '/wissen/sanierung-gewerbeliegenschaft-strategie/', 'umbau', 'Aufstockung, Modernisierung und Instandsetzung im Bestand.'],
      ],
    },
    leistungen: { title: 'Leistungen: Baumanagement, Projektleitung, Bauherrenvertretung', desc: 'Beratung & Bewertung, Entwicklung & Realisierung, Nachbetreuung, Vermarktung & Verkauf: die Gesamtdienstleistung der DH Baumanagement AG für Wohn-, Gewerbe- und Industriebauten.', h1: 'Unsere Kompetenz: Gesamtdienstleistung', lead: 'Wir unterstützen Sie in allen Bereichen der Immobilienentwicklung – engagiert, kompetent, persönlich, unabhängig und zuverlässig.', whatH: 'Was die DH Baumanagement AG ausmacht' },
    projekte: { title: 'Projekte & Referenzen', desc: 'Referenzprojekte der DH Baumanagement AG: Ein- und Mehrfamilienhäuser, Industrie- und Gewerbebauten, Sanierungen und Arealentwicklungen in der Zentralschweiz und darüber hinaus.', h1: 'Projekte & Referenzen', lead: 'Unsere Referenzen auf der Karte, mit Suche und Filtern nach Kategorie, Projektart, Kanton und Jahr – als Kacheln oder als Tabelle.', all: 'Alle', grid: 'Kacheln', table: 'Tabelle', th: ['Projekt', 'Kategorie', 'Art', 'Ort', 'Zeitraum', 'Leistungen'], ongoing: 'laufend', facts: { cat: 'Kategorie', type: 'Projektart', loc: 'Standort', time: 'Zeitraum', serv: 'Unsere Leistungen', client: 'Bauherrschaft', doc: 'Projektdokumentation (PDF)' }, auto: (p) => `${p.typ} in ${p.ort}${p.kanton ? ' (' + p.kanton + ')' : ''}, ${p.zeit}. Die DH Baumanagement AG verantwortete bei diesem Projekt: ${p.leist}.`, more: 'Weitere Projekte', back: 'Alle Projekte' },
    wissen: { title: 'Wissen: Baumanagement, Projektleitung, Gewerbebau, Arealentwicklung', desc: 'Praxiswissen für Bauherrschaften: Baukosten, SIA-Phasen, Vergabemodelle, Gewerbe- und Industriebau, Arealentwicklung, Sanierung, Abnahme und Mängel.', h1: 'Wissen für Bauherrschaften', lead: 'Praxisnahe Beiträge zu Projektleitung, Baumanagement, Kosten, Terminen und Verträgen – für kleine, mittlere und grosse Bauvorhaben.', min: 'Min. Lesezeit', brief: 'Kurz gesagt', faq: 'Häufige Fragen', related: 'Weiterlesen', updated: 'Aktualisiert', by: 'Fachliche Verantwortung: Martin Dahinden, dipl. Techniker HF Hochbau, DH Baumanagement AG', disclaimer: 'Dieser Beitrag dient der allgemeinen Information und ersetzt keine Beratung im Einzelfall. Normen, Gesetze und Richtwerte können sich ändern.' },
    tools: { title: 'Online-Rechner für Bauherrschaften', desc: 'Kostenlose Rechner: Baukosten grob schätzen, Potenzial eines Areals berechnen, Projektdauer planen. Richtwerte für die Schweiz.', h1: 'Online-Rechner', lead: 'Drei Werkzeuge für die erste Einschätzung. Die Resultate sind Richtwerte – für eine belastbare Aussage prüfen wir Ihr Vorhaben gerne persönlich.', open: 'Rechner öffnen', discuss: 'Resultat unverbindlich besprechen', note: 'Richtwerte ohne Gewähr. Massgebend sind Standort, Baugrund, Ausbaustandard, Marktlage und Vorschriften im Einzelfall.' },
    kontakt: { title: 'Kontakt', desc: 'Treten Sie mit der DH Baumanagement AG in Kontakt: Dorfstrasse 3, 6022 Grosswangen, Telefon 041 982 01 45. Antwort innerhalb von 24 Stunden.', h1: 'Kontaktieren Sie uns!', lead: 'Schildern Sie uns kurz Ihr Vorhaben. Wir melden uns innerhalb von 24 Stunden bei Ihnen.', f: { name: 'Name', firma: 'Firma (optional)', email: 'E-Mail', tel: 'Telefon', art: 'Art des Vorhabens', arts: ['Neubau Gewerbe / Industrie', 'Umbau / Sanierung Gewerbe', 'Arealentwicklung', 'Neubau Wohnen', 'Umbau / Sanierung Wohnen', 'Beratung / Bewertung', 'Anderes'], msg: 'Ihre Nachricht', send: 'Anfrage senden', privacy: 'Mit dem Absenden stimmen Sie der Bearbeitung Ihrer Angaben zur Beantwortung der Anfrage zu.' }, findH: 'Hier finden Sie uns', thanksH: 'Vielen Dank für Ihre Nachricht!', thanks: 'Wir melden uns innerhalb von 24 Stunden bei Ihnen.' },
    profil: { h: 'Unternehmensdokumentation herunterladen', p: 'Unser Profil mit Leistungen und Ansprechpartner als PDF – wahlweise mit tabellarischer Referenzliste oder als Portfolio mit allen Projekten und Bildern.', b: 'Unternehmensprofil (PDF)', b1: 'Mit Referenzliste (PDF)', b2: 'Portfolio mit Bildern (PDF)', vol: 'Bauvolumen' },
    cta: { h: 'Haben Sie ein Bauvorhaben?', p: 'Ein erstes Gespräch kostet nichts und klärt oft schon die wichtigsten Fragen zu Kosten, Terminen und Vorgehen.', b: 'Kontakt aufnehmen' },
    footer: { legal: 'Impressum & Datenschutz', rights: 'Alle Rechte vorbehalten.' },
    legal: { title: 'Impressum & Datenschutz', h1: 'Impressum & Datenschutz' },
    nf: { h: 'Seite nicht gefunden', p: 'Die gewünschte Seite existiert nicht (mehr).', b: 'Zur Startseite' },
    crumbHome: 'Home',
  },
  en: {
    nav: { home: 'Home', leistungen: 'Services', projekte: 'Projects', wissen: 'Insights', tools: 'Tools', ueber: 'About', kontakt: 'Contact' },
    werte: { h: 'Our values', lead: 'What matters to us and what you can measure us by.', items: [
      ['We are professional', 'Careful planning, clear processes and sound expertise: we work in a structured way, document transparently and stand behind the quality of our work.'],
      ['We are a partner to our clients', 'We represent your interests towards designers, contractors and authorities and meet you as equals. We deliberately stay a manageable size so that we know you and your project personally.'],
      ['We build as if the project were our own', 'We treat your money, your time and your property as carefully as our own. That also means looking closely, asking questions and taking responsibility.'],
      ['We adapt and look for solutions', 'Every client and every project is different. We work around your processes and look for the best technical and economic solution instead of passing problems on.'],
      ['We are honest and transparent', 'We report openly on cost, schedule and risk, even when it is uncomfortable. That allows you to decide in good time.'],
      ['We keep our promises', 'Reliability is the basis of any collaboration. We take commitments on schedule and cost seriously and stand by them.'],
    ] },
    ueber: { title: 'About us: team and values of DH Baumanagement AG', desc: 'Team and values of DH Baumanagement AG in Grosswangen: Martin Dahinden, owner and project manager, Manuel Unternährer, junior site manager, and Pirmin Dahinden, finance and administration.', h1: 'About us', lead: 'A small team that knows your project personally. With us you talk to the people who actually run your construction project.', teamH: 'Our team', teamP: 'We deliberately stay a manageable size. That way we know what every project is about, and you have one fixed contact.', link: 'Meet our team' },
    skip: 'Skip to content', menu: 'Menu',
    home: {
      title: 'Construction management Zurich & Lucerne',
      desc: 'DH Baumanagement AG, Grosswangen (Lucerne): project management, construction management and owner’s representation for residential, commercial and industrial buildings and long-term site developments.',
      h1: 'Your personal full-service provider',
      lead: 'We support you in developing, building and modernising your property – from the first idea to handover. One point of contact, transparent costs, reliable schedules.',
      cta1: 'Discuss your project', cta2: 'View references',
      facts: [['15+', 'years of experience in construction and real estate'], ['2', 'focus areas: residential and commercial & industrial'], ['1', 'point of contact from idea to handover']],
      servicesH: 'Our expertise: full-service delivery',
      projectsH: 'Selected projects', projectsAll: 'All projects',
      aboutH: 'About us', quote: '“Your project is my passion – building is my calling.”',
      about: 'Martin Dahinden, project manager and owner, learned construction from the ground up: carpentry apprenticeship from 2008, carpenter at Strüby Holzbau AG, federal diploma as building technician (dipl. Techniker HF Hochbau) in 2017 and five years as site and project manager at Strüby Konzept AG. From 2020 to 2025 he also served as a mandated valuation expert for the building insurance of the Canton of Lucerne.',
      claim: '… because here, too, success only comes from great teamwork …',
      knowH: 'Insights for building owners', knowAll: 'All articles',
      toolsH: 'Online calculators', toolsLead: 'First figures in two minutes – a starting point for your conversation with us.',
    },
    strengths: [
      ['Everything from a single source', 'You have one point of contact across the entire life cycle of your property. We coordinate designers, authorities and contractors in the background – and take responsibility for cost, schedule and quality.'],
      ['Experienced', 'We only offer what belongs to our core competencies: a background in the trades combined with know-how in development, design and delivery – built on more than 15 years in construction and real estate.'],
      ['Clear values', 'Professional, collaborative, honest and reliable: we build as if the project were our own.', '/ueber-uns/#werte'],
    ],
    services: [
      { id: 'beratung', k: 'Clarify condition, potential and budget before design starts.', icon: 'beratung', t: 'Consulting & valuation', p: 'Before money goes into drawings, we clarify what is worth doing: condition, potential and value of the property, and a robust cost framework.', li: ['Condition surveys and action planning', 'Feasibility studies and option appraisal', 'Rough cost estimates and investment appraisal', 'Technical due diligence for acquisitions', 'Property valuation'] },
      { id: 'entwicklung', k: 'Project and construction management through all SIA phases.', icon: 'realisierung', t: 'Development & delivery', p: 'We lead your project as overall project manager or construction manager through all SIA phases – for a family home as much as for a production building or a multi-year site programme.', li: ['Overall project management and owner’s representation', 'Design coordination and permitting', 'Cost planning, tendering and award', 'Site management, schedule and quality control', 'Acceptance, defects management and final account'] },
      { id: 'nachbetreuung', k: 'Manage the warranty period and preserve the property’s value.', icon: 'nachbetreuung', t: 'Aftercare', p: 'Our work does not end with the handover of keys. We manage the warranty period and help preserve the value of your property.', li: ['Warranty and defects management', 'Maintenance and renewal planning', 'Support for tenant fit-outs', 'Advice on damage and insurance claims'] },
      { id: 'vermarktung', k: 'Positioning, documentation and handover to buyers or tenants.', icon: 'vermarktung', t: 'Marketing & sales', p: 'On request we also handle marketing: from positioning and documentation to handover to buyers or tenants.', li: ['Positioning and pricing', 'Sales and letting documentation', 'Buyer and tenant support', 'Coordination of buyer options during construction'] },
    ],
    segments: {
      h: 'Who we build for',
      items: [
        ['Commercial & industrial', 'Production, storage and office buildings, conversions during live operations and refurbishments within tight shutdown windows. We speak the language of operations: availability, logistics, safety.', '/projekte/?kategorie=gewerbe', 'gewerbe', 'Production, storage and office buildings, also during operations.'],
        ['Site development', 'Multi-year, phased developments: survey of existing assets, use strategy, master plan, investment planning and delivery – with one hand on day-to-day business and one eye on 2035.', '/wissen/site-development-step-by-step/', 'areal', 'Multi-year phased developments, from existing site to master plan.'],
        ['Residential', 'Single- and multi-family homes for private owners, investors and cooperatives – from concept design to handover to the residents.', '/projekte/?kategorie=wohnen', 'wohnbau', 'Single- and multi-family homes for owners, investors and cooperatives.'],
        ['Conversion & refurbishment', 'Additional storeys, modernisations and repairs: careful surveys, realistic contingencies and clean sequencing, even while the building stays occupied or in operation.', '/wissen/refurbishing-commercial-property-strategy/', 'umbau', 'Extra storeys, modernisation and repairs to existing buildings.'],
      ],
    },
    leistungen: { title: 'Services: construction management, project management, owner’s representation', desc: 'Consulting & valuation, development & delivery, aftercare, marketing & sales: the full-service offering of DH Baumanagement AG for residential, commercial and industrial buildings.', h1: 'Our expertise: full-service delivery', lead: 'We support you in every area of property development – committed, competent, personal, independent and reliable.', whatH: 'What defines DH Baumanagement AG' },
    projekte: { title: 'Projects & references', desc: 'Reference projects by DH Baumanagement AG: single- and multi-family homes, industrial and commercial buildings, refurbishments and site developments in Central Switzerland and beyond.', h1: 'Projects & references', lead: 'Our references on the map, with search and filters by category, project type, canton and year – as cards or as a table.', all: 'All', grid: 'Cards', table: 'Table', th: ['Project', 'Category', 'Type', 'Location', 'Period', 'Services'], ongoing: 'ongoing', facts: { cat: 'Category', type: 'Project type', loc: 'Location', time: 'Period', serv: 'Our services', client: 'Client', doc: 'Project documentation (PDF, German)' }, auto: (p) => `${p.typ} in ${p.ort}${p.kanton ? ' (' + p.kanton + ')' : ''}, Switzerland, ${p.zeit}. DH Baumanagement AG was responsible for: ${p.leist}.`, more: 'More projects', back: 'All projects' },
    wissen: { title: 'Insights: construction management, commercial building, site development', desc: 'Practical knowledge for building owners in Switzerland: construction costs, SIA phases, procurement models, commercial and industrial building, site development, refurbishment, acceptance and defects.', h1: 'Insights for building owners', lead: 'Practical articles on project management, construction management, costs, schedules and contracts in Switzerland – for small, medium-sized and large projects.', min: 'min read', brief: 'In brief', faq: 'Frequently asked questions', related: 'Read on', updated: 'Updated', by: 'Technical responsibility: Martin Dahinden, dipl. Techniker HF Hochbau, DH Baumanagement AG', disclaimer: 'This article provides general information and does not replace advice on your specific case. Standards, laws and benchmark figures may change.' },
    tools: { title: 'Online calculators for building owners', desc: 'Free calculators: rough construction cost estimate, site potential, project duration. Benchmark values for Switzerland.', h1: 'Online calculators', lead: 'Three tools for a first assessment. The results are benchmarks – for a robust statement we will gladly review your project in person.', open: 'Open calculator', discuss: 'Discuss the result with us', note: 'Benchmark values without guarantee. Location, ground conditions, fit-out standard, market situation and regulations in the individual case are decisive.' },
    kontakt: { title: 'Contact', desc: 'Get in touch with DH Baumanagement AG: Dorfstrasse 3, 6022 Grosswangen, Switzerland, phone +41 41 982 01 45. Reply within 24 hours.', h1: 'Get in touch!', lead: 'Tell us briefly about your project. We will get back to you within 24 hours.', f: { name: 'Name', firma: 'Company (optional)', email: 'Email', tel: 'Phone', art: 'Type of project', arts: ['New commercial / industrial building', 'Conversion / refurbishment, commercial', 'Site development', 'New residential building', 'Conversion / refurbishment, residential', 'Consulting / valuation', 'Other'], msg: 'Your message', send: 'Send enquiry', privacy: 'By submitting you agree that we process your details to answer your enquiry.' }, findH: 'Where to find us', thanksH: 'Thank you for your message!', thanks: 'We will get back to you within 24 hours.' },
    profil: { h: 'Download our company documentation', p: 'Our profile with services and contact person as a PDF – either with a tabular reference list or as a portfolio with all projects and images.', b: 'Company profile (PDF)', b1: 'With reference list (PDF)', b2: 'Portfolio with images (PDF)', vol: 'Construction volume' },
    cta: { h: 'Planning a construction project?', p: 'A first conversation costs nothing and often answers the key questions on cost, schedule and approach.', b: 'Get in touch' },
    footer: { legal: 'Legal notice & privacy', rights: 'All rights reserved.' },
    legal: { title: 'Legal notice & privacy', h1: 'Legal notice & privacy' },
    nf: { h: 'Page not found', p: 'The page you are looking for does not exist (any more).', b: 'Back to home' },
    crumbHome: 'Home',
  },
};
