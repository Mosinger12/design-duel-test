# PROJEKT.md – Design Duel

## Kontext
- Solo-Projekt, Sitz Deutschland. Ziel: profitable Design-Duell-Spiel-App.
  Kern-Schleife: **Auftrag → kombinieren → schönes Ergebnisbild → Bewertung/Duell → sammeln**.
- Zwei Themen auf einer themen-neutralen Engine:
  - **food** („Plate Studio“ / „Teller-Studio“): Zutaten passend zum Auftrag wählen und anrichten.
  - **tattoo** („Ink Studio“ / „Tinten-Studio“): Motiv, Stil, Farbe, Rahmen; Körperstelle kommt aus dem Auftrag.
  - Ein Web-Test entscheidet, welches Thema zuerst in den Store geht.
- Render: nur 2D-Ebenen + Filter, keine KI zur Laufzeit, keine laufenden Kosten.
- Kostenschutz: keine kostenpflichtigen Dienste, keine Netzwerk-Aufrufe in dieser Phase. Später alles hinter Fernschaltern mit sicheren Standardwerten (aus).
- Zielgruppe 18+, Startsprache Englisch, Deutsch vorbereitet.
- Rechte (Abnahmekriterium): Mechanik übernehmen erlaubt, Ausdruck kopieren nie. Keine Vorlagen, Texte, Screenshots oder Grafiken anderer Spiele (insb. nicht „Aesthetic“, „Cover Club“, „Food Stylist“, „MasterChef“). Keine Marken, Logos, Promis, Künstlernamen. Code-Lizenzen nur MIT/Apache-2.0/BSD/ISC/0BSD, Schriften nur OFL/System, Sounds nur eigen/CC0.
- Fairness: Bezahlte Teile geben nie einen Wertungsvorteil. Bewertung wird immer begründet.

## Stand (18.11.2026)
Prototyp läuft (Web-Build gebaut, im Browser durchgeklickt). Beide Themen mit je 10 Aufträgen spielbar, Bewertung mit Begründung, Sammlung bleibt nach Neustart erhalten, Englisch/Deutsch umschaltbar.
Auf dem iPhone noch **nicht** getestet (kein Gerät in dieser Umgebung).

## Aufbau (Kurzüberblick)
| Bereich | Ort |
|---|---|
| Engine: Typen, Regeln, Bewertung, Sponsoring-Sichtbarkeit | `src/engine/` |
| Bild: Formbibliothek, Szenenaufbau, 2 Film-Filter | `src/render/` |
| Themenpakete (alles als JSON) | `themes/food/`, `themes/tattoo/` |
| Texte der App (en/de) | `src/i18n/locales/` |
| Fernschalter, Kostenschutz | `src/config/featureFlags.ts`, `src/config/costGuard.ts` |
| Lokale Speicherung | `src/storage/store.ts` |
| Oberfläche | `src/ui/`, `App.tsx` |
| Tests | `__tests__/` |
| Prüf-Skripte | `scripts/license-check.js` (maßgeblich), `scripts/license-report.js` (Info), `scripts/license-rules.js` |

