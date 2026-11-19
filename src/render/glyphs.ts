/**
 * Formbibliothek: einfache, im Code erzeugte 2D-Formen (keine Bilddateien,
 * keine Vorlagen). Jede Form wird in einem Feld von -50..50 um den Nullpunkt gezeichnet.
 *
 * Farben: c[0], c[1], c[2] kommen aus dem Teil (visual.colors). Tattoo-Motive
 * nutzen Variablen ($ink, $accent, $accent2), die das Farb-Teil bereitstellt.
 * Rollen: role "line" = Kontur, role "fill" = Fläche -> Stil-Teile passen diese an.
 */
import type { Primitive } from '../engine/types';

type Rnd = () => number;
type GlyphFn = (c: string[], rnd: Rnd) => Primitive[];

const f = (n: number) => Math.round(n * 100) / 100;
const pol = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [f(Math.cos(a) * r), f(Math.sin(a) * r)];
};
/** Punkt zufällig in einem Kreis. */
function inDisc(rnd: Rnd, r: number): [number, number] {
  const a = rnd() * Math.PI * 2;
  const d = Math.sqrt(rnd()) * r;
  return [f(Math.cos(a) * d), f(Math.sin(a) * d)];
}
/** Weiche, unregelmäßige Kreisform. */
function blob(rnd: Rnd, r: number, n = 10, wobble = 0.18, cx = 0, cy = 0): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const rr = r * (1 - wobble / 2 + rnd() * wobble);
    const [x, y] = pol(rr, (360 / n) * i);
    pts.push([x + cx, y + cy]);
  }
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];
    const mx = f((p0[0] + p1[0]) / 2);
    const my = f((p0[1] + p1[1]) / 2);
    d += i === 0 ? `M${mx},${my}` : '';
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += ` Q${p2[0]},${p2[1]} ${f((p2[0] + p3[0]) / 2)},${f((p2[1] + p3[1]) / 2)}`;
  }
  return d + ' Z';
}
const L = (p: Primitive): Primitive => ({ strokeWidth: 2, fill: 'none', ...p, role: 'line' });
const F = (p: Primitive): Primitive => ({ strokeWidth: 2, ...p, role: 'fill' });

/* ---------------------------------------------------------------- Speisen */
/** Hellt (k>0) oder dunkelt (k<0) eine #rrggbb-Farbe ab. Variablen/andere Werte bleiben unverändert. */
export function shade(c: string, k: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  const n = parseInt(c.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)));
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('');
}
const lin = (c: string, top = 0.18, bottom = -0.14, angle?: number) => `lin:${shade(c, top)}:${shade(c, bottom)}${angle !== undefined ? ':' + angle : ''}`;
const rad = (c: string, center = 0.2, edge = -0.15) => `rad:${shade(c, center)}:${shade(c, edge)}`;
/** Weicher Schlagschatten aus zwei versetzten, halbtransparenten Kreisen. */
const softShadow = (r: number, dx = 2, dy = 4): Primitive[] => [
  { type: 'circle', cx: dx * 1.6, cy: dy * 1.6, r: r + 1.5, fill: '#000000', opacity: 0.07 },
  { type: 'circle', cx: dx, cy: dy, r, fill: '#000000', opacity: 0.13 },
];
/** Spitzes Blatt als Pfad, Länge l, Breite w, um (x,y) gedreht. */
function leaf(x: number, y: number, l: number, w: number, deg: number, fill: string, vein?: string): Primitive[] {
  const t = `rotate(${f(deg)} ${x} ${y})`;
  const out: Primitive[] = [{ type: 'path', d: `M${f(x - l / 2)},${y} Q${x},${f(y - w)} ${f(x + l / 2)},${y} Q${x},${f(y + w)} ${f(x - l / 2)},${y} Z`, fill, transform: t }];
  if (vein) out.push({ type: 'line', x1: f(x - l / 2 + 1), y1: y, x2: f(x + l / 2 - 1.5), y2: y, stroke: vein, strokeWidth: 0.6, opacity: 0.7, transform: t });
  return out;
}

