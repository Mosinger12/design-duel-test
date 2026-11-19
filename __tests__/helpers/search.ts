import { evaluate } from '../../src/engine/scoring';
import type { Brief, Part, Selection, Theme } from '../../src/engine/types';

/** Sucht (Tiefensuche, Abbruch bei 100 %) die beste Auswahl aus den erlaubten Teilen. */
export function findBest(theme: Theme, brief: Brief, allow: (p: Part) => boolean): { score: number; selection: Selection } {
  const slots = theme.manifest.slots;
  const options = slots.map((s) => {
    const list: (string | null)[] = theme.parts.filter((p) => p.slot === s.id && allow(p)).map((p) => p.id);
    if (!s.required) list.unshift(null);
    return list;
  });
  let best = { score: -1, selection: {} as Selection };
  const sel: Selection = {};
  function rec(i: number): boolean {
    if (i === slots.length) {
      const ev = evaluate(theme, brief, sel);
      if (ev.score > best.score) best = { score: ev.score, selection: { ...sel } };
      return ev.score >= 1;
    }
    for (const o of options[i]) {
      sel[slots[i].id] = o;
      if (rec(i + 1)) return true;
    }
    return false;
  }
  rec(0);
  return best;
}

export function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a * 1664525 + 1013904223) % 4294967296;
    return a / 4294967296;
  };
}

export function randomSelection(theme: Theme, rnd: () => number): Selection {
  const sel: Selection = {};
  for (const s of theme.manifest.slots) {
    const list = theme.parts.filter((p) => p.slot === s.id);
    const pickNone = !s.required && rnd() < 0.25;
    sel[s.id] = pickNone ? null : list[Math.floor(rnd() * list.length)].id;
  }
  return sel;
}