## Entscheidungen (mit Begründung)
| Nr. | Entscheidung | Begründung |
|---|---|---|
| E-01 | Expo **SDK 58** (aktuell stabil, 58.0.26), TypeScript, React Native 0.88. | Vorgabe „aktuelle stabile SDK“; Expo Go im App Store unterstützt nur die neueste SDK. |
| E-02 | Keine Navigations-Bibliothek (kein Expo Router), einfache Bildschirm-Umschaltung in `App.tsx`. | Weniger Abhängigkeiten = weniger Lizenz- und Update-Risiko; 6 Bildschirme brauchen keinen Router. |
| E-03 | Eigene Mini-Übersetzung (`src/i18n/index.ts`) statt i18n-Bibliothek. | Keine zusätzliche Abhängigkeit; alle Texte trotzdem in JSON (en/de je Thema). |
| E-04 | **Entscheidung des Inhabers (Option A, 18.11.2026):** Die Lizenzregel gilt für alles, was **in der App landet**. `npm run license-check` prüft daher ohne Ausnahmen (1) alle direkten App-Abhängigkeiten aus `package.json` und (2) jedes Paket in den gebauten Bundles für Web und iOS (ermittelt über Source-Maps), jeweils mit der Lizenz aus `node_modules`. `npm run license-report` listet zusätzlich alle installierten Pakete inkl. Build-/Test-Werkzeuge, nur zur Information (bricht nicht ab). | Build-/Test-Werkzeuge von Expo und Jest (19 Pakete, freizügige Lizenzen wie Blue Oak, CC0, Unlicense; `lightningcss` mit MPL-2.0) lassen sich nicht vermeiden und werden nicht ausgeliefert. Ursprünglich prüfte license-check alle Pakete und schlug deshalb fehl; ich hatte das bewusst nicht eigenmächtig gelockert, sondern zur Entscheidung vorgelegt (früher O-01). |
| E-05 | Bild aus einfachen SVG-Formen (`react-native-svg`), Formen im Code (`src/render/glyphs.ts`). Film-Filter = Überlagerungen (Tönung, Schleier, Vignette, Korn) statt SVG-Filter. | Läuft identisch auf iPhone und Web, keine Bilddateien, keine Rechte-Fragen, deterministisch (gleiches Ergebnis = gleiches Bild). |
| E-06 | Themen-neutrale Regeltypen: `forbidTags`, `tagShare`, `attributeSumMax`, `pairs`, `slotTagMatch`, `attributeSumRange`. Themen wählen Typ + Parameter in `rules.json`, Aufträge überschreiben Parameter. | Neue Themen brauchen nur JSON, keinen Code. |
| E-07 | Sterne = 1 + ⌊Punktzahl × 4 + 0,25⌋; 5 Sterne erst ab 93,75 %. Unvollständig = 1 Stern, Bewerten-Knopf gesperrt. | Eine klar verfehlte Vorgabe soll nie 5 Sterne geben; trotzdem nicht zu streng. |
| E-08 | Premium-Teile sind im Prototyp sichtbar, aber **gesperrt** (kein Kauf möglich, Schalter `iap` aus). Test: jeder Auftrag ist mit kostenlosen, nicht gesponserten Teilen perfekt lösbar. | So zeigt der Prototyp das spätere Modell, und Fairness ist nachweisbar. |
| E-09 | Kennzeichnung gesponserter Inhalte: EN „Sponsored“, DE „Sponsored · Anzeige“. Der Text kommt immer aus der App, nie vom Sponsor; ein Sponsor-`label` wird nur zusätzlich gezeigt. Ein `label` ohne `sponsor` wird nie angezeigt. | Vorgabe „Sponsored“; in Deutschland ist „Anzeige“ die übliche Kennzeichnung (Schleichwerbung vermeiden). |
| E-10 | Demo-Sponsor ist erkennbar fiktiv („Demo Partner (fictional)“): 1 Food-Auftrag, 1 Food-Teil, 1 Tattoo-Rahmen. Nur sichtbar mit Schalter. | Damit der Sponsoring-Test echte Daten prüft, ohne echte Marke. |
| E-11 | Entwickler-Schalter für Sponsoring-Demo nur im Entwicklungsmodus (`__DEV__`), nicht im fertigen Build. | Kennzeichnung auf dem iPhone prüfbar, ohne dass Nutzer Werbung einschalten können. |
| E-12 | App-Icon: zwei gekippte Karten + goldene Raute, im Code erzeugt (`scripts/generate-icons.js`). Erster Entwurf (zwei überlappende Kreise) **verworfen**. | Erster Entwurf erinnerte an ein bekanntes Zahlungsdienst-Logo. |
| E-13 | Altersabfrage (Selbstauskunft 18+) beim ersten Start; das bestätigte Alter (18) wird für `minAge` genutzt. Region fest „DE“ (kein Standort-Abruf). | Zielgruppe 18+; keine Netzwerk- oder Standortdaten nötig. |
| E-14 | Tattoo-Größe = Summe aus Motiv-Größe und Rahmen-Größe; das Bild wird entsprechend größer gezeichnet. Bereiche: Handgelenk 1–2, Unterarm 2–4, Rücken 4–6. | Die Rückmeldung „zu groß/zu klein“ ist im Bild sichtbar, nicht nur im Text. |
| E-15 | Tattoo-Motive bewusst ohne Runen, ohne Fünfzack-Stern (stattdessen „Funkeln“ mit 4 Zacken), ohne Totenkopf. Sperrliste vergleicht ganze Wörter/Phrasen in ID, Tags, Formname und Namen EN/DE. | Abstand zu Hass-/Extremismus- und politischen Symbolen; Sperrliste ist trotzdem nicht abschließend → zusätzliche Sichtprüfung (RECHTE.md). |
| E-16 | Expo-CLI wird über `scripts/expo.js` mit `EXPO_NO_TELEMETRY=1` gestartet (`npm start`, `npm run web`). | Kein unnötiger Datenverkehr des Entwicklungswerkzeugs. |
| E-17 | Speicherung lokal mit AsyncStorage (iPhone: Gerätespeicher, Web: localStorage). Kaputte Daten → Standardwerte statt Absturz. | Übersteht Neustart, keine Cloud. |
| E-18 | Food-Inhalte nach Fairness-Test angepasst: neue Zutaten „Gegrillte Zucchini“, „Frischer Meerrettich“; Zeiten justiert; „Gemütlich vegan im Winter“ auf 70 Min. | Der Test hatte gezeigt, dass 6 Food-Aufträge mit kostenlosen Teilen nicht perfekt lösbar waren. |