const food: Record<string, GlyphFn> = {
  plateRound: (c) => [
    ...softShadow(48),
    { type: 'circle', cx: 0, cy: 0, r: 48, fill: lin(c[0], 0.3, -0.12, 70) },
    { type: 'circle', cx: 0, cy: 0, r: 38, fill: rad(c[0], 0.12, -0.06) },
    { type: 'circle', cx: 0, cy: 0, r: 38.5, fill: 'none', stroke: c[1], strokeWidth: 1, opacity: 0.6 },
    { type: 'path', d: 'M-40,-16 A43,43 0 0,1 -12,-41', fill: 'none', stroke: '#ffffff', strokeWidth: 2.4, strokeLinecap: 'round', opacity: 0.55 },
  ],
  plateRim: (c) => [
    ...softShadow(48),
    { type: 'circle', cx: 0, cy: 0, r: 48, fill: lin(c[0], 0.3, -0.1, 70) },
    { type: 'circle', cx: 0, cy: 0, r: 45.6, fill: 'none', stroke: lin(c[1], 0.35, -0.25, 45), strokeWidth: 2 },
    { type: 'circle', cx: 0, cy: 0, r: 38, fill: rad(c[0], 0.1, -0.05) },
    { type: 'circle', cx: 0, cy: 0, r: 38.5, fill: 'none', stroke: c[2] ?? c[1], strokeWidth: 0.8, opacity: 0.6 },
    { type: 'path', d: 'M-40,-16 A43,43 0 0,1 -12,-41', fill: 'none', stroke: '#ffffff', strokeWidth: 2.2, strokeLinecap: 'round', opacity: 0.6 },
  ],
  slate: (c, rnd) => {
    const out: Primitive[] = [
      { type: 'rect', x: -44, y: -42, width: 94, height: 94, rx: 6, fill: '#000000', opacity: 0.12 },
      { type: 'rect', x: -45, y: -43, width: 92, height: 92, rx: 6, fill: '#000000', opacity: 0.1 },
      { type: 'rect', x: -47, y: -47, width: 94, height: 94, rx: 6, fill: lin(c[0], 0.14, -0.18, 35) },
    ];
    for (let i = 0; i < 7; i++) {
      const y = -40 + rnd() * 80;
      const x0 = -40 + rnd() * 40;
      out.push({ type: 'path', d: `M${f(x0)},${f(y)} q12,${f((rnd() - 0.5) * 4)} ${f(20 + rnd() * 20)},0`, fill: 'none', stroke: c[1], strokeWidth: 0.4, opacity: 0.18 });
    }
    out.push({ type: 'rect', x: -42, y: -42, width: 84, height: 84, rx: 4, fill: 'none', stroke: c[1], strokeWidth: 0.7, opacity: 0.4 });
    return out;
  },
  bowl: (c) => [
    ...softShadow(47),
    { type: 'circle', cx: 0, cy: 0, r: 47, fill: lin(c[0], 0.25, -0.2, 70) },
    { type: 'circle', cx: 0, cy: 0, r: 37, fill: `rad:${shade(c[1], 0.05)}:${shade(c[1], -0.14)}` },
    { type: 'circle', cx: 0, cy: 0, r: 37, fill: 'none', stroke: '#000000', strokeWidth: 2.5, opacity: 0.12 },
    { type: 'path', d: 'M-41,-14 A43,43 0 0,1 -14,-41', fill: 'none', stroke: '#ffffff', strokeWidth: 2.2, strokeLinecap: 'round', opacity: 0.5 },
  ],
  grains: (c, rnd) => {
    const out: Primitive[] = [
      { type: 'ellipse', cx: 3, cy: 5, rx: 27, ry: 25, fill: '#000000', opacity: 0.16 },
      { type: 'path', d: blob(rnd, 26, 10, 0.25), fill: rad(c[0], 0.15, -0.18) },
    ];
    for (let i = 0; i < 90; i++) {
      const [x, y] = inDisc(rnd, 24);
      const k = (y < 0 ? 0.25 : -0.05) + (rnd() - 0.5) * 0.2;
      out.push({ type: 'ellipse', cx: x, cy: y, rx: 2.3, ry: 1.15, fill: shade(c[1], k), transform: `rotate(${f(rnd() * 180)} ${x} ${y})` });
    }
    return out;
  },
  mash: (c, rnd) => [
    { type: 'ellipse', cx: 3, cy: 5, rx: 26, ry: 24, fill: '#000000', opacity: 0.16 },
    { type: 'path', d: blob(rnd, 25, 9, 0.22), fill: rad(c[0], 0.22, -0.16) },
    { type: 'path', d: 'M-2,0 a3,3 0 1,1 5,1 a8,8 0 1,1 -13,-2 a13,13 0 1,1 22,4', fill: 'none', stroke: shade(c[1], -0.15), strokeWidth: 1.6, opacity: 0.55 },
    { type: 'path', d: 'M-1,-1.5 a3,3 0 1,1 5,1 a8,8 0 1,1 -13,-2 a13,13 0 1,1 22,4', fill: 'none', stroke: '#ffffff', strokeWidth: 1, opacity: 0.45 },
  ],
  leaves: (c, rnd) => {
    const out: Primitive[] = [{ type: 'ellipse', cx: 3, cy: 5, rx: 26, ry: 24, fill: '#000000', opacity: 0.12 }];
    for (let i = 0; i < 13; i++) {
      const [x, y] = inDisc(rnd, 19);
      out.push(...leaf(x, y, 24, 8, rnd() * 180, lin(c[i % 2], 0.2, -0.2), c[2] ?? c[1]));
    }
    return out;
  },
  fillet: (c) => [
    { type: 'rect', x: -22, y: -10, width: 50, height: 28, rx: 11, fill: '#000000', opacity: 0.18, transform: 'rotate(-18 2 3)' },
    { type: 'rect', x: -24, y: -14, width: 48, height: 26, rx: 10, fill: lin(c[0], 0.25, -0.2), transform: 'rotate(-18 0 0)' },
    ...[-12, -2, 8].map<Primitive>((x) => ({ type: 'line', x1: x - 4, y1: -10, x2: x + 4, y2: 10, stroke: c[1], strokeWidth: 2.4, strokeLinecap: 'round', opacity: 0.75, transform: 'rotate(-18 0 0)' })),
    { type: 'path', d: 'M-18,-10 Q0,-14 18,-10', fill: 'none', stroke: '#ffffff', strokeWidth: 1.6, strokeLinecap: 'round', opacity: 0.4, transform: 'rotate(-18 0 0)' },
  ],
  cubes: (c, rnd) => {
    const out: Primitive[] = [];
    for (let gx = -1; gx <= 1; gx++) for (let gy = -1; gy <= 1; gy++) {
      const x = gx * 12 + (rnd() - 0.5) * 3;
      const y = gy * 12 + (rnd() - 0.5) * 3;
      const r = `rotate(${f((rnd() - 0.5) * 30)} ${f(x)} ${f(y)})`;
      out.push({ type: 'rect', x: f(x - 4), y: f(y - 3), width: 10, height: 10, rx: 1.5, fill: '#000000', opacity: 0.15, transform: r });
      out.push({ type: 'rect', x: f(x - 5), y: f(y - 5), width: 10, height: 10, rx: 1.5, fill: lin(c[0], 0.2, -0.2, 60), stroke: c[1], strokeWidth: 0.7, transform: r });
    }
    return out;
  },
  wedges: (c) => [-40, -10, 20, 50].flatMap<Primitive>((a) => [
    { type: 'path', d: 'M0,-4 Q22,-24 31,2 Q22,12 0,8 Z', fill: '#000000', opacity: 0.14, transform: `rotate(${a} 0 0) translate(-4 2)` },
    { type: 'path', d: 'M0,-6 Q22,-26 30,0 Q22,10 0,6 Z', fill: lin(c[0], 0.2, -0.15), stroke: shade(c[0], -0.3), strokeWidth: 1.4, transform: `rotate(${a} 0 0) translate(-6 0)` },
    { type: 'path', d: 'M4,-5 Q20,-20 26,-2', fill: 'none', stroke: c[1], strokeWidth: 1.2, opacity: 0.8, transform: `rotate(${a} 0 0) translate(-6 0)` },
  ]),
  spears: (c) => [-14, -7, 0, 7, 14].flatMap<Primitive>((x, i) => {
    const t = `rotate(${(i - 2) * 4 + 20} 0 0)`;
    return [
      { type: 'rect', x: x - 1, y: -20, width: 4, height: 44, rx: 2, fill: '#000000', opacity: 0.13, transform: t },
      { type: 'rect', x: x - 2, y: -22, width: 4, height: 44, rx: 2, fill: lin(c[0], 0.25, -0.15, 0), transform: t },
      { type: 'ellipse', cx: x, cy: -22, rx: 2.8, ry: 4.2, fill: lin(c[1], 0.15, -0.2), transform: t },
    ];
  }),
  caps: (c, rnd) => {
    const out: Primitive[] = [];
    for (let i = 0; i < 6; i++) {
      const [x, y] = inDisc(rnd, 15);
      out.push({ type: 'ellipse', cx: f(x + 1.5), cy: f(y + 2), rx: 8.5, ry: 5, fill: '#000000', opacity: 0.15 });
      out.push({ type: 'rect', x: f(x - 2), y: f(y), width: 4, height: 6, rx: 1.5, fill: lin(c[1], 0.1, -0.2, 0) });
      out.push({ type: 'path', d: `M${f(x - 8)},${f(y)} A8,7 0 0,1 ${f(x + 8)},${f(y)} Z`, fill: rad(c[0], 0.25, -0.2), stroke: shade(c[0], -0.3), strokeWidth: 0.7 });
    }
    return out;
  },
  balls: (c, rnd) => {
    const out: Primitive[] = [];
    for (let i = 0; i < 6; i++) {
      const [x, y] = inDisc(rnd, 16);
      const col = c[i % 2 === 0 ? 0 : (c[2] ? 2 : 0)];
      out.push({ type: 'circle', cx: x + 1.5, cy: y + 2.5, r: 7, fill: '#000000', opacity: 0.16 });
      out.push({ type: 'circle', cx: x, cy: y, r: 7, fill: rad(col, 0.3, -0.2) });
      out.push({ type: 'circle', cx: f(x - 2.2), cy: f(y - 2.6), r: 1.6, fill: '#ffffff', opacity: 0.6 });
    }
    return out;
  },
  peas: (c, rnd) => {
    const out: Primitive[] = [{ type: 'ellipse', cx: 2, cy: 4, rx: 20, ry: 18, fill: '#000000', opacity: 0.1 }];
    for (let i = 0; i < 24; i++) {
      const [x, y] = inDisc(rnd, 18);
      out.push({ type: 'circle', cx: x, cy: y, r: 3.4, fill: rad(c[0], 0.3, -0.2), stroke: c[1], strokeWidth: 0.4 });
    }
    return out;
  },
  sticks: (c) => [-30, -18, -6, 6, 18, 30].flatMap<Primitive>((a) => [
    { type: 'rect', x: -1.6, y: -22, width: 5.2, height: 34, rx: 2.6, fill: '#000000', opacity: 0.14, transform: `rotate(${a} 0 12)` },
    { type: 'rect', x: -2.6, y: -24, width: 5.2, height: 34, rx: 2.6, fill: lin(c[0], 0.25, -0.2, 0), transform: `rotate(${a} 0 12)` },
    { type: 'rect', x: -1.5, y: -29, width: 3, height: 7, rx: 1.5, fill: c[1], transform: `rotate(${a} 0 12)` },
  ]),
  slices: (c, rnd) => {
    const out: Primitive[] = [];
    for (let i = 0; i < 5; i++) {
      const [x, y] = pol(13, i * 72 + rnd() * 20);
      out.push({ type: 'circle', cx: x + 1.5, cy: y + 2.5, r: 8.5, fill: '#000000', opacity: 0.15 });
      out.push({ type: 'circle', cx: x, cy: y, r: 8.5, fill: rad(c[0], 0.15, -0.2) });
      out.push({ type: 'circle', cx: x, cy: y, r: 5, fill: 'none', stroke: c[1], strokeWidth: 1 });
      out.push({ type: 'circle', cx: x, cy: y, r: 1.4, fill: c[1], opacity: 0.8 });
    }
    return out;
  },
  pool: (c, rnd) => [
    { type: 'path', d: blob(rnd, 34, 12, 0.2), fill: rad(c[0], 0.12, -0.12), opacity: 0.95 },
    { type: 'ellipse', cx: -12, cy: -12, rx: 9, ry: 3.2, fill: '#ffffff', opacity: 0.3, transform: 'rotate(-25 -12 -12)' },
    { type: 'circle', cx: 14, cy: -16, r: 1.6, fill: '#ffffff', opacity: 0.35 },
  ],
  drizzle: (c) => {
    const d1 = 'M-38,-14 C-28,-30 -20,4 -10,-12 C0,-28 6,8 16,-8 C26,-24 32,10 40,-4';
    const d2 = 'M-34,10 C-24,-4 -14,24 -4,8 C6,-6 14,22 26,10';
    return [
      { type: 'path', d: d1, fill: 'none', stroke: '#000000', strokeWidth: 3.6, strokeLinecap: 'round', opacity: 0.12, transform: 'translate(1 2)' },
      { type: 'path', d: d1, fill: 'none', stroke: c[0], strokeWidth: 3.2, strokeLinecap: 'round' },
      { type: 'path', d: d1, fill: 'none', stroke: '#ffffff', strokeWidth: 0.9, strokeLinecap: 'round', opacity: 0.4, transform: 'translate(-0.6 -0.8)' },
      { type: 'path', d: d2, fill: 'none', stroke: c[0], strokeWidth: 2.4, strokeLinecap: 'round', opacity: 0.9 },
    ];
  },
  dots: (c) => Array.from({ length: 9 }, (_, i) => {
    const [x, y] = pol(38, i * 40 + 10);
    const r = 3.2 - (i % 3) * 0.6;
    return [
      { type: 'circle', cx: x + 0.8, cy: y + 1.2, r, fill: '#000000', opacity: 0.15 },
      { type: 'circle', cx: x, cy: y, r, fill: rad(c[0], 0.3, -0.15) },
    ] as Primitive[];
  }).flat(),
  sprinkle: (c, rnd) => Array.from({ length: 36 }, (_, i) => {
    const [x, y] = inDisc(rnd, 30);
    return { type: 'circle', cx: x, cy: y, r: f(0.9 + rnd() * 0.9), fill: c[i % c.length] } as Primitive;
  }),
  herbs: (c, rnd) => Array.from({ length: 13 }, () => {
    const [x, y] = inDisc(rnd, 28);
    return leaf(x, y, 7, 2.4, rnd() * 180, lin(c[0], 0.25, -0.2), shade(c[0], -0.35));
  }).flat(),
  zest: (c, rnd) => Array.from({ length: 16 }, () => {
    const [x, y] = inDisc(rnd, 28);
    return { type: 'path', d: `M${x},${y} q3,-3 6,0`, fill: 'none', stroke: c[0], strokeWidth: 1.4, strokeLinecap: 'round', transform: `rotate(${f(rnd() * 360)} ${x} ${y})` } as Primitive;
  }),
  flowers: (c, rnd) => {
    const out: Primitive[] = [];
    for (let i = 0; i < 6; i++) {
      const [x, y] = inDisc(rnd, 26);
      for (let k = 0; k < 5; k++) {
        const [px, py] = pol(2.6, k * 72);
        out.push({ type: 'circle', cx: f(x + px), cy: f(y + py), r: 2.2, fill: c[i % 2 === 0 ? 0 : 2] ?? c[0] });
      }
      out.push({ type: 'circle', cx: x, cy: y, r: 1.3, fill: c[1] });
    }
    return out;
  },
  crispy: (c, rnd) => Array.from({ length: 16 }, () => {
    const [x, y] = inDisc(rnd, 22);
    return { type: 'path', d: `M${x},${y} a3,3 0 1,1 4,2`, fill: 'none', stroke: lin(c[0], 0.2, -0.25), strokeWidth: 1.9, strokeLinecap: 'round', transform: `rotate(${f(rnd() * 360)} ${x} ${y})` } as Primitive;
  }),
  patty: (c, rnd) => {
    const out: Primitive[] = [
      ...softShadow(19, 1.5, 2.5),
      { type: 'path', d: blob(rnd, 19, 9, 0.1), fill: rad(c[0], 0.18, -0.22) },
    ];
    for (let i = 0; i < 18; i++) {
      const [x, y] = inDisc(rnd, 14);
      out.push({ type: 'circle', cx: x, cy: y, r: 1.2, fill: c[1] });
    }
    return out;
  },
};

