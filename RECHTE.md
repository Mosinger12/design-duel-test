# RECHTE.md – Checkliste vor jeder Veröffentlichung

Vor **jeder** Veröffentlichung (Web-Test, TestFlight, Store-Update) vollständig abhaken.
Datum, Version und Name eintragen. Ein offenes Kästchen = nicht veröffentlichen.

Veröffentlichung: ______________________  Datum: ____________  Geprüft von: ______________

## 1. Automatische Prüfungen (müssen alle grün sein)
- [ ] `npx jest` – alle Tests grün (enthält Register-, Sperrlisten-, Fairness-, Sponsoring-, i18n-, Netzwerk-Tests)
- [ ] `npm run license-check` – ohne Fehler: alle Pakete, die in der App landen (Web + iOS) und alle direkten App-Abhängigkeiten haben MIT / Apache-2.0 / BSD-2-Clause / BSD-3-Clause / ISC / 0BSD (Entscheidung A, PROJEKT.md E-04)
- [ ] `npm run license-report` angesehen: Sind neue Werkzeuge mit ungewöhnlicher Lizenz dazugekommen? (nur Info)
- [ ] `npx expo export --platform web` – baut ohne Fehler

## 2. Ausdruck nicht kopieren (Mechanik übernehmen ist erlaubt)
- [ ] Keine Vorlagen, Texte, Screenshots, Grafiken, Layouts oder Sounds anderer Spiele verwendet – insbesondere nicht von „Aesthetic“, „Cover Club“, „Food Stylist“, „MasterChef“.
- [ ] Alle Auftrags-, Teile- und Bewertungstexte sind selbst geschrieben (keine Übersetzung fremder Texte).
- [ ] Spielname, App-Icon und Store-Texte ähneln keinem bestehenden Spiel oder Logo (Icon-Entwurf mit überlappenden Kreisen wurde deshalb verworfen, siehe PROJEKT.md E-12).
- [ ] Store-Screenshots zeigen nur unsere eigene App.

## 3. Marken, Personen, Symbole
- [ ] Keine Marken, Markenprodukte oder Logos (auch keine Lebensmittelmarken, Mode- oder Tattoo-Studio-Marken).
- [ ] Keine Promis, realen Personen, Künstlernamen oder „im Stil von <Name>“.
- [ ] Sponsoren in Testdaten sind erkennbar fiktiv („Demo Partner (fictional)“).
- [ ] Tattoo: neue Motive gegen `themes/tattoo/blocked-symbols.json` geprüft (Test) **und** zusätzlich von Hand angesehen – auch Kombinationen (Motiv + Farbe + Rahmen) dürfen kein Hass-/Extremismus-Symbol ergeben.
- [ ] Tattoo: keine Freitext-Schriftzüge möglich (kein Texteingabefeld).

## 4. Dateien und Lizenzen
- [ ] Jede Datei in `/assets` hat einen vollständigen Eintrag in `assets/REGISTER.json` (Quelle, Lizenz, Datum, Ersteller/Prompt) – Test prüft das.
- [ ] Grafiken nur selbst erzeugt (im Code) – keine Bilder aus dem Internet, keine KI-Bilder ohne dokumentierte Rechte.
- [ ] Schriften: nur Systemschriften oder OFL-Schriften (aktuell: nur Systemschriften).
- [ ] Sounds: nur eigene oder CC0 (aktuell: keine Sounds).
- [ ] Neue Abhängigkeiten: Lizenz vorher geprüft; `docs/ABHAENGIGKEITEN.md` neu erzeugt (`node scripts/license-report.js --list`).

## 5. Fairness
- [ ] Jedes Teil hat `tier` (free/premium); Bewertung ist unabhängig vom tier (Test).
- [ ] Jeder Auftrag ist mit kostenlosen, nicht gesponserten Teilen mit 5 Sternen lösbar (Test).
- [ ] Jede Bewertung zeigt Begründungen (Test).
- [ ] Hinweis in der App: Premium-Teile sind nur Optik.

## 6. Werbung, Sponsoring, Kosten, Daten
- [ ] Alle Fernschalter stehen auf AUS (`ads`, `iap`, `analytics`, `liveRender`, `sponsoredContent`) – oder eine bewusste, dokumentierte Entscheidung liegt vor.
- [ ] Gesponserte Inhalte nur mit Schalter und immer mit sichtbarer Kennzeichnung „Sponsored“ (DE zusätzlich „Anzeige“) – Test.
- [ ] Kostenschutz: Tageskontingent für bezahlte Aktionen = 0 (oder bewusst freigegeben und dokumentiert).
- [ ] Keine Netzwerk-Aufrufe im App-Code, keine Werbe-/Analyse-SDKs (Test + Sichtprüfung `package.json`).
- [ ] Datenschutzhinweis und Impressum für die Veröffentlichung vorhanden (für Web-Test in DE Pflicht – **noch offen**, siehe PROJEKT.md).
- [ ] Altersabfrage 18+ beim ersten Start vorhanden; Store-Altersfreigabe passend gewählt.