## Annahmen (mit Status)
| Nr. | Annahme | Status |
|---|---|---|
| A-01 | Expo Go aus dem App Store unterstützt SDK 58. | **ungeprüft** – beim iPhone-Test bestätigen |
| A-02 | `react-native-svg` und AsyncStorage sind in Expo Go enthalten (keine eigene App-Version nötig). | laut Expo-Paketliste ja; **auf Gerät ungeprüft** |
| A-03 | Die Kennzeichnung „Sponsored · Anzeige“ reicht in Deutschland aus. | **ungeprüft** – vor Einschalten von Sponsoring rechtlich prüfen lassen |
| A-04 | Eine Selbstauskunft „18+“ genügt für Prototyp und Web-Test. | **ungeprüft** – für Store-Veröffentlichung Altersfreigabe/Jugendschutz klären |
| A-05 | Spieler verstehen die Regeln aus Auftragstext + Begründungen. | **offen** – im Web-Test beobachten |
| A-06 | Zubereitungszeiten der Food-Teile sind plausibel genug für ein Spiel. | grob geschätzt, **ungeprüft** |
| A-07 | Die Sperrliste deckt die wichtigsten Hass-/Extremismus-Symbole ab. | nicht abschließend; **manuelle Prüfung** je neuem Motiv nötig |
| A-08 | Die App selbst macht keine Netzwerk-Aufrufe. | **geprüft**: Code-Scan-Test grün; Web-Build im Browser: 0 externe Anfragen. Hinweis: Bibliotheken enthalten fetch-Code (z. B. `whatwg-fetch` im iOS-Bundle von React Native), der von unserer App nicht aufgerufen wird. |

