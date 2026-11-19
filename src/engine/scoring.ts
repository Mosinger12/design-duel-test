/**
 * Regelbasierte Bewertung 1–5 Sterne mit Begründungen.
 * Fairness: Diese Datei liest nie "tier", "sponsor" oder "label".
 */
import { evaluators } from './rules';
import type { Brief, Evaluation, Part, Reason, Selection, Theme } from './types';

export function starsFromScore(score: number): Evaluation['stars'] {
  // 5 Sterne erst ab 0,9375 – damit eine klar verfehlte Vorgabe nie 5 Sterne gibt.
  const s = 1 + Math.floor(Math.max(0, Math.min(1, score)) * 4 + 0.25 + 1e-9);
  return Math.max(1, Math.min(5, s)) as Evaluation['stars'];
}

export function resolveParts(theme: Theme, selection: Selection): Record<string, Part | null> {
  const byId = new Map(theme.parts.map((p) => [p.id, p]));
  const out: Record<string, Part | null> = {};
  for (const slot of theme.manifest.slots) {
    const id = selection[slot.id];
    const part = id ? byId.get(id) ?? null : null;
    out[slot.id] = part && part.slot === slot.id ? part : null;
  }
  return out;
}

export function evaluate(theme: Theme, brief: Brief, selection: Selection): Evaluation {
  const parts = resolveParts(theme, selection);
  const missingSlots = theme.manifest.slots.filter((s) => s.required && !parts[s.id]).map((s) => s.id);
  const reasons: Reason[] = [];

  for (const ref of brief.criteria) {
    const def = theme.rules.find((r) => r.id === ref.rule);
    if (!def) throw new Error(`Regel "${ref.rule}" (Auftrag ${brief.id}) fehlt in rules.json`);
    const ev = evaluators[def.type];
    if (!ev) throw new Error(`Unbekannter Regeltyp "${def.type}"`);
    const params = { ...(def.params ?? {}), ...(ref.params ?? {}) };
    const res = ev.evaluate({ brief, parts, params });
    reasons.push({
      ruleId: def.id,
      outcome: res.outcome,
      textKey: `rule.${def.id}.${res.outcome}`,
      params: res.params,
      score: res.score,
      weight: ref.weight ?? def.weight ?? 1,
    });
  }

  const complete = missingSlots.length === 0;
  const totalWeight = reasons.reduce((s, r) => s + r.weight, 0);
  let score = totalWeight ? reasons.reduce((s, r) => s + r.score * r.weight, 0) / totalWeight : 0;
  if (!complete) score = 0;
  const stars = complete ? starsFromScore(score) : 1;
  return {
    complete,
    missingSlots,
    score,
    stars,
    summaryKey: complete ? `result.summary.${stars}` : 'result.incomplete',
    reasons,
  };
}
