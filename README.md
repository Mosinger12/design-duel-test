# Design Duel – Prototyp

Ein Design-Spiel: Auftrag lesen → Teile kombinieren → schönes Ergebnisbild → Bewertung mit 1–5 Sternen und Begründung → Sammlung.
Zwei Themen auf derselben Technik: **Teller-Studio** (Essen anrichten) und **Tinten-Studio** (Tattoo entwerfen).

Diese Anleitung ist für Menschen ohne Programmier-Erfahrung. Alles, was du eintippen sollst, steht in grauen Kästen.
Tippe es genau so ab und drücke danach die **Eingabetaste** (Enter / ⏎).

---

## 1. Node installieren (einmalig)

Node ist das Programm, das unser Projekt auf deinem Computer ausführt.

1. Öffne <https://nodejs.org> im Browser.
2. Lade die Version mit der Beschriftung **„LTS“** herunter (z. B. 22 oder neuer) und installiere sie wie jedes andere Programm.
3. Öffne das **Terminal**:
   - Mac: `Cmd + Leertaste` drücken, „Terminal“ tippen, Enter.
   - Windows: Startmenü öffnen, „PowerShell“ tippen, Enter.
4. Prüfe die Installation:
   ```
   node -v
   ```
   Es erscheint eine Nummer wie `v22.…`. Dann hat es geklappt.

## 2. Projekt auf den Computer holen (einmalig)

- Auf GitHub im Projekt auf den grünen Knopf **„Code“** → **„Download ZIP“** klicken, die ZIP-Datei entpacken (z. B. in den Ordner „Dokumente“).
- Im Terminal in den Projektordner wechseln. Am einfachsten: `cd ` tippen (mit Leerzeichen), dann den entpackten Ordner mit der Maus ins Terminal-Fenster ziehen, Enter.

## 3. Bausteine installieren: `npm install` (einmalig, und nach jedem Update)

```
npm install
```
Das dauert ein paar Minuten. Gelbe „warn“-Meldungen sind normal. Wichtig ist, dass am Ende kein rotes „ERR!“ steht.

## 4. App starten: `npx expo start`

```
npx expo start
```
Nach kurzer Zeit erscheint im Terminal ein **QR-Code**. Das Terminal-Fenster offen lassen, solange du testest.
(Alternative: `npm start` – macht dasselbe, schaltet aber zusätzlich die Nutzungsstatistik des Werkzeugs Expo ab.)

Beenden: im Terminal `Ctrl + C` drücken.

## 5. Auf dem iPhone mit Expo Go öffnen

1. Im App Store die kostenlose App **„Expo Go“** installieren.
2. iPhone und Computer müssen im **selben WLAN** sein.
3. Mit der normalen **Kamera-App** des iPhones auf den QR-Code im Terminal zeigen und auf den eingeblendeten Hinweis tippen. Expo Go öffnet die App.
4. Beim ersten Start fragt die App nach dem Alter (18+). Danach siehst du den Startbildschirm.

Wenn Expo Go meldet, die Projekt-Version (SDK 58) passe nicht: Expo Go im App Store aktualisieren.
Wenn sich nichts öffnet: prüfen, ob beide Geräte im selben WLAN sind, und `npx expo start` neu starten.

## 6. Web-Version starten

Während `npx expo start` läuft, im Terminal die Taste **`w`** drücken. Der Browser öffnet die App.
Oder direkt:
```
npm run web
```

Fertige Web-Version bauen (zum Hochladen auf eine Webseite, landet im Ordner `dist`):
```
npx expo export --platform web
```

## 7. Thema umschalten (Essen ↔ Tattoo) und Sprache

In der App: **Settings / Einstellungen** → unter **Theme / Thema** „Plate Studio“ oder „Ink Studio“ antippen.
Darunter bei **Language / Sprache** „Deutsch“ wählen. Die Auswahl bleibt nach einem Neustart erhalten.

Nur im Entwicklungsmodus (Expo Go) gibt es unten in den Einstellungen „Entwickler-Optionen“: Dort kannst du die **gesponserten Demo-Inhalte** einschalten, um die Kennzeichnung „Sponsored“ zu prüfen. In der fertigen App gibt es diesen Schalter nicht.

## 8. Tests ausführen

```
npx jest
```
Am Ende steht z. B. `Tests: 157 passed, 157 total`. Steht dort „failed“, ist etwas kaputt.

Was geprüft wird (Auswahl): Bewertung und Begründungen, **Fairness** (Premium bringt keinen Vorteil), **Sponsoring** (ohne Schalter unsichtbar, mit Schalter immer gekennzeichnet), **Sperrliste** Tattoo-Symbole, **Asset-Register**, Übersetzungen EN/DE, Fernschalter, Kostenschutz, Speicherung nach Neustart, **keine Netzwerk-Aufrufe**, kompletter App-Ablauf.

## 9. Lizenzen prüfen

```
npm run license-check
```
Prüft alles, was **in der App landet** (Web und iPhone): Das Skript baut die App kurz zusammen (dauert ca. 1 Minute), schaut nach, welche Pakete darin stecken, und liest deren Lizenz aus `node_modules`. Erlaubt sind nur MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD – ohne Ausnahmen.
Am Ende steht `OK: …` oder `FEHLER: …` mit einer Liste.

Zur Information gibt es außerdem einen Bericht über **alle** installierten Pakete, auch die Hilfsprogramme zum Bauen und Testen:
```
npm run license-report
```
Dort tauchen 19 Hilfsprogramme mit anderen (freizügigen) Lizenzen auf. Das ist so gewollt: Sie landen nicht in der App (Entscheidung „A“, siehe `PROJEKT.md`, E-04).

Liste aller Pakete mit Lizenz: `docs/ABHAENGIGKEITEN.md`.

## Weitere Dokumente
- `PROJEKT.md` – Entscheidungen, Annahmen, offene Punkte, Prüfprotokoll
- `RECHTE.md` – Checkliste vor jeder Veröffentlichung
- `CLAUDE.md` – Arbeitsregeln für die KI-Unterstützung
