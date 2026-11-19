import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import type { Part } from '../../engine/types';
import { drawGlyph } from '../../render/glyphs';
import { hashString, rng } from '../../render/random';
import { Prim } from '../../render/Scene';
import { resolvePaint, withGradients } from '../../render/gradients';
import type { TFunction } from '../../i18n';
import { colors } from '../theme';
import { Badges } from './Badges';

function resolve<T extends string | undefined>(c: T, vars: Record<string, string>): T {
  return resolvePaint(c, (x) => vars[x.slice(1)] ?? '#888') as T;
}

/** Kleine Vorschau eines Teils (nur im Code erzeugte Formen). */
export function PartPreview({ part, vars, size = 48 }: { part: Part; vars: Record<string, string>; size?: number }) {
  const v = part.visual;
  if (v.glyph) {
    const raw = drawGlyph(v.glyph, (v.colors ?? ['#888']).map((c) => resolve(c, vars)), rng(v.seed ?? hashString(part.id)))
      .map((p) => ({ ...p, fill: resolve(p.fill, vars), stroke: resolve(p.stroke, vars) }));
    const g = withGradients(raw, 'g');
    return (
      <Svg width={size} height={size} viewBox="-55 -55 110 110">
        {g.defs}
        <G>{g.prims.map((p, i) => <Prim key={i} p={p} />)}</G>
      </Svg>
    );
  }
  if (v.vars) {
    const vals = Object.values(v.vars);
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48">
        {vals.map((c, i) => <Circle key={i} cx={14 + i * 10} cy={24} r={9} fill={c} stroke="#fff" strokeWidth={1.5} />)}
      </Svg>
    );
  }
  const sw = 2 * (v.style?.strokeScale ?? 1);
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Line x1={8} y1={36} x2={40} y2={12} stroke={vars.ink ?? '#222'} strokeWidth={sw} strokeDasharray={v.style?.dash} strokeLinecap={v.style?.linecap ?? 'round'} />
    </Svg>
  );
}

export function PartChip({ part, selected, locked, onPress, t, vars }: {
  part: Part; selected: boolean; locked: boolean; onPress: () => void; t: TFunction; vars: Record<string, string>;
}) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: locked }}
      testID={`part-${part.id}`}
      style={[styles.chip, { borderColor: selected ? colors.accent : colors.line, borderWidth: selected ? 2 : 1, opacity: locked ? 0.55 : 1 }]}
    >
      <View style={styles.preview}><PartPreview part={part} vars={vars} /></View>
      <Text style={styles.name} numberOfLines={2}>{t(`part.${part.id}`)}</Text>
      <Badges item={part} t={t} compact />
      {locked ? <Text style={styles.locked}>🔒 {t('common.locked')}</Text> : null}
    </Pressable>
  );
}

export function NoneChip({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" testID="part-none"
      style={[styles.chip, { borderColor: selected ? colors.accent : colors.line, borderWidth: selected ? 2 : 1, justifyContent: 'center' }]}>
      <Text style={[styles.name, { color: colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { width: 96, minHeight: 112, backgroundColor: colors.card, borderRadius: 12, padding: 6, marginRight: 8, alignItems: 'center', gap: 4 },
  preview: { height: 50, justifyContent: 'center' },
  name: { fontSize: 12, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  locked: { fontSize: 10, color: colors.muted },
});
