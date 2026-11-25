# Arbeitsanweisung für Claude (und Menschen): Website DH Baumanagement AG

Statische, zweisprachige Website (DE unter `/`, EN unter `/en/`). Kein CMS, keine Datenbank.
`npm run build` erzeugt aus Daten und Texten den Ordner `dist/`. Netlify baut und veröffentlicht automatisch bei jedem Push auf den Branch `main`.

## Veröffentlichen sparsam (Netlify-Credits)

Das Netlify-Konto läuft im Free-Plan mit 300 Credits pro Monat; jeder Produktions-Deploy (Push auf `main`) kostet 15 Credits, also höchstens rund 20 pro Monat für alle Projekte des Kontos zusammen.

- Laufende Arbeit auf dem Branch `entwurf` committen und pushen. Das löst keinen Produktions-Deploy aus.
- Vorschau bei Bedarf über einen Pull Request `entwurf` → `main` (Deploy Preview, kostenlos).
- Erst nach Freigabe durch den Benutzer `entwurf` in `main` mergen: ein Deploy pro Arbeitspaket, nicht pro Änderung.
- Wenn ein Push auf `main` die Bild-Action auslöst (Einträge `wix:` oder `https://` in der CSV), die eigene Commit-Nachricht mit `[skip netlify]` versehen; der Commit der Action löst dann den einzigen Deploy aus.

## Wo liegt was?

