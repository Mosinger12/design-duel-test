/**
 * Datenprüfung der Themenpakete und des Bildaufbaus.
 */
import { evaluate } from '../src/engine/scoring';
import { isSponsored } from '../src/engine/visibility';
import { GLYPHS } from '../src/render/glyphs';
import { FILTERS } from '../src/render/filters';
import { buildScene } from '../src/render/scene';
import { THEMES } from '../src/themes';
import { randomSelection, seededRandom } from './helpers/search';

describe.each(Object.keys(THEMES))('Themenpaket %s', (id) => {
  const theme = THEMES[id];
  const slotIds = theme.manifest.slots.map((s) => s.id);

  it('hat 10 reguläre (nicht gesponserte) Aufträge', () => {
    expect(theme.briefs.filter((b) => !isSponsored(b))).toHaveLength(10);
  });

  it('IDs sind eindeutig, Slots/Formen/Regeln gültig', () => {
    const ids = theme.parts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(theme.briefs.map((b) => b.id)).size).toBe(theme.briefs.length);
    for (const p of theme.parts) {
      expect(slotIds).toContain(p.slot);
      if (p.visual.glyph) expect(GLYPHS[p.visual.glyph]).toBeDefined();
    }
    for (const b of theme.briefs) for (const c of b.criteria) expect(theme.rules.map((r) => r.id)).toContain(c.rule);
    for (const f of theme.manifest.filters) expect(FILTERS[f]).toBeDefined();
    for (const s of theme.manifest.slots) expect(theme.parts.some((p) => p.slot === s.id && p.tier === 'free')).toBe(true);
  });

  it('kommerzielle Felder haben das richtige Format', () => {
    for (const item of [...theme.briefs, ...theme.parts]) {
      if (item.validFrom) expect(item.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (item.validTo) expect(item.validTo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (item.label) expect(isSponsored(item)).toBe(true);
      if (item.minAge !== undefined) expect(typeof item.minAge).toBe('number');
    }
  });

  it('Bild baut für jeden Auftrag mit 2 Film-Filtern; nur einfache Formen, kein Text', () => {
    const rnd = seededRandom(3);
    const filmFilters = theme.manifest.filters.filter((f) => f !== 'none');
    expect(filmFilters).toHaveLength(2);
    for (const b of theme.briefs) for (const filter of theme.manifest.filters) {
      const scene = buildScene(theme, { themeId: id, briefId: b.id, selection: randomSelection(theme, rnd), filter, options: {} });
      expect(scene.layers.length).toBeGreaterThan(1);
      for (const l of scene.layers) for (const p of l.prims) expect(['circle', 'ellipse', 'rect', 'path', 'polygon', 'line']).toContain(p.type);
      if (filter !== 'none') expect(scene.filter.tint || scene.filter.vignette).toBeTruthy();
    }
  });

  it('Bild ist deterministisch (gleiche Auswahl = gleiches Bild)', () => {
    const sel = randomSelection(theme, seededRandom(9));
    const comp = { themeId: id, briefId: theme.briefs[0].id, selection: sel, filter: 'golden', options: {} };
    expect(buildScene(theme, comp)).toEqual(buildScene(theme, comp));
  });

  it('Filter ändern die Bewertung nicht', () => {
    const sel = randomSelection(theme, seededRandom(11));
    const b = theme.briefs[0];
    expect(evaluate(theme, b, sel)).toEqual(evaluate(theme, b, { ...sel }));
  });
});

describe('Themen-Vorgaben', () => {
  it('food: Slots Basis, Hauptzutat, Beilage, Sauce, Garnitur, Teller', () => {
    expect(THEMES.food.manifest.slots.map((s) => s.id).sort()).toEqual(['base', 'garnish', 'main', 'plate', 'sauce', 'side']);
    expect(THEMES.food.rules.map((r) => r.id)).toEqual(expect.arrayContaining(['season', 'vegetarian', 'time', 'pairs']));
  });
  it('tattoo: Slots Motiv, Stil, Farbe, Rahmen; 3 Körperstellen; 4 Hauttöne', () => {
    const m = THEMES.tattoo.manifest;
    expect(m.slots.map((s) => s.id).sort()).toEqual(['color', 'frame', 'motif', 'style']);
    expect(Object.keys(m.backdrop.variants ?? {})).toHaveLength(3);
    expect(m.options?.find((o) => o.id === 'tone')?.values).toHaveLength(4);
    expect(THEMES.tattoo.rules.map((r) => r.id)).toEqual(expect.arrayContaining(['style', 'size']));
  });
  it('keine Markennamen in Teilen (Stichprobe bekannter Marken)', () => {
    const brands = /nutella|heinz|coca|pepsi|nestl|maggi|knorr|barilla|kraft|oreo|tabasco|sriracha|philadelphia|disney|marvel|nike|adidas|gucci|chanel/i;
    for (const t of Object.values(THEMES)) for (const v of [...Object.values(t.i18n.en), ...Object.values(t.i18n.de)]) expect(v).not.toMatch(brands);
  });
});
