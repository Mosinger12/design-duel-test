/**
 * Sperrliste: Kein Tattoo-Teil darf auf blocked-symbols.json stehen.
 * Geprüft werden ID, Tags, Formname und die Namen in allen Sprachen.
 */
import { THEMES } from '../src/themes';

const norm = (s: string) => ` ${s.toLowerCase().replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[^a-z0-9äöüß]+/gi, ' ').trim()} `;

describe('Sperrliste Hass-/Extremismus-Symbole', () => {
  const tattoo = THEMES.tattoo;
  const blocked = tattoo.blockedSymbols ?? [];

  it('Sperrliste ist vorhanden und nicht leer', () => {
    expect(blocked.length).toBeGreaterThanOrEqual(10);
    for (const b of blocked) expect(b.terms.length).toBeGreaterThan(0);
  });

  it.each(Object.keys(THEMES))('kein Teil steht auf der Sperrliste (Thema %s)', (id) => {
    const theme = THEMES[id];
    const hits: string[] = [];
    for (const p of theme.parts) {
      const texts = [p.id, ...p.tags, p.visual.glyph ?? '', theme.i18n.en[`part.${p.id}`] ?? '', theme.i18n.de[`part.${p.id}`] ?? ''].map(norm);
      for (const b of blocked) for (const term of b.terms) {
        const n = norm(term);
        if (texts.some((t) => t.includes(n))) hits.push(`${p.id} ~ ${b.id} ("${term}")`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('der Vergleich erkennt gesperrte Begriffe (Selbsttest)', () => {
    expect(norm('Black Sun motif').includes(norm('black sun'))).toBe(true);
    expect(norm('motif_wolfsangel').includes(norm('wolfsangel'))).toBe(true);
    expect(norm('Sun').includes(norm('black sun'))).toBe(false);
  });

  it('keine Freitext-Schriftzüge: kein Texteingabefeld und keine Text-Form im Bild', () => {
    const fs = require('fs');
    const path = require('path');
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e: { name: string; isDirectory(): boolean }) =>
      e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
    for (const f of [...walk(path.join(__dirname, '..', 'src')), path.join(__dirname, '..', 'App.tsx')]) {
      const code = fs.readFileSync(f, 'utf8');
      expect({ f, hit: /TextInput|<SvgText|\bTSpan\b|type: 'text'/.test(code) }).toEqual({ f, hit: false });
    }
  });
});