/* --------------------------------------------------------- Tattoo-Motive */
const motifs: Record<string, GlyphFn> = {
  rose: (c) => [
    L({ type: 'path', d: 'M0,14 C3,28 -3,38 0,48', stroke: c[0] }),
    F({ type: 'path', d: 'M0,30 C10,20 20,24 24,30 C14,37 6,35 0,30 Z', fill: c[2], stroke: c[0] }),
    F({ type: 'path', d: 'M0,38 C-10,28 -20,32 -24,38 C-14,45 -6,43 0,38 Z', fill: c[2], stroke: c[0] }),
    F({ type: 'path', d: 'M-20,0 C-24,-18 -8,-26 0,-20 C8,-26 24,-18 20,0 C18,14 -18,14 -20,0 Z', fill: c[1], stroke: c[0] }),
    L({ type: 'path', d: 'M-2,-4 a3,3 0 1,1 5,1 a7,7 0 1,1 -12,-1 a11,11 0 1,1 19,3', stroke: c[0] }),
    L({ type: 'path', d: 'M-20,0 C-14,8 -6,10 0,10 C6,10 14,8 20,0', stroke: c[0], strokeWidth: 1.2 }),
    L({ type: 'path', d: 'M-16,-12 C-12,-4 -6,-2 -2,-4', stroke: c[0], strokeWidth: 1 }),
    L({ type: 'path', d: 'M16,-12 C12,-4 6,-2 2,-4', stroke: c[0], strokeWidth: 1 }),
    L({ type: 'line', x1: 4, y1: 32, x2: 18, y2: 30, stroke: c[0], strokeWidth: 0.8 }),
  ],
  swallow: (c) => [
    F({ type: 'path', d: 'M-34,-4 C-24,-14 -6,-14 6,-6 L40,-30 L22,-2 L44,6 L18,8 C6,16 -14,14 -24,6 L-42,10 Z', fill: c[1], stroke: c[0] }),
    F({ type: 'path', d: 'M-8,-8 C-4,-26 8,-38 26,-40 C16,-28 12,-16 6,-6 Z', fill: c[2], stroke: c[0] }),
    { type: 'circle', cx: -26, cy: -4, r: 1.6, fill: c[0] },
    L({ type: 'path', d: 'M-4,-12 C2,-22 10,-30 20,-35', stroke: c[0], strokeWidth: 0.9 }),
    L({ type: 'path', d: 'M0,-9 C6,-17 12,-22 18,-26', stroke: c[0], strokeWidth: 0.9 }),
    L({ type: 'path', d: 'M-30,2 C-18,8 -2,8 10,2', stroke: c[0], strokeWidth: 0.9 }),
  ],
  anchor: (c) => [
    L({ type: 'circle', cx: 0, cy: -38, r: 6, stroke: c[0] }),
    L({ type: 'line', x1: 0, y1: -32, x2: 0, y2: 40, stroke: c[0], strokeWidth: 3 }),
    L({ type: 'line', x1: -16, y1: -22, x2: 16, y2: -22, stroke: c[0], strokeWidth: 3 }),
    L({ type: 'path', d: 'M-30,16 Q-28,40 0,40 Q28,40 30,16', stroke: c[0], strokeWidth: 3 }),
    F({ type: 'polygon', points: '-36,20 -30,8 -24,20', fill: c[1], stroke: c[0] }),
    F({ type: 'polygon', points: '24,20 30,8 36,20', fill: c[1], stroke: c[0] }),
    L({ type: 'path', d: 'M0,-24 C10,-14 -10,-4 0,6 C10,16 -10,26 0,34', stroke: c[2] ?? c[0], strokeWidth: 1.4, strokeDasharray: '2 2' }),
  ],
  moon: (c) => [
    F({ type: 'path', d: 'M10,-36 A36,36 0 1,0 10,36 A28,28 0 1,1 10,-36 Z', fill: c[1], stroke: c[0] }),
    { type: 'circle', cx: 22, cy: -20, r: 1.6, fill: c[0] },
    { type: 'circle', cx: 30, cy: 4, r: 1.2, fill: c[0] },
    L({ type: 'circle', cx: -12, cy: -8, r: 3.5, stroke: c[0], strokeWidth: 0.9 }),
    L({ type: 'circle', cx: -18, cy: 12, r: 2.2, stroke: c[0], strokeWidth: 0.9 }),
    L({ type: 'circle', cx: -4, cy: 22, r: 1.8, stroke: c[0], strokeWidth: 0.9 }),
  ],
  sun: (c) => [
    ...Array.from({ length: 8 }, (_, i) => {
      const len = i % 2 === 0 ? 40 : 31;
      const [x1, y1] = pol(20, i * 45 - 5);
      const [x2, y2] = pol(len, i * 45);
      const [x3, y3] = pol(20, i * 45 + 5);
      return F({ type: 'polygon', points: `${x1},${y1} ${x2},${y2} ${x3},${y3}`, fill: c[2], stroke: c[0] });
    }),
    F({ type: 'circle', cx: 0, cy: 0, r: 17, fill: c[1], stroke: c[0] }),
    L({ type: 'circle', cx: 0, cy: 0, r: 11, stroke: c[0], strokeWidth: 1 }),
    L({ type: 'circle', cx: 0, cy: 0, r: 5, stroke: c[0], strokeWidth: 1 }),
  ],
  mountain: (c) => [
    F({ type: 'polygon', points: '-48,30 -18,-22 0,4 16,-32 48,30', fill: c[1], stroke: c[0] }),
    F({ type: 'polygon', points: '-18,-22 -10,-8 -14,-6 -22,-14', fill: c[2], stroke: c[0], strokeWidth: 1 }),
    F({ type: 'polygon', points: '16,-32 26,-14 20,-10 12,-18 8,-16', fill: c[2], stroke: c[0], strokeWidth: 1 }),
    L({ type: 'line', x1: -50, y1: 30, x2: 50, y2: 30, stroke: c[0] }),
    L({ type: 'circle', cx: -32, cy: -30, r: 6, stroke: c[0] }),
    L({ type: 'path', d: 'M-18,-22 L-24,4 M16,-32 L10,-2 M22,-20 L28,8', stroke: c[0], strokeWidth: 1 }),
    L({ type: 'path', d: 'M-44,24 C-30,20 -20,26 -6,22 M10,26 C22,22 32,26 44,24', stroke: c[0], strokeWidth: 0.9 }),
  ],
  forest: (c) => [-26, 0, 26].flatMap((x, i) => {
    const h = i === 1 ? 10 : 0;
    return [
      F({ type: 'polygon', points: `${x},${-34 - h} ${x + 14},${-6 - h} ${x - 14},${-6 - h}`, fill: c[1], stroke: c[0] }),
      F({ type: 'polygon', points: `${x},${-16 - h} ${x + 18},${18 - h / 2} ${x - 18},${18 - h / 2}`, fill: c[2], stroke: c[0] }),
      L({ type: 'line', x1: x, y1: 18 - h / 2, x2: x, y2: 34, stroke: c[0], strokeWidth: 3 }),
    ];
  }),
  ship: (c) => [
    F({ type: 'path', d: 'M-40,12 L40,12 L28,28 L-30,28 Z', fill: c[1], stroke: c[0] }),
    L({ type: 'line', x1: 0, y1: 12, x2: 0, y2: -40, stroke: c[0], strokeWidth: 2.4 }),
    F({ type: 'polygon', points: '3,-36 30,6 3,6', fill: c[2], stroke: c[0] }),
    F({ type: 'polygon', points: '-3,-28 -26,6 -3,6', fill: c[2], stroke: c[0] }),
    L({ type: 'path', d: 'M-48,38 q8,-6 16,0 t16,0 t16,0 t16,0 t16,0 t16,0', stroke: c[0] }),
  ],
  wave: (c) => [
    F({ type: 'path', d: 'M-46,30 C-42,-6 -8,-34 18,-22 C34,-14 32,8 16,6 C6,5 6,-8 14,-8 C2,-16 -16,-2 -14,30 Z', fill: c[1], stroke: c[0] }),
    L({ type: 'path', d: 'M-30,30 C-28,8 -16,-6 0,-10', stroke: c[2] ?? c[0] }),
    L({ type: 'path', d: 'M-14,30 C10,24 30,28 48,22', stroke: c[0] }),
    L({ type: 'path', d: 'M20,-12 c4,-2 6,2 3,4 M-4,-20 c4,-3 8,0 5,3 M-24,-6 c3,-3 7,-1 5,2', stroke: c[0], strokeWidth: 1 }),
    L({ type: 'path', d: 'M-40,14 C-34,-2 -22,-14 -8,-18', stroke: c[0], strokeWidth: 0.9 }),
  ],
  compass: (c) => [
    L({ type: 'circle', cx: 0, cy: 0, r: 34, stroke: c[0] }),
    L({ type: 'circle', cx: 0, cy: 0, r: 28, stroke: c[0], strokeWidth: 1 }),
    F({ type: 'polygon', points: '0,-22 5,-5 22,0 5,5 0,22 -5,5 -22,0 -5,-5', fill: c[2], stroke: c[0], strokeWidth: 1, transform: 'rotate(45 0 0)' }),
    F({ type: 'polygon', points: '0,-44 8,-8 44,0 8,8 0,44 -8,8 -44,0 -8,-8', fill: c[1], stroke: c[0] }),
    ...Array.from({ length: 16 }, (_, i) => {
      const [x1, y1] = pol(28, i * 22.5);
      const [x2, y2] = pol(i % 4 === 0 ? 23 : 25.5, i * 22.5);
      return L({ type: 'line', x1, y1, x2, y2, stroke: c[0], strokeWidth: 0.9 });
    }),
  ],
  butterfly: (c) => [
    F({ type: 'ellipse', cx: -14, cy: -10, rx: 16, ry: 11, fill: c[1], stroke: c[0], transform: 'rotate(-30 -14 -10)' }),
    F({ type: 'ellipse', cx: 14, cy: -10, rx: 16, ry: 11, fill: c[1], stroke: c[0], transform: 'rotate(30 14 -10)' }),
    F({ type: 'ellipse', cx: -10, cy: 10, rx: 10, ry: 8, fill: c[2], stroke: c[0], transform: 'rotate(20 -10 10)' }),
    F({ type: 'ellipse', cx: 10, cy: 10, rx: 10, ry: 8, fill: c[2], stroke: c[0], transform: 'rotate(-20 10 10)' }),
    F({ type: 'ellipse', cx: 0, cy: 0, rx: 2.5, ry: 16, fill: c[0], stroke: c[0] }),
    L({ type: 'path', d: 'M-1,-15 C-4,-24 -8,-28 -12,-30', stroke: c[0], strokeWidth: 1.2 }),
    L({ type: 'path', d: 'M1,-15 C4,-24 8,-28 12,-30', stroke: c[0], strokeWidth: 1.2 }),
    L({ type: 'ellipse', cx: -15, cy: -11, rx: 7, ry: 4.5, stroke: c[0], strokeWidth: 0.9, transform: 'rotate(-30 -15 -11)' }),
    L({ type: 'ellipse', cx: 15, cy: -11, rx: 7, ry: 4.5, stroke: c[0], strokeWidth: 0.9, transform: 'rotate(30 15 -11)' }),
    { type: 'circle', cx: -10, cy: 11, r: 2, fill: c[0] },
    { type: 'circle', cx: 10, cy: 11, r: 2, fill: c[0] },
  ],
  sparkle: (c) => [
    F({ type: 'polygon', points: '0,-32 6,-6 32,0 6,6 0,32 -6,6 -32,0 -6,-6', fill: c[1], stroke: c[0] }),
    F({ type: 'polygon', points: '24,-30 26,-24 32,-22 26,-20 24,-14 22,-20 16,-22 22,-24', fill: c[2], stroke: c[0], strokeWidth: 1 }),
  ],
  heart: (c) => [
    F({ type: 'path', d: 'M0,30 C-42,4 -30,-32 0,-12 C30,-32 42,4 0,30 Z', fill: c[1], stroke: c[0] }),
    L({ type: 'path', d: 'M-16,-8 C-20,-2 -18,4 -14,8', stroke: c[2] ?? c[0], strokeWidth: 1.5 }),
  ],
  snake: (c) => [
    L({ type: 'path', d: 'M-40,34 C-20,4 22,42 30,10 C38,-14 0,-18 -10,-28 C-16,-36 -4,-44 8,-40', stroke: c[0], strokeWidth: 8, strokeLinecap: 'round' }),
    F({ type: 'path', d: 'M-40,34 C-20,4 22,42 30,10 C38,-14 0,-18 -10,-28 C-16,-36 -4,-44 8,-40', fill: 'none', stroke: c[1], strokeWidth: 4, strokeLinecap: 'round' }),
    F({ type: 'ellipse', cx: 10, cy: -40, rx: 7, ry: 5, fill: c[1], stroke: c[0], transform: 'rotate(-15 10 -40)' }),
    L({ type: 'path', d: 'M17,-42 l6,-2 m-6,2 l6,2', stroke: c[2] ?? c[0], strokeWidth: 1 }),
    ...Array.from({ length: 9 }, (_, i) => ({ type: 'circle', cx: -34 + i * 7, cy: f(28 - Math.sin(i * 0.9) * 10 - i * 2), r: 0.9, fill: c[0] }) as Primitive),
  ],
  feather: (c) => [
    F({ type: 'path', d: 'M-18,38 C-24,10 -6,-26 20,-42 C24,-16 10,22 -18,38 Z', fill: c[1], stroke: c[0] }),
    L({ type: 'path', d: 'M-24,46 C-8,14 6,-16 20,-42', stroke: c[0] }),
    ...[-20, -8, 4, 16].map((y) => L({ type: 'line', x1: f(-6 - y * 0.35), y1: y + 6, x2: f(8 - y * 0.2), y2: y - 2, stroke: c[0], strokeWidth: 1 })),
  ],
  lotus: (c) => [
    F({ type: 'path', d: 'M0,22 C-12,4 -8,-20 0,-34 C8,-20 12,4 0,22 Z', fill: c[1], stroke: c[0] }),
    F({ type: 'path', d: 'M-2,22 C-24,16 -34,-4 -30,-16 C-16,-10 -6,4 -2,22 Z', fill: c[2], stroke: c[0] }),
    F({ type: 'path', d: 'M2,22 C24,16 34,-4 30,-16 C16,-10 6,4 2,22 Z', fill: c[2], stroke: c[0] }),
    L({ type: 'path', d: 'M-38,24 C-20,30 20,30 38,24', stroke: c[0] }),
    L({ type: 'line', x1: 0, y1: 16, x2: 0, y2: -24, stroke: c[0], strokeWidth: 0.9 }),
    L({ type: 'path', d: 'M-4,18 C-16,12 -24,0 -24,-8 M4,18 C16,12 24,0 24,-8', stroke: c[0], strokeWidth: 0.9 }),
  ],
  plane: (c) => [
    F({ type: 'polygon', points: '-30,6 38,-24 6,30 0,12', fill: c[1], stroke: c[0] }),
    L({ type: 'line', x1: 0, y1: 12, x2: 38, y2: -24, stroke: c[0], strokeWidth: 1.2 }),
    L({ type: 'path', d: 'M-34,14 C-40,26 -30,34 -44,44', stroke: c[0], strokeWidth: 1.4, strokeDasharray: '3 3' }),
  ],
};

