/**
 * Baut aus Thema + Komposition eine Liste von Ebenen (reine Daten, testbar).
 * Die Darstellung übernimmt src/render/Scene.tsx (react-native-svg).
 */
import type { Composition, Part, Primitive, StyleMods, Theme } from '../engine/types';
import { resolveParts } from '../engine/scoring';
import { drawGlyph } from './glyphs';
import { getFilter, type FilterSpec } from './filters';
import { hashString, rng } from './random';
import { resolvePaint } from './gradients';

export interface SceneLayer {
  key: string;
  transform?: string;
  opacity?: number;
  prims: Primitive[];
}

export interface SceneData {
  width: number;
  height: number;
  layers: SceneLayer[];
  filter: FilterSpec;
  grain: Primitive[];
}

function resolveColor(c: string | undefined, vars: Record<string, string>): string | undefined {
  return resolvePaint(c, (v) => vars[v.slice(1)] ?? '#888888');
}

function applyPaint(p: Primitive, vars: Record<string, string>, mods: StyleMods | null): Primitive {
  const out: Primitive = { ...p, fill: resolveColor(p.fill, vars), stroke: resolveColor(p.stroke, vars) };
  if (mods && p.role) {
    if (mods.strokeScale !== undefined && out.stroke && out.stroke !== 'none') out.strokeWidth = (p.strokeWidth ?? 2) * mods.strokeScale;
    if (p.role === 'fill' && mods.fillOpacity !== undefined) out.fillOpacity = mods.fillOpacity;
    if (mods.dash && out.stroke && out.stroke !== 'none' && !p.strokeDasharray) out.strokeDasharray = mods.dash;
    if (mods.linecap) out.strokeLinecap = mods.linecap;
  }
  return out;
}

export function collectVars(theme: Theme, parts: Record<string, Part | null>, options: Record<string, string>): Record<string, string> {
  const vars: Record<string, string> = { ...(theme.manifest.defaultVars ?? {}) };
  for (const opt of theme.manifest.options ?? []) {
    const chosen = opt.values.find((v) => v.id === options[opt.id]) ?? opt.values[0];
    if (chosen) vars[opt.var] = chosen.color;
  }
  for (const slot of theme.manifest.slots) {
    const p = parts[slot.id];
    if (p?.visual.vars) Object.assign(vars, p.visual.vars);
  }
  return vars;
}

export function buildScene(theme: Theme, comp: Composition): SceneData {
  const m = theme.manifest;
  const parts = resolveParts(theme, comp.selection);
  const vars = collectVars(theme, parts, comp.options);
  const brief = theme.briefs.find((b) => b.id === comp.briefId);

  let mods: StyleMods | null = null;
  for (const slot of m.slots) {
    const s = parts[slot.id]?.visual.style;
    if (s) mods = { ...(mods ?? {}), ...s };
  }

  const layers: SceneLayer[] = [];
  const back: Primitive[] = [...(m.backdrop.base ?? [])];
  if (m.backdrop.variantKey && m.backdrop.variants) {
    const v = brief?.context?.[m.backdrop.variantKey];
    const variant = (v && m.backdrop.variants[v]) || Object.values(m.backdrop.variants)[0] || [];
    back.push(...variant);
  }
  layers.push({ key: 'backdrop', prims: back.map((p) => applyPaint(p, vars, null)) });

  let styledScale = 1;
  if (m.scaleBy) {
    const total = m.scaleBy.slots.reduce((s, id) => s + (parts[id]?.attributes?.[m.scaleBy!.attribute] ?? 0), 0);
    styledScale = Math.max(m.scaleBy.min, (m.scaleBy.base ?? 0) + total * m.scaleBy.unit);
  }

  for (const slot of m.slots) {
    const p = parts[slot.id];
    if (!p || !p.visual.glyph) continue;
    const seed = p.visual.seed ?? hashString(p.id);
    const colors = (p.visual.colors ?? ['#888888']).map((c) => resolveColor(c, vars) ?? '#888888');
    let prims = drawGlyph(p.visual.glyph, colors, rng(seed)).map((pr) => applyPaint(pr, vars, slot.styled ? mods : null));
    const fx = slot.styled ? m.styledEffect : undefined;
    if (fx?.bleed) {
      // weicher Rand ("Tinte in der Haut"): breitere, sehr blasse Kopie jeder Kontur darunter
      const halo = prims
        .filter((pr) => pr.role && pr.stroke && pr.stroke !== 'none')
        .map((pr) => ({ ...pr, fill: 'none', strokeWidth: (pr.strokeWidth ?? 2) * fx.bleed!, opacity: 0.14, strokeDasharray: undefined }));
      prims = [...halo, ...prims];
    }
    const t = slot.transform;
    const scale = t.scale * (slot.styled ? styledScale : 1);
    layers.push({
      key: `${slot.id}:${p.id}`,
      transform: `translate(${t.x} ${t.y}) scale(${Math.round(scale * 1000) / 1000})${t.rotate ? ` rotate(${t.rotate})` : ''}`,
      opacity: fx?.opacity,
      prims,
    });
  }

  const filter = getFilter(m.filters.includes(comp.filter) ? comp.filter : 'none');
  const grain: Primitive[] = [];
  if (filter.grain) {
    const r = rng(hashString(filter.id));
    for (let i = 0; i < filter.grain.count; i++) {
      grain.push({
        type: 'circle',
        cx: Math.round(r() * m.canvas.width * 10) / 10,
        cy: Math.round(r() * m.canvas.height * 10) / 10,
        r: 0.5 + r() * 0.7,
        fill: i % 2 ? filter.grain.light : filter.grain.dark,
        opacity: filter.grain.opacity,
      });
    }
  }
  return { width: m.canvas.width, height: m.canvas.height, layers, filter, grain };
}
