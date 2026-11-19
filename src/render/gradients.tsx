/**
 * Farbverläufe für Grundelemente. Schreibweise in fill/stroke:
 *   "lin:#farbe1:#farbe2"        senkrechter Verlauf (oben -> unten)
 *   "lin:#farbe1:#farbe2:0"      waagerechter Verlauf (links -> rechts); Zahl = Winkel in Grad
 *   "rad:#farbe1:#farbe2"        runder Verlauf (Mitte -> Rand)
 * Farben dürfen Variablen sein ("$skin"); sie werden vorher in scene.ts aufgelöst.
 */
import React from 'react';
import { Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import type { Primitive } from '../engine/types';
import { hashString } from './random';

export const isGradient = (c?: string) => !!c && (c.startsWith('lin:') || c.startsWith('rad:'));

/** Löst Variablen in einer Farb- oder Verlaufsangabe auf. */
export function resolvePaint(c: string | undefined, resolve: (c: string) => string): string | undefined {
  if (!c) return c;
  if (isGradient(c)) {
    const [kind, ...rest] = c.split(':');
    return [kind, ...rest.map((p) => (p.startsWith('$') ? resolve(p) : p))].join(':');
  }
  return c.startsWith('$') ? resolve(c) : c;
}

function gradientDef(spec: string, id: string) {
  const [kind, c1, c2, angleStr] = spec.split(':');
  if (kind === 'rad') {
    return (
      <RadialGradient key={id} id={id} cx="50%" cy="45%" rx="55%" ry="55%" fx="40%" fy="35%">
        <Stop offset="0" stopColor={c1} />
        <Stop offset="1" stopColor={c2} />
      </RadialGradient>
    );
  }
  const a = ((angleStr ? Number(angleStr) : 90) * Math.PI) / 180;
  const x = Math.cos(a) / 2, y = Math.sin(a) / 2;
  return (
    <LinearGradient key={id} id={id} x1={`${50 - x * 100}%`} y1={`${50 - y * 100}%`} x2={`${50 + x * 100}%`} y2={`${50 + y * 100}%`}>
      <Stop offset="0" stopColor={c1} />
      <Stop offset="1" stopColor={c2} />
    </LinearGradient>
  );
}

/** Ersetzt Verläufe durch url(#id) und liefert die nötigen <Defs>. idPrefix verhindert Kollisionen zwischen mehreren Bildern. */
export function withGradients(prims: Primitive[], idPrefix: string): { defs: React.ReactNode; prims: Primitive[] } {
  const specs = new Map<string, string>();
  const ref = (c?: string) => {
    if (!isGradient(c)) return c;
    let id = specs.get(c!);
    if (!id) { id = `${idPrefix}-${hashString(c!).toString(36)}`; specs.set(c!, id); }
    return `url(#${id})`;
  };
  const out = prims.map((p) => (isGradient(p.fill) || isGradient(p.stroke) ? { ...p, fill: ref(p.fill), stroke: ref(p.stroke) } : p));
  const defs = specs.size ? <Defs>{[...specs].map(([spec, id]) => gradientDef(spec, id))}</Defs> : null;
  return { defs, prims: out };
}