/* ------------------------------------------------------- Rahmen/Ornamente */
const frames: Record<string, GlyphFn> = {
  ring: (c) => [L({ type: 'circle', cx: 0, cy: 0, r: 48, stroke: c[0] })],
  dotRing: (c) => [L({ type: 'circle', cx: 0, cy: 0, r: 48, stroke: c[0], strokeWidth: 3, strokeDasharray: '0.5 6', strokeLinecap: 'round' })],
  diamond: (c) => [L({ type: 'polygon', points: '0,-52 52,0 0,52 -52,0', stroke: c[0] })],
  hexagon: (c) => [L({ type: 'polygon', points: Array.from({ length: 6 }, (_, i) => pol(50, i * 60 - 90).join(',')).join(' '), stroke: c[0] })],
  laurel: (c) => {
    const out: Primitive[] = [];
    for (const side of [-1, 1]) {
      for (let a = 115; a <= 245; a += 18) {
        const deg = side === -1 ? a : 180 - a;
        const [x, y] = pol(46, deg);
        out.push(F({ type: 'ellipse', cx: x, cy: y, rx: 7, ry: 3, fill: c[2] ?? c[1], stroke: c[0], strokeWidth: 1, transform: `rotate(${f(deg + 90 + side * 25)} ${x} ${y})` }));
      }
    }
    return out;
  },
  sunburst: (c) => Array.from({ length: 24 }, (_, i) => {
    const [x1, y1] = pol(46, i * 15);
    const [x2, y2] = pol(i % 2 ? 52 : 56, i * 15);
    return L({ type: 'line', x1, y1, x2, y2, stroke: c[0], strokeWidth: 1.6 });
  }),
  ornament: (c) => [
    L({ type: 'circle', cx: 0, cy: 0, r: 46, stroke: c[0] }),
    L({ type: 'circle', cx: 0, cy: 0, r: 53, stroke: c[0], strokeWidth: 1 }),
    ...Array.from({ length: 12 }, (_, i) => {
      const [x, y] = pol(49.5, i * 30);
      return F({ type: 'circle', cx: x, cy: y, r: 2.4, fill: c[1], stroke: c[0], strokeWidth: 0.8 });
    }),
  ],
  squareFrame: (c) => [
    L({ type: 'rect', x: -48, y: -48, width: 96, height: 96, stroke: c[0] }),
    ...[[-48, -48], [48, -48], [-48, 48], [48, 48]].map(([x, y]) => F({ type: 'rect', x: x - 4, y: y - 4, width: 8, height: 8, fill: c[1], stroke: c[0], strokeWidth: 1 })),
  ],
};

