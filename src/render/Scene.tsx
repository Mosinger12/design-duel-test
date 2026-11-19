import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { Primitive } from '../engine/types';
import type { SceneData } from './scene';
import { withGradients } from './gradients';

/** Zeichnet ein einzelnes Grundelement. Es gibt bewusst kein Text-Element. */
export function Prim({ p }: { p: Primitive }) {
  const paint = {
    fill: p.fill ?? 'none',
    stroke: p.stroke,
    strokeWidth: p.strokeWidth,
    opacity: p.opacity,
    fillOpacity: p.fillOpacity,
    strokeDasharray: p.strokeDasharray,
    strokeLinecap: p.strokeLinecap,
    strokeLinejoin: 'round' as const,
    transform: p.transform,
  };
  switch (p.type) {
    case 'circle': return <Circle cx={p.cx} cy={p.cy} r={p.r} {...paint} />;
    case 'ellipse': return <Ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} {...paint} />;
    case 'rect': return <Rect x={p.x} y={p.y} width={p.width} height={p.height} rx={p.rx} {...paint} />;
    case 'path': return <Path d={p.d} {...paint} />;
    case 'polygon': return <Polygon points={p.points} {...paint} />;
    case 'line': return <Line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} {...paint} />;
    default: return null;
  }
}

export function Scene({ data, size, lite = false, testID }: { data: SceneData; size: number; lite?: boolean; testID?: string }) {
  const { filter } = data;
  const vid = `vig-${filter.id}`;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${data.width} ${data.height}`} testID={testID}>
      {filter.vignette ? (
        <Defs>
          <RadialGradient id={vid} cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0.55" stopColor={filter.vignette.color} stopOpacity={0} />
            <Stop offset="1" stopColor={filter.vignette.color} stopOpacity={filter.vignette.opacity} />
          </RadialGradient>
        </Defs>
      ) : null}
      {data.layers.map((layer) => {
        const g = withGradients(layer.prims, 'g');
        return (
          <G key={layer.key} transform={layer.transform} opacity={layer.opacity}>
            {g.defs}
            {g.prims.map((p, i) => <Prim key={i} p={p} />)}
          </G>
        );
      })}
      {filter.tint ? <Rect x={0} y={0} width={data.width} height={data.height} fill={filter.tint.color} opacity={filter.tint.opacity} /> : null}
      {filter.haze ? <Rect x={0} y={0} width={data.width} height={data.height} fill={filter.haze.color} opacity={filter.haze.opacity} /> : null}
      {!lite && data.grain.length ? <G>{data.grain.map((p, i) => <Prim key={i} p={p} />)}</G> : null}
      {filter.vignette ? <Rect x={0} y={0} width={data.width} height={data.height} fill={`url(#${vid})`} /> : null}
    </Svg>
  );
}
