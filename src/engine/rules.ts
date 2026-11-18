/**
 * Regel-Auswerter (themen-neutral). Ein Thema wählt in rules.json einen "type"
 * und gibt Parameter vor; Aufträge können Parameter überschreiben.
 *
 * WICHTIG (Fairness): Auswerter lesen NIE das Feld "tier" eines Teils.
 */
import type { Brief, Part, TextParam } from './types';

export interface RuleContext {
  brief: Brief;
  /** Ausgewählte Teile je Slot (null = leer). */
  parts: Record<string, Part | null>;
  params: Record<string, unknown>;
}

export interface RuleResult {
  score: number;
  outcome: string;
  params: Record<string, TextParam>;
}

export interface RuleEvaluator {
  /** Alle möglichen Ergebnisse; für jedes braucht es einen Text "rule.<id>.<outcome>". */
  outcomes: readonly string[];
  evaluate(ctx: RuleContext): RuleResult;
}

const partName = (p: Part): TextParam => ({ t: `part.${p.id}` });
const tagName = (tag: string): TextParam => ({ t: `tag.${tag}` });

function strArray(v: unknown, name: string): string[] {
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new Error(`Parameter "${name}" muss eine Liste von Texten sein`);
  return v as string[];
}
function num(v: unknown, name: string): number {
  if (typeof v !== 'number' || Number.isNaN(v)) throw new Error(`Parameter "${name}" muss eine Zahl sein`);
  return v;
}

/** Gefüllte Teile, optional beschränkt auf bestimmte Slots. */
function filled(ctx: RuleContext, slots?: unknown): Part[] {
  const allowed = slots === undefined ? null : new Set(strArray(slots, 'slots'));
  return Object.entries(ctx.parts)
    .filter(([slot, p]) => p && (!allowed || allowed.has(slot)))
    .map(([, p]) => p as Part);
}

const sumAttr = (parts: Part[], attr: string) => parts.reduce((s, p) => s + (p.attributes?.[attr] ?? 0), 0);

