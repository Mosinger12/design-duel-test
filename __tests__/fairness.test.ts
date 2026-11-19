/**
 * Fairness: Bezahlte Teile (tier "premium") geben nie einen Wertungsvorteil.
 */
import fs from 'fs';
import path from 'path';
import { evaluate } from '../src/engine/scoring';
import type { Part, Theme } from '../src/engine/types';
import { isSponsored } from '../src/engine/visibility';
import { THEMES } from '../src/themes';
import { findBest, randomSelection, seededRandom } from './helpers/search';

function withTiers(theme: Theme, fn: (p: Part) => Part['tier']): Theme {
  return { ...theme, parts: theme.parts.map((p) => ({ ...p, tier: fn(p) })) };
}

describe.each(Object.keys(THEMES))('Fairness – Thema %s', (id) => {
  const theme = THEMES[id];

  it('jedes Teil hat tier "free" oder "premium"', () => {
    for (const p of theme.parts) expect(['free', 'premium']).toContain(p.tier);
    expect(theme.parts.some((p) => p.tier === 'premium')).toBe(true);
  });

  it('Bewertung ist unabhängig vom tier (gleiche Auswahl, tier vertauscht/alle free/alle premium)', () => {
    const variants = [
      withTiers(theme, (p) => (p.tier === 'free' ? 'premium' : 'free')),
      withTiers(theme, () => 'free'),
      withTiers(theme, () => 'premium'),
    ];
    const rnd = seededRandom(42);
    for (let i = 0; i < 300; i++) {
      const sel = randomSelection(theme, rnd);
      for (const brief of theme.briefs) {
        const base = evaluate(theme, brief, sel);
        for (const v of variants) expect(evaluate(v, brief, sel)).toEqual(base);
      }
    }
  });

  it('jeder Auftrag ist mit kostenlosen, nicht gesponserten Teilen perfekt (5 Sterne) lösbar', () => {
    for (const brief of theme.briefs) {
      const best = findBest(theme, brief, (p) => p.tier === 'free' && !isSponsored(p));
      expect({ brief: brief.id, score: best.score }).toEqual({ brief: brief.id, score: 1 });
      expect(evaluate(theme, brief, best.selection).stars).toBe(5);
    }
  });
});

it('Bewertungs-Code liest weder tier noch Sponsor-Felder', () => {
  for (const f of ['src/engine/scoring.ts', 'src/engine/rules.ts']) {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    expect(code).not.toMatch(/\btier\b|\bsponsor\b|\.label\b|premium/);
  }
});