| Inhalt | Datei |
|---|---|
| **Projekte / Referenzen** | `data/projekte.csv` (eine Zeile pro Projekt, Trennzeichen `;`) |
| Projektbilder | `src/images/projekte/<slug>/01.jpg, 02.jpg, …` |
| Kategorien und Projektarten | `src/texts.mjs` (`CATS`, `TYPES`) |
| Team (Seite «Über uns», Unternehmensprofil) | `src/texts.mjs` (`TEAM`: Name, Funktion DE/EN, optional `bild`). Fotos unter `src/images/team/`; ohne Foto erscheinen die Initialen. Nur vom Benutzer genannte Angaben |
| Vordefinierte Dienstleistungen für Referenzen | `src/texts.mjs` (`LEISTUNGEN`, je Gruppe Paare Deutsch/Englisch). Im Admin-Bereich als Häkchen-Auswahl; Englisch wird automatisch zugeordnet. In CSV und JSON nur diese Bezeichnungen verwenden – der Build meldet Abweichungen als Hinweis |
| Firmenangaben, Seitentexte DE/EN | `src/texts.mjs` |
| Wissensbeiträge | `content/wissen/de/NN-slug.md` und `content/wissen/en/NN-slug.md` |
| Online-Rechner (Richtwerte, Texte) | `src/tools.mjs`, Logik in `src/assets/js/tools.js` |
| Unternehmensprofil (PDF, DE/EN, je zwei Varianten: mit Referenzliste / Portfolio mit Bildern) | `src/profil.mjs` – wird bei jedem Build aus Texten und Projektliste neu erzeugt (`/downloads/…`) |
| Referenzblatt pro Projekt (PDF, DE/EN) | `src/referenzblatt.mjs` – wird bei jedem Build für jedes Projekt erzeugt (`/downloads/referenzen/Referenz_<slug>.pdf`), Knopf auf der Projektseite. Gleicher Aufbau für alle: Titelbild, Beschrieb, Leistungen, Kennzahlen, Eckdaten, Kontakt, Seite 2 mit bis zu sechs weiteren Bildern |
| Regionenseiten (Zürich, Zentralschweiz, Aargau, Bern) | `src/regionen.mjs` – Text je Region; Referenzen werden über die Spalte `kanton` der CSV automatisch zugeordnet. Neue Region nur mit echten Referenzen |
| Titelbild Startseite | `SITE.heroProjekt` in `src/texts.mjs` (Foto eines eigenen Projekts) |
| Impressum & Datenschutz | `content/seiten/` |
| Design (Farben, Schrift) | `src/assets/css/style.css`, Block `:root`. CI: Blau `#0e2f47`, Gold `#e7c984`, Schrift Avenir (Lauftext Book, Titel Black) |
| Logo (Variante A-1), Bildmarke, Wasserzeichen | `src/images/logo-quer-hell.svg` (Header, weiss), `logo-quer.svg` (für blaue Flächen), `logo.png` (PDFs), `logo-mark.png`, `wasserzeichen.png`, `hintergrund-navy.jpg`. Kleinformat-Zeichen A-2 in den Favicons |
| Infografiken Leistungen / Marktsegmente | `src/images/grafiken/*-de|en.svg` (Website) und `.png` (Unternehmensprofil); Text ist in Pfade umgewandelt, Änderungen über das CI-Paket neu erzeugen |
| Kategorie-Illustrationen (11 Stück) | `src/assets/illus/*.svg` (Original: Gold auf Blau). Die Website zeigt die helle Variante (blaues Objekt, Goldakzent, hellgraue Kachel), umgefärbt in `build.mjs` (`hell()`); PNG für das Unternehmensprofil in `src/images/illus-hell/`. Die Übersichts-Infografiken werden auf der Website nicht mehr verwendet (keine doppelte Darstellung). – Zuordnung über das Feld `icon` in `src/texts.mjs` und `src/tools.mjs`; neue Kategorie = neue Illustration im selben Stil |
| Linien-Icons (10 Stück, SVG, einfärbbar) | `src/assets/icons/*.svg` – Zuordnung über das Feld `icon` in `src/texts.mjs` und `src/tools.mjs` |
| Favicons, App-Icons, Social-Bild | `src/static/` (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192/512.png`, `og-image.jpg`) |
| Weiterleitungen, Sitemap, robots, llms.txt | werden in `build.mjs` erzeugt |

## Admin-Bereich für Referenzen (`/admin/`)

Der Benutzer kann Referenzen selbst erfassen: `https://<domain>/admin/` (Liste, Eingabemaske, Foto-Upload, Karte zum Setzen des Standorts). Die Seite ist statisch (`src/admin/`), nicht verlinkt, für Suchmaschinen gesperrt und speichert über die GitHub-API mit einem persönlichen Fine-grained Token (nur dieses Repository, Contents: Read and write), der im Browser des Benutzers bleibt.

- Jedes gespeicherte Projekt ist eine Datei `data/projekte/<slug>.json` mit denselben Feldnamen wie die CSV-Spalten (Listen als Arrays, dazu `lat`, `lng`, `versteckt`, `erfasst`). Fotos landen verkleinert in `src/images/projekte/<slug>/NN.jpg`.
- Der Build führt CSV und JSON zusammen: Eine JSON-Datei überschreibt die CSV-Zeile mit demselben Slug; neue JSON-Projekte erscheinen zuoberst. `versteckt: true` blendet ein Projekt aus.
- Ein Speichern mit Haken «Sofort veröffentlichen» ist ein Commit auf `main` und damit ein Netlify-Deploy; ohne Haken trägt der Commit `[skip netlify]`.
- Englische Felder dürfen leer bleiben (dann erscheint der deutsche Text). Auf Wunsch übersetzt Claude nachträglich direkt in der JSON-Datei.
- Karte der Referenzseite und des Admin-Bereichs: `src/karte.mjs` (Umriss, Kantonsgrenzen, Seen; keine externen Kartendienste). Pins entstehen aus `lat`/`lng`.

## Neues Projekt hinzufügen (Standardablauf)

Der Benutzer liefert im Chat: Titel, Ort, Zeitraum, Leistungen, Kategorie, evtl. Beschreibung, Kennzahlen und Bilder.

1. **Slug bilden:** Kleinbuchstaben, ohne Umlaute, mit Bindestrichen, z. B. `neubau-lagerhalle-sursee`. Er wird zur URL `/projekte/<slug>/` und darf später nicht mehr geändert werden.
2. **Zeile in `data/projekte.csv` einfügen** (oben = erscheint zuerst). Spalten:
   - `slug` (Pflicht)
   - `titel_de`, `titel_en` (EN selbst übersetzen)
   - `kategorie`: `wohnen` oder `gewerbe` (Schlüssel aus `CATS`)
   - `projektart`: `neubau`, `umbau`, `sanierung` oder `arealentwicklung` (Schlüssel aus `TYPES`)
   - `ort`, `kanton` (Kürzel, z. B. LU)
   - `jahr_von`, `jahr_bis` (bei laufenden Projekten das geplante Endjahr)
   - `bauvolumen_mchf` (letzte Spalte, optional): Bauvolumen in Mio. CHF als Zahl, z. B. `4.2`; erscheint als «4.2 MCHF» auf Karte, Projektseite, Referenzliste und im Portfolio. Nur vom Benutzer genannte Werte.
   - `leistungen_de`: Bezeichnungen aus der Liste `LEISTUNGEN`, mehrere mit `|` trennen; `leistungen_en` kann leer bleiben (wird zugeordnet)
   - `bauherr` (optional; nur mit Einverständnis der Bauherrschaft nennen)
   - `beschreibung_de`, `beschreibung_en` (optional; leer = automatisch erzeugter Kurztext). Absätze mit `\n\n` trennen. Enthält der Text einen Strichpunkt, das Feld in "Anführungszeichen" setzen.
   - `kennzahlen_de`, `kennzahlen_en` (optional, mit `|` getrennt, z. B. `Bausumme CHF 4.2 Mio.|Geschossfläche 2'400 m²`)
   - `bilder`: leer lassen, wenn die Bilder im Projektordner liegen (empfohlen). Sonst Dateinamen oder URLs mit `|` getrennt.
   - `dokument` (optional, Link zu einem PDF), `featured` (`ja` = erscheint auf der Startseite, maximal 6)
3. **Bilder ablegen** unter `src/images/projekte/<slug>/`, benannt `01.jpg`, `02.jpg` … (das erste ist das Titelbild). Vorher auf maximal 2400 px Breite verkleinern, JPG-Qualität ca. 82. Keine Personen oder Autokennzeichen ohne Einwilligung.
4. **Prüfen:** `npm run build` muss ohne Fehler durchlaufen. Der Build bricht mit klarer Meldung ab, wenn Kategorie oder Projektart unbekannt sind.
5. **Veröffentlichen:** auf `entwurf` committen; nach Freigabe in `main` mergen und pushen (`Projekt hinzugefügt: <Titel>`), siehe «Veröffentlichen sparsam». Netlify deployt in ein bis zwei Minuten.
6. **Rückmeldung** an den Benutzer mit der URL des neuen Projekts (DE und EN).

Keine Fakten erfinden: Bausumme, Flächen, Bauherrschaft und Beschreibung nur aus den Angaben des Benutzers übernehmen. Fehlt etwas, das Feld leer lassen oder nachfragen.

## Neue Kategorie oder Projektart

In `src/texts.mjs` bei `CATS` bzw. `TYPES` einen Eintrag mit deutschem und englischem Namen ergänzen. Danach kann der Schlüssel in der CSV verwendet werden; Filter und Navigation entstehen automatisch.

## Neuer Wissensbeitrag

Je eine Datei in `content/wissen/de/` und `content/wissen/en/` mit derselben `id` im Kopfbereich (damit die Sprachversionen verknüpft werden). Pflichtfelder: `id`, `title`, `description` (max. ca. 155 Zeichen), `category`, `summary` (2–3 Sätze, beantwortet die Kernfrage direkt), `date`. Optional: `faq` (Liste mit `q` und `a`), `tool` (`kosten`, `areal` oder `dauer`), `featured: true`. Der Dateiname ohne Nummer wird zur URL.

Schreibregeln: Schweizer Rechtschreibung (kein ß), konkrete Zahlen mit Einordnung, Normen und Gesetze nur nennen, wenn sie geprüft sind; Beitrag mit einer direkten Antwort beginnen, mindestens eine Tabelle oder Liste, drei FAQ.

## Bilder von der alten Wix-Seite

Steht in `data/projekte.csv` in der Spalte `bilder` ein Eintrag `wix:…` oder in `dokument` eine `https://`-Adresse, lädt die GitHub-Action «Bilder importieren» (`.github/workflows/`) die Dateien bei jedem Push der CSV ins Repository und stellt die Zeile auf lokale Dateien um. Von Hand: `npm run bilder`.

## Satz und Umbrüche (verbindlich)

- Wörter werden nie mitten im Wort umbrochen. In PDF-Tabellen richtet sich jede Spaltenbreite nach dem längsten Wort der Spalte (`src/profil.mjs`, `minW`); feste Spaltenbreiten sind nicht erlaubt.
- «&» steht nie allein am Zeilenende oder auf einer eigenen Zeile (geschütztes Leerzeichen nach «&»).
- Blöcke bleiben zusammen: Eine Kategorie der Referenzliste, ein Leistungsblock oder eine Projektkarte wird nicht über einen Seitenumbruch getrennt; keine einzelnen Zeilen allein auf einer neuen Seite.
- Nach jeder Änderung an PDF-Layouts beide Sprachen und beide Varianten rendern (`pdftoppm`) und ansehen, bevor veröffentlicht wird.

## Sicherheit

- Sicherheits-Header stehen in `netlify.toml` (Content-Security-Policy, HSTS, Permissions-Policy, nosniff, Frame-Schutz). Die CSP erlaubt nur eigene Skripte; `api.github.com` ist einzig für den Admin-Bereich freigegeben. Neue externe Quellen nur nach Rücksprache und mit CSP-Anpassung.
- Keine Inline-Skripte und keine Inline-Event-Handler (`onclick=`, `onsubmit=` …) im HTML; die CSP blockiert sie. Ereignisse immer in den JS-Dateien binden.
- Formulare: Honeypot-Feld `website`, Sicherheitsfrage, Mindestzeit und Feldprüfung in `src/assets/js/main.js`. Diese Prüfungen laufen im Browser; den serverseitigen Spamfilter stellt Netlify Forms.
- Das Repository ist öffentlich: keine Zugangsdaten, Tokens oder vertraulichen Projektangaben committen. Ausgeblendete Projekte (`versteckt`) erscheinen nicht auf der Website, sind im Repository aber einsehbar.
- Nach Änderungen an Skripten oder Headern die Seite mit gesetzter CSP testen (Rechner inkl. PDF, Kontaktformular, Admin-Bereich).

## Rechner und Formulare

- Kennwerte (CHF/m², CHF/m³, Faktoren, Zuschläge, Phasendauern) stehen in `src/tools.mjs` unter `CONFIG`.
- Das Resultat-PDF entsteht im Browser (jsPDF, lokal ausgeliefert unter `/assets/vendor/`). Liegt `src/images/logo.png` vor, erscheint das Logo im PDF, sonst der Schriftzug.
- Netlify-Formulare: `kontakt` (Kontaktseite) und `rechner-anfrage` (Rechner, mit PDF-Anhang im Feld `resultat`). Für beide in Netlify eine E-Mail-Benachrichtigung einrichten.

## Nicht tun

- `dist/` und `node_modules/` nicht committen.
- Slugs bestehender Projekte und Beiträge nicht ändern (sonst Weiterleitung in `build.mjs` unter `_redirects` ergänzen).
- Keine externen Skripte, Schriften oder Tracker ohne Rücksprache einbauen (Datenschutz, Ladezeit).