export const evaluators: Record<string, RuleEvaluator> = {
  /** Kein Teil darf einen der Tags haben (z. B. Ernährungsform). */
  forbidTags: {
    outcomes: ['good', 'bad'],
    evaluate(ctx): RuleResult {
      const tags = strArray(ctx.params.tags, 'tags');
      const offender = filled(ctx, ctx.params.slots).find((p) => p.tags.some((t) => tags.includes(t)));
      return offender ? { score: 0, outcome: 'bad', params: { part: partName(offender) } } : { score: 1, outcome: 'good', params: {} };
    },
  },

  /** Anteil der Teile mit passendem Tag (z. B. Saison). partialTags zählen halb. */
  tagShare: {
    outcomes: ['good', 'ok', 'bad'],
    evaluate(ctx): RuleResult {
      const tags = strArray(ctx.params.tags, 'tags');
      const partial = ctx.params.partialTags === undefined ? [] : strArray(ctx.params.partialTags, 'partialTags');
      const parts = filled(ctx, ctx.params.slots);
      let credit = 0;
      let matches = 0;
      for (const p of parts) {
        if (p.tags.some((t) => tags.includes(t))) { credit += 1; matches += 1; }
        else if (p.tags.some((t) => partial.includes(t))) credit += 0.5;
      }
      const share = parts.length ? credit / parts.length : 0;
      const outcome = share >= 0.8 ? 'good' : share >= 0.5 ? 'ok' : 'bad';
      return { score: share, outcome, params: { count: matches, total: parts.length, tag: tagName(tags[0]) } };
    },
  },

  /** Summe eines Attributs darf ein Maximum nicht übersteigen (z. B. Zeitbudget). */
  attributeSumMax: {
    outcomes: ['good', 'ok', 'bad'],
    evaluate(ctx): RuleResult {
      const attr = String(ctx.params.attribute);
      const max = num(ctx.params.max, 'max');
      const total = sumAttr(filled(ctx, ctx.params.slots), attr);
      if (total <= max) return { score: 1, outcome: 'good', params: { total, max } };
      const over = (total - max) / max;
      return { score: Math.max(0, 1 - over * 2), outcome: over <= 0.25 ? 'ok' : 'bad', params: { total, max } };
    },
  },

  /** Passende Tag-Paare zwischen verschiedenen Teilen (z. B. Aromen-Paare). */
  pairs: {
    outcomes: ['good', 'ok', 'bad'],
    evaluate(ctx): RuleResult {
      const pairList = ctx.params.pairs;
      if (!Array.isArray(pairList)) throw new Error('Parameter "pairs" fehlt');
      const min = ctx.params.min === undefined ? 1 : num(ctx.params.min, 'min');
      const parts = filled(ctx, ctx.params.slots);
      const found: [string, string][] = [];
      for (const pr of pairList) {
        const [a, b] = strArray(pr, 'pairs[]');
        // a und b müssen von zwei verschiedenen Teilen kommen
        const hit = parts.some((p) => p.tags.includes(a) && parts.some((q) => q !== p && q.tags.includes(b)));
        if (hit) found.push([a, b]);
      }
      const score = Math.min(1, found.length / min);
      if (found.length === 0) return { score: 0, outcome: 'bad', params: { min } };
      const [a, b] = found[0];
      return { score, outcome: found.length >= min ? 'good' : 'ok', params: { a: tagName(a), b: tagName(b), count: found.length, min } };
    },
  },

  /** Teil in einem Slot soll einen gewünschten Tag haben; "nearTags" zählt halb (z. B. Stil). */
  slotTagMatch: {
    outcomes: ['good', 'ok', 'bad', 'empty'],
    evaluate(ctx): RuleResult {
      const slot = String(ctx.params.slot);
      const tags = strArray(ctx.params.tags, 'tags');
      const near = ctx.params.nearTags === undefined ? [] : strArray(ctx.params.nearTags, 'nearTags');
      const p = ctx.parts[slot];
      const wish = tagName(tags[0]);
      if (!p) return { score: 0, outcome: 'empty', params: { wish } };
      if (p.tags.some((t) => tags.includes(t))) return { score: 1, outcome: 'good', params: { part: partName(p), wish } };
      if (p.tags.some((t) => near.includes(t))) return { score: 0.5, outcome: 'ok', params: { part: partName(p), wish } };
      return { score: 0, outcome: 'bad', params: { part: partName(p), wish } };
    },
  },

  /**
   * Summe eines Attributs soll in einem Bereich liegen; Bereich kommt aus einer Tabelle,
   * deren Schlüssel ein Kontextfeld des Auftrags ist (z. B. Größe passt zur Körperstelle).
   */
  attributeSumRange: {
    outcomes: ['good', 'small', 'big', 'tooSmall', 'tooBig'],
    evaluate(ctx): RuleResult {
      const attr = String(ctx.params.attribute);
      const key = String(ctx.params.contextKey);
      const value = ctx.brief.context?.[key];
      const table = ctx.params.table as Record<string, { min: number; max: number }> | undefined;
      const range = value && table ? table[value] : undefined;
      if (!range) throw new Error(`Kein Bereich für ${key}=${value} in Regel definiert`);
      const total = sumAttr(filled(ctx, ctx.params.slots), attr);
      const place: TextParam = { t: `context.${key}.${value}` };
      const params = { total, min: range.min, max: range.max, place };
      if (total < range.min) {
        const d = range.min - total;
        return { score: d <= 1 ? 0.5 : 0, outcome: d <= 1 ? 'small' : 'tooSmall', params };
      }
      if (total > range.max) {
        const d = total - range.max;
        return { score: d <= 1 ? 0.5 : 0, outcome: d <= 1 ? 'big' : 'tooBig', params };
      }
      return { score: 1, outcome: 'good', params };
    },
  },
};
