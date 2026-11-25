# Website DH Baumanagement AG

Zweisprachige (DE/EN), statische Website mit Projektdatenbank, 20 Wissensbeiträgen je Sprache und drei Online-Rechnern. Veröffentlichung über GitHub und Netlify.

## Erstinbetriebnahme (einmalig, ca. 30 Minuten)

1. **GitHub:** neues privates Repository anlegen (z. B. `dh-baumanagement-website`) und den Inhalt dieses Ordners hochladen bzw. pushen.
2. **Netlify:** «Add new site → Import an existing project» → Repository wählen. Build-Befehl (`npm run build`) und Ordner (`dist`) werden aus `netlify.toml` gelesen.
3. **Bilder übernehmen:** lokal `npm install` und `npm run bilder` ausführen. Das Skript lädt Logo, Titelbild, Porträt und alle Projektbilder von der bisherigen Wix-Seite nach `src/images/` und stellt die Projektliste auf lokale Bilder um. Danach committen und pushen. (Bis dahin werden die Bilder direkt von Wix geladen – das funktioniert nur, solange die Wix-Seite besteht.)
4. **Formular:** In Netlify unter «Forms» die Formularerkennung aktivieren und eine E-Mail-Benachrichtigung an info@dh-baumanagement.ch einrichten.
5. **Prüfen** auf der Netlify-Vorschauadresse: Texte, Projektzuordnung, Farben, Rechner-Richtwerte, Datenschutztext.
6. **Domain umstellen:** `www.dh-baumanagement.ch` in Netlify als Domain hinzufügen und die DNS-Einträge beim Domainanbieter anpassen. **Die MX-Einträge für E-Mail (Exchange Online) dabei unverändert lassen.** Erst danach das Wix-Abo kündigen.
7. **Google Search Console:** Domain bestätigen und `https://www.dh-baumanagement.ch/sitemap.xml` einreichen. Dasselbe bei Bing Webmaster Tools.

## Tägliche Arbeit

- **Neues Projekt:** Zeile in `data/projekte.csv` ergänzen (in Excel öffnen, als «CSV UTF-8» speichern, oder direkt auf GitHub bearbeiten) und Bilder in `src/images/projekte/<slug>/` legen. Details in `CLAUDE.md`.
- **Per Chat:** Claude mit Zugriff auf das Repository die Projektangaben und Bilder geben – der Ablauf ist in `CLAUDE.md` beschrieben.
- **Lokal ansehen:** `npm install`, dann `npm run dev` und http://localhost:8080 öffnen.

## Vor dem Livegang zu prüfen

- [ ] Akzentfarbe und Schrift in `src/assets/css/style.css` (`:root`) an das Logo angleichen.
- [ ] Zuordnung der älteren Referenzen zu Kategorie und Projektart in `data/projekte.csv` (einzelne wurden geschätzt, z. B. Büttenenstrasse, Sternenplatz, Betonsanierung; bei «Umbau EFH Erlenbach» fehlt der Kanton).
- [ ] Projektbeschreibungen und Kennzahlen ergänzen (heute automatisch erzeugte Kurztexte).
- [ ] PDF-Dokumentationen der älteren Referenzen in `src/static/dokumente/` ablegen und in der Spalte `dokument` verlinken.
- [ ] Richtwerte der Rechner in `src/tools.mjs` mit eigenen abgerechneten Projekten kalibrieren.
- [ ] Wissensbeiträge fachlich gegenlesen (Martin Dahinden ist als fachlich Verantwortlicher genannt).
- [ ] Datenschutztext in `content/seiten/` ersetzen.

## Aufbau

Siehe Tabelle «Wo liegt was?» in `CLAUDE.md`. Die Strategie für mehr Besucher steht in `docs/Traffic-Strategie.md`.
