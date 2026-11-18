/**
 * Lokalisierung: EN und DE haben je Thema dieselben Schlüssel, und jeder benutzte Text existiert.
 */
import fs from 'fs';
import path from 'path';
import { evaluators } from '../src/engine/rules';
import { FLAG_NAMES } from '../src/config/featureFlags';
import { FILTER_IDS } from '../src/render/filters';
import { APP_TEXTS, createT } from '../src/i18n';
import { THEMES } from '../src/themes';

const keysOf = (o: object) => Object.keys(o).sort();

describe('i18n', () => {
  it('App-Texte: en und de haben dieselben Schlüssel, keine leeren Texte', () => {
    expect(keysOf(APP_TEXTS.de)).toEqual(keysOf(APP_TEXTS.en));
    for (const d of [APP_TEXTS.en, APP_TEXTS.de]) for (const v of Object.values(d)) expect(v.trim()).not.toBe('');
  });

  it('App-Texte für Filter, Schalter und Sternzusammenfassungen vorhanden', () => {
    for (const f of FILTER_IDS) expect(APP_TEXTS.en[`filter.${f}`]).toBeDefined();
    for (const f of FLAG_NAMES) expect(APP_TEXTS.en[`flag.${f}`]).toBeDefined();
    for (let i = 1; i <= 5; i++) expect(APP_TEXTS.en[`result.summary.${i}`]).toBeDefined();
  });

  describe.each(Object.keys(THEMES))('Thema %s', (id) => {
    const theme = THEMES[id];
    const { en, de } = theme.i18n;

    it('en.json und de.json haben dieselben Schlüssel', () => {
      expect(keysOf(de)).toEqual(keysOf(en));
    });

    it('jeder benötigte Schlüssel existiert (Teile, Slots, Tags, Aufträge, Regeln, Kontext, Optionen)', () => {
      const need = new Set<string>(['theme.name', 'theme.tagline']);
      for (const s of theme.manifest.slots) need.add(`slot.${s.id}`);
      for (const p of theme.parts) { need.add(`part.${p.id}`); p.tags.forEach((t) => need.add(`tag.${t}`)); }
      for (const b of theme.briefs) {
        need.add(`brief.${b.id}.title`); need.add(`brief.${b.id}.desc`);
        for (const f of theme.manifest.contextFields ?? []) if (b.context?.[f]) need.add(`context.${f}.${b.context[f]}`);
        for (const c of b.criteria) {
          const def = theme.rules.find((r) => r.id === c.rule)!;
          const tags = (c.params?.tags ?? def.params?.tags) as string[] | undefined;
          tags?.forEach((t) => need.add(`tag.${t}`));
        }
      }
      for (const r of theme.rules) for (const o of evaluators[r.type].outcomes) need.add(`rule.${r.id}.${o}`);
      for (const r of theme.rules) {
        const pairs = r.params?.pairs as string[][] | undefined;
        pairs?.flat().forEach((t) => need.add(`tag.${t}`));
      }
      for (const o of theme.manifest.options ?? []) { need.add(`option.${o.id}`); o.values.forEach((v) => need.add(`option.${o.id}.${v.id}`)); }
      const missing = [...need].filter((k) => !(k in en) || !(k in de));
      expect(missing).toEqual([]);
    });

    it('Platzhalter in en und de stimmen überein', () => {
      const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
      for (const k of Object.keys(en)) expect({ k, de: ph(de[k]) }).toEqual({ k, de: ph(en[k]) });
    });

    it('Übersetzung funktioniert (Deutsch vorbereitet)', () => {
      expect(createT('de', theme)('theme.name')).toBe(de['theme.name']);
      expect(createT('en', theme)('theme.name')).toBe(en['theme.name']);
    });
  });

  it('keine fest eingebauten Texte in Text-Elementen der Oberfläche', () => {
    const dir = path.join(__dirname, '..', 'src', 'ui');
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    for (const f of [...walk(dir), path.join(__dirname, '..', 'App.tsx')].filter((x) => x.endsWith('.tsx'))) {
      const code = fs.readFileSync(f, 'utf8');
      // Buchstaben direkt zwischen > und < (z. B. <Text>Hallo</Text>) sind verboten
      const literal = code.match(/>[ \t]*[A-Za-zÄÖÜäöü][^<>{}\n]*<\//g) ?? [];
      expect({ f, literal }).toEqual({ f, literal: [] });
    }
  });
});