## Offene Punkte
| Nr. | Punkt | Nächster Schritt |
|---|---|---|
| ~~O-01~~ | **Erledigt durch Entscheidung A (E-04).** Ursprünglich: `npm run license-check` schlug fehl: 19 Pakete mit Lizenz außerhalb der Erlaubt-Liste. Alle sind Build-/Test-/Entwickler-Werkzeuge (Expo-CLI, Metro, Babel, Jest), **keines** steckt in der App (nachgewiesen mit `bundle-license-check`, heute `license-check`). Lizenzen: BlueOak-1.0.0 (glob, minimatch, lru-cache, minipass, path-scurry, sax, graceful-fs, jackspeak, package-json-from-dist), MPL-2.0 (lightningcss), CC-BY-4.0 (caniuse-lite), Unlicense (big-integer, stream-buffers), Python-2.0 (argparse), MIT-0 (@csstools/color-helpers), CC0-1.0 (mdn-data). Ohne Expo/Jest lassen sie sich nicht vermeiden. | Entschieden: Option A. Bei jedem neuen Paket trotzdem auf die Lizenz achten – landet es in der App, schlägt `license-check` an. |
| O-02 | Duell-Modus (Spieler gegen Spieler oder gegen eine gespeicherte Lösung) ist noch nicht gebaut – war nicht Teil der Aufgabenliste. | Konzept ohne Server: z. B. lokales Duell gegen eine zufällige, regelbasiert erzeugte Lösung. |
| O-03 | iPhone-Test mit Expo Go steht aus. | Siehe Prüfliste im README / Abschlussbericht. |
| O-04 | Für den Web-Test in Deutschland: Impressum und Datenschutzhinweis nötig. | Texte erstellen (lassen), bevor die Web-Version öffentlich erreichbar ist. |
| O-05 | Wie wird der Web-Test ausgewertet, ohne Analytics? | z. B. Umfrage-Link oder manuelle Beobachtung; Analytics nur hinter Schalter und nach Datenschutzprüfung. |
| O-06 | `npm audit`: 3 Warnungen (mittel) in `glob` – nur in Jest (Test-Werkzeug), nicht in der App. Behebung würde Jest auf eine alte Version zurücksetzen. | Bei nächstem Jest-/jest-expo-Update erneut prüfen. |
| O-07 | Premium-Teile: Freischaltung (In-App-Kauf) später hinter Schalter `iap` und Kostenschutz. | Erst nach Themen-Entscheidung. |
| O-08 | Das Entwicklungswerkzeug (`npx expo start`) selbst spricht mit dem lokalen Netz und ggf. mit Expo-Servern (z. B. Versionsprüfung). Betrifft nur die Entwicklung, nicht die App. | Hinnehmen; Telemetrie ist über `npm start` abgeschaltet. |
| O-09 | Bildqualität: Platzhalter-Formen sind bewusst einfach. | Nach Themen-Entscheidung eigene Grafiken (mit Register-Eintrag) planen. |

## Prüfprotokoll
Alle Einträge selbst ausgeführt in der Cloud-Umgebung (Linux, Node 22.23.5, npm 10.9.9).

| Datum | Prüfung | Ergebnis |
|---|---|---|
| 18.11.2026 | `npx tsc --noEmit` (Typprüfung) | bestanden, 0 Fehler |
| 18.11.2026 | `npx jest` | **bestanden: 157 von 157 Tests** in 13 Testdateien (Engine, Fairness, Sponsoring, Sperrliste, Asset-Register, i18n, featureFlags, costGuard, Speicherung, Netzwerk/SDKs, Themen-Daten, Lizenz-Parser, App-Ablauf) |
| 18.11.2026 | `npm run license-check` | **nicht bestanden**: 736 Pakete geprüft, 717 erlaubt, **19 nicht erlaubt** (alle Build-/Test-Werkzeuge, siehe O-01) |
| 18.11.2026 | `npm run bundle-license-check` (Web + iOS) | bestanden: 38 Pakete im App-Bundle, alle MIT / ISC / BSD-3-Clause |
| 18.11.2026 | `npx expo export --platform web` | bestanden, Ausgabe in `dist/` |
| 18.11.2026 | `npx expo export --platform ios` (nur Bundle, kein App-Build) | bestanden |
| 18.11.2026 | Web-Build im Browser (Chromium, iPhone-Größe) durchgeklickt: Altersabfrage, Food-Auftrag, Bewertung, Thema/Sprache wechseln, Tattoo-Aufträge (5 Sterne und 1 Stern), Neuladen → Sammlung | bestanden; 0 externe Netzwerk-Anfragen, 0 Fehler in der Konsole |
| 18.11.2026 | Nach Entscheidung A: `npm run license-check` (neu: App-Abhängigkeiten + Bundles web/ios) | **bestanden**: 39 Pakete in der App, alle MIT / ISC / BSD-3-Clause, Exit-Code 0 |
| 18.11.2026 | Gegenprobe: Paket mit CC0-Lizenz vorübergehend als App-Abhängigkeit eingetragen | Prüfung schlägt korrekt an (FEHLER, Exit-Code 1); danach zurückgesetzt |
| 18.11.2026 | `npm run license-report` (alle 736 installierten Pakete, nur Info) | 717 erlaubt, 19 Werkzeuge mit anderer Lizenz (nicht in der App) |
| – | iPhone mit Expo Go | **nicht ausgeführt** (kein Gerät verfügbar) |
