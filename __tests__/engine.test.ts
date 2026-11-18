import { evaluate, starsFromScore } from '../src/engine/scoring';
import { evaluators } from '../src/engine/rules';
import { THEMES } from '../src/themes';
import { randomSelection, seededRandom } from './helpers/search';

const food = THEMES.food;
const tattoo = THEMES.tattoo;

describe('Sterne aus Punktzahl', () => {
  it('liefert immer 1–5', () => {
    for (let s = -0.5; s <= 1.5; s += 0.01) {
      const st = starsFromScore(s);
      expect(st).toBeGreaterThanOrEqual(1);
      expect(st).toBeLessThanOrEqual(5);
    }
  });
  it('5 Sterne nur bei (fast) perfekter Erfüllung', () => {
    expect(starsFromScore(1)).toBe(5);
    expect(starsFromScore(0.875)).toBe(4);
    expect(starsFromScore(0)).toBe(1);
  });
});

describe('Bewertung', () => {
  it('ist begründet: jede Vorgabe ergibt eine Begründung mit Textschlüssel', () => {
    const rnd = seededRandom(7);
    for (const theme of [food, tattoo]) {
      for (const brief of theme.briefs) {
        const ev = evaluate(theme, brief, randomSelection(theme, rnd));
        expect(ev.reasons.length).toBe(brief.criteria.length);
        expect(ev.reasons.length).toBeGreaterThan(0);
        for (const r of ev.reasons) expect(r.textKey).toMatch(/^rule\.[a-zA-Z]+\.[a-zA-Z]+$/);
      }
    }
  });

  it('unvollständige Auswahl: 1 Stern, fehlende Slots werden genannt', () => {
    const ev = evaluate(food, food.briefs[0], { plate: 'plate_white' });
    expect(ev.complete).toBe(false);
    expect(ev.stars).toBe(1);
    expect(ev.missingSlots).toEqual(expect.arrayContaining(['base', 'main', 'side']));
  });

  it('food: vegetarischer Auftrag erkennt Fleisch und nennt das Teil', () => {
    const brief = food.briefs.find((b) => b.id === 'autumn_comfort')!;
    const ev = evaluate(food, brief, { plate: 'plate_white', base: 'base_mash', main: 'main_steak', side: 'side_carrots' });
    const veg = ev.reasons.find((r) => r.ruleId === 'vegetarian')!;
    expect(veg.outcome).toBe('bad');
    expect(veg.params.part).toEqual({ t: 'part.main_steak' });
  });

  it('food: Zeitbudget wird summiert', () => {
    const brief = food.briefs.find((b) => b.id === 'quick_lunch')!; // max 20
    const ev = evaluate(food, brief, { plate: 'plate_white', base: 'base_mash', main: 'main_pumpkin', side: 'side_carrots' });
    const time = ev.reasons.find((r) => r.ruleId === 'time')!;
    expect(time.params.total).toBe(75);
    expect(time.outcome).toBe('bad');
  });

  it('food: Aromen-Paar zwischen zwei Teilen wird erkannt', () => {
    const brief = food.briefs.find((b) => b.id === 'quick_lunch')!;
    const ev = evaluate(food, brief, { plate: 'plate_white', base: 'base_couscous', main: 'main_tofu', side: 'side_tomatoes', garnish: 'garnish_lemon_zest' });
    expect(ev.reasons.find((r) => r.ruleId === 'pairs')!.outcome).toBe('good');
  });

  it('tattoo: Größe muss zur Körperstelle passen', () => {
    const brief = tattoo.briefs.find((b) => b.id === 'first_wrist')!; // Handgelenk 1–2
    const big = evaluate(tattoo, brief, { motif: 'motif_mountain', style: 'style_fineline', color: 'color_blackgrey', frame: 'frame_laurel' });
    expect(big.reasons.find((r) => r.ruleId === 'size')!.outcome).toBe('tooBig');
    const ok = evaluate(tattoo, brief, { motif: 'motif_moon', style: 'style_fineline', color: 'color_blackgrey', frame: null });
    expect(ok.reasons.find((r) => r.ruleId === 'size')!.outcome).toBe('good');
    expect(ok.stars).toBe(5);
  });

  it('tattoo: Stil passt zum Wunsch (ähnlicher Stil zählt halb)', () => {
    const brief = tattoo.briefs.find((b) => b.id === 'first_wrist')!; // fineline, nah: dotwork
    const near = evaluate(tattoo, brief, { motif: 'motif_moon', style: 'style_dotwork', color: 'color_blackgrey' });
    expect(near.reasons.find((r) => r.ruleId === 'style')!.score).toBe(0.5);
    const wrong = evaluate(tattoo, brief, { motif: 'motif_moon', style: 'style_traditional', color: 'color_blackgrey' });
    expect(wrong.reasons.find((r) => r.ruleId === 'style')!.score).toBe(0);
  });

  it('jeder Regeltyp in rules.json ist bekannt', () => {
    for (const theme of [food, tattoo]) for (const r of theme.rules) expect(evaluators[r.type]).toBeDefined();
  });
});
