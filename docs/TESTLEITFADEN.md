# Testleitfaden: Food oder Tattoo zuerst?

**Ziel:** Herausfinden, welches Thema zuerst in den App Store geht.
**Format:** 10–15 Personen ab 18, je ca. 15 Minuten, persönlich oder per Videoanruf, auf deinem iPhone mit Expo Go.
**Druckvorlagen:** `docs/test-boegen.pdf`: Fragebogen (1 pro Person), Beobachtungsbogen (1 pro Person), Strichliste (1 insgesamt).

---

## 1. Entscheidungsregel (vorher festlegen, nicht nachher!)

Damit das Ergebnis nicht vom Bauchgefühl verzerrt wird, gilt diese Regel **vor** dem Test:

1. **Hauptfrage:** „Welches Thema würdest du weiterspielen?“
   - Bekommt ein Thema **mindestens 60 %** der Stimmen (ohne „keins“), gewinnt es.
2. Liegen beide **zwischen 40 und 60 %**, entscheiden in dieser Reihenfolge:
   1. höherer Durchschnitt bei **„Spaß“**,
   2. mehr **„Ja“** bei „Würdest du so eine App installieren?“,
   3. weniger Stellen, an denen Hilfe nötig war (Beobachtungsbogen).
3. Sagen mehr als ein Drittel aller Personen „keins“, ist das ein Warnsignal für die ganze Spielidee. Dann erst die Gründe auswerten, bevor ein Thema gewählt wird.

## 2. Testpersonen

- **10–15 Personen, alle ab 18.**
- Gemischt nach Alter und Geschlecht. Gut sind auch Leute, die gelegentlich Handyspiele spielen.
- Höchstens die Hälfte enge Freunde oder Familie, denn die sind oft zu nett.
- **Datenschutz:** anonym. Keine Namen, keine Kontaktdaten auf den Bögen, nur die laufende Nummer (Person 1, 2, 3 …). Kein Video und keine Tonaufnahme ohne ausdrückliches Einverständnis.

## 3. Vorbereitung (vor jeder Person, 2 Minuten)

1. iPhone geladen, App läuft über Expo Go (`npx expo start` am Computer).
2. In der App unter **Settings / Einstellungen** auf **„Delete all progress / Gesamten Fortschritt löschen“** tippen (zweimal). So startet jede Person mit leerer Sammlung.
3. **Sprache** so einstellen, wie es die Person lieber mag (Deutsch oder Englisch).
4. **Startthema** nach der Reihenfolge-Regel einstellen:
   - **ungerade Nummern** (1, 3, 5 …) beginnen mit **Food** („Plate Studio“ / „Teller-Studio“),
   - **gerade Nummern** (2, 4, 6 …) beginnen mit **Tattoo** („Ink Studio“ / „Tinten-Studio“).

   Warum? Das zweite Thema wirkt sonst automatisch vertrauter oder langweiliger. Durch den Wechsel gleicht sich das aus.
5. Fragebogen und Beobachtungsbogen mit der Personennummer beschriften.

## 4. Ablauf pro Person (ca. 15 Minuten)

### Begrüßung (1 Minute) – ungefähr so sagen:
> „Danke, dass du mitmachst! Ich teste eine Spiel-Idee, nicht dich. Es gibt kein Richtig oder Falsch. Bitte sag ehrlich, was du denkst – auch Kritik hilft mir sehr. Sag gern laut, was dir durch den Kopf geht. Ich helfe nur, wenn du gar nicht weiterkommst.“

**Wichtig:** Verrate nicht, welches Thema dir lieber ist und dass du überlegst, eines davon zu veröffentlichen.

### Thema 1 (ca. 5 Minuten)
Die Person spielt **zwei Aufträge**:

| Thema | Auftrag 1 | Auftrag 2 |
|---|---|---|
| Food | „Quick desk lunch“ / „Schnelles Büro-Mittagessen“ | „Autumn comfort“ / „Herbstliches Wohlfühlessen“ |
| Tattoo | „First tattoo“ / „Das erste Tattoo“ | „Harbour memories“ / „Hafenerinnerungen“ |

Nach dem zweiten Auftrag: Will die Person von sich aus weiterspielen oder es „nochmal versuchen“, lass sie, höchstens 2 Minuten. Das ist ein gutes Zeichen, notiere es.

### Thema umschalten
Du stellst in den Einstellungen das andere Thema ein.

### Thema 2 (ca. 5 Minuten)
Wie Thema 1, mit den Aufträgen des anderen Themas.

### Fragebogen (ca. 3 Minuten)
Gib der Person den Fragebogen. Lass sie allein ausfüllen und schau nicht über die Schulter.

### Während des Spielens: Beobachtungsbogen
Du notierst je Thema:
- **Zeit** bis zur ersten Bewertung (grob auf die Uhr schauen)
- **Hilfe nötig?** Wo genau? (z. B. „hat Bewerten-Knopf nicht gefunden“)
- **Spontane Reaktionen:** lacht, sagt „cool“ / „schön“, wirkt genervt, wirkt gelangweilt
- **Liest die Begründungen?** (ja / kurz / nein)
- **Spielt freiwillig weiter?** (ja / nein)
- Wörtliche Zitate, die dir auffallen

**Nicht helfen**, solange die Person weniger als etwa 1 Minute feststeckt. Genau diese Stellen sind wertvoll.

## 5. Nach dem Test

1. Strichliste ausfüllen oder einfach alle Bögen fotografieren.
2. Fotos an mich (Claude) schicken mit dem Satz: „Hier sind die Testbögen, bitte auswerten.“
3. Ich werte nach der Entscheidungsregel aus, fasse die wichtigsten Probleme zusammen und schreibe eine Empfehlung. Du entscheidest das Thema.
4. Bögen danach sicher aufbewahren oder vernichten. Sie enthalten keine Namen, aber trotzdem Meinungen.

## 6. Häufige Fehler vermeiden

- Nicht erklären, wie das Spiel funktioniert. Die App muss das selbst schaffen.
- Nicht verteidigen, wenn jemand kritisiert. Einfach „Danke, notiere ich“ sagen.
- Nicht nach jeder Person etwas an der App ändern. Alle Personen sollen dieselbe Version sehen.
- Wenn die App abstürzt oder hängt: notieren, Expo Go neu öffnen, weitermachen und mir später Bescheid geben.