/* ------------------------------------------------ Stil-Unterlagen (Tattoo) */
const styleLayers: Record<string, GlyphFn> = {
  splash: (c, rnd) => Array.from({ length: 7 }, (_, i) => {
    const [x, y] = inDisc(rnd, 26);
    return { type: 'path', d: blob(rnd, 12 + rnd() * 12, 9, 0.4, x, y), fill: c[i % 2 === 0 ? 0 : 1], opacity: 0.28 } as Primitive;
  }),
  geoLines: (c) => [
    { type: 'polygon', points: Array.from({ length: 6 }, (_, i) => pol(44, i * 60 - 90).join(',')).join(' '), fill: 'none', stroke: c[0], strokeWidth: 0.8, opacity: 0.55 },
    { type: 'polygon', points: [0, 120, 240].map((a) => pol(44, a - 90).join(',')).join(' '), fill: 'none', stroke: c[0], strokeWidth: 0.8, opacity: 0.55 },
    { type: 'polygon', points: [60, 180, 300].map((a) => pol(44, a - 90).join(',')).join(' '), fill: 'none', stroke: c[0], strokeWidth: 0.8, opacity: 0.55 },
  ],
  dotHalo: (c, rnd) => Array.from({ length: 70 }, () => {
    const a = rnd() * 360;
    const [x, y] = pol(34 + rnd() * 14, a);
    return { type: 'circle', cx: x, cy: y, r: f(0.6 + rnd() * 0.9), fill: c[0], opacity: 0.6 } as Primitive;
  }),
  hatch: (c, rnd) => Array.from({ length: 26 }, () => {
    const [x, y] = inDisc(rnd, 38);
    return { type: 'line', x1: x, y1: y, x2: f(x + 6), y2: f(y - 6), stroke: c[0], strokeWidth: 0.7, opacity: 0.35 } as Primitive;
  }),
};

export const GLYPHS: Record<string, GlyphFn> = { ...food, ...motifs, ...frames, ...styleLayers };

export function glyphNames(): string[] {
  return Object.keys(GLYPHS);
}

export function drawGlyph(name: string, colors: string[], rnd: Rnd): Primitive[] {
  const fn = GLYPHS[name];
  if (!fn) throw new Error(`Unbekannte Form "${name}"`);
  return fn(colors, rnd);
}
