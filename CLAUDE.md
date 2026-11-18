# CLAUDE.md – Arbeitsregeln für künftige Sitzungen

Projekt: Design-Duell-Spiel-App (Prototyp), Solo-Gründer in Deutschland, **kein Programmierer**.
Ausführlicher Kontext, Entscheidungen und offene Punkte: `PROJEKT.md`. Rechte-Checkliste: `RECHTE.md`.

## Kommunikation
- Antworten und Dokumentation **auf Deutsch**, in einfacher Sprache.
- Eigenständig arbeiten; nur bei **nicht umkehrbaren** Entscheidungen fragen – und bei allem, was eine Vorgabe des Inhabers aufweicht (z. B. Prüfungen lockern, Ausnahmen einführen).
- Ehrlich berichten: nur Tests als bestanden melden, die wirklich ausgeführt wurden.

## Harte Regeln (Abnahmekriterien)
- **Keine Netzwerk-Aufrufe**, keine kostenpflichtigen Dienste, keine Werbe-/Analyse-/Tracking-SDKs, keine KI zur Laufzeit.
- Später nur hinter Fernschaltern (`src/config/featureFlags.ts`, alle Standardwerte **aus**) und Kostenschutz (`src/config/costGuard.ts`, Tageskontingent **0**).
- **Rechte:** Mechanik übernehmen ja, Ausdruck kopieren nie. Keine Vorlagen/Texte/Grafiken anderer Spiele, keine Marken, Logos, Promis, Künstlernamen.
- Code-Lizenzen nur MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD. Schriften nur OFL/System. Sounds nur eigen/CC0.
- Grafiken nur als im Code erzeugte einfache Formen (`src/render/glyphs.ts`). Jede Datei in `/assets` braucht einen Eintrag in `assets/REGISTER.json`.
- **Fairness:** Bewertung liest nie `tier`/`sponsor`/`label`. Jeder Auftrag muss mit kostenlosen Teilen 5 Sterne erreichen. Bewertung immer begründet.
- **Sponsoring** nur mit Schalter `sponsoredContent` und immer mit sichtbarer Kennzeichnung „Sponsored“.
- Tattoo: kein Teil auf `themes/tattoo/blocked-symbols.json`; keine Freitext-Schriftzüge (kein Texteingabefeld, keine Text-Formen).
- Keine fest eingebauten Texte: alles in `src/i18n/locales/*.json` bzw. `themes/<name>/i18n/*.json` (en + de).

## Aufbau
- Engine (themen-neutral): `src/engine/` (Typen, Regeln, Bewertung, Sichtbarkeit/Sponsoring)
- Bild: `src/render/` (Formbibliothek, Szenenaufbau, 2 Film-Filter als Überlagerung)
- Themen: `themes/<name>/` (theme.json, parts.json, briefs.json, rules.json, i18n/en.json, i18n/de.json); Register in `src/themes/index.ts`
- Oberfläche: `src/ui/`, Einstieg `App.tsx`; Speicherung: `src/storage/store.ts` (AsyncStorage, nur lokal)

## Vor jedem Commit ausführen
```
npx tsc --noEmit
npx jest
npm run license-check
npm run bundle-license-check
npx expo export --platform web
```
- Neue Pakete nur mit `EXPO_OFFLINE=1 npx expo install <paket>` und vorher Lizenz prüfen.
- Kleine Commits, Nachrichten auf Deutsch. `PROJEKT.md` (Entscheidungen, Annahmen, offene Punkte, Prüfprotokoll) mitpflegen.
