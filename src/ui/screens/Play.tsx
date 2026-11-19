import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { evaluate, resolveParts } from '../../engine/scoring';
import type { Composition, Selection } from '../../engine/types';
import { filterVisible } from '../../engine/visibility';
import { buildScene, collectVars } from '../../render/scene';
import { Scene } from '../../render/Scene';
import { pickOrder } from '../../themes';
import { useApp } from '../AppContext';
import { Button, Card, Chip, Header } from '../components/Basics';
import { BriefInfo } from '../components/BriefInfo';
import { NoneChip, PartChip } from '../components/PartChip';
import type { Nav } from '../nav';
import { colors } from '../theme';

export function Play({ nav, briefId, from }: { nav: Nav; briefId: string; from?: Composition }) {
  const { t, theme, visibility, flags } = useApp();
  const { width } = useWindowDimensions();
  const brief = theme.briefs.find((b) => b.id === briefId);
  const m = theme.manifest;
  const [selection, setSelection] = useState<Selection>(from?.selection ?? {});
  const [filter, setFilter] = useState<string>(from?.filter ?? 'none');
  const [options, setOptions] = useState<Record<string, string>>(
    from?.options ?? Object.fromEntries((m.options ?? []).map((o) => [o.id, o.values[0]?.id])),
  );
  const parts = useMemo(() => filterVisible(theme.parts, visibility), [theme, visibility]);
  if (!brief) return null;

  const comp: Composition = { themeId: m.id, briefId, selection, filter, options };
  const scene = buildScene(theme, comp);
  const vars = collectVars(theme, resolveParts(theme, selection), options);
  const ev = evaluate(theme, brief, selection);
  const size = Math.min(width - 32, 420);
  const slotById = new Map(m.slots.map((s) => [s.id, s]));

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Header title={t('play.requirements')} onBack={() => nav({ name: 'briefs' })} backLabel={t('common.back')} />
      <Card><BriefInfo brief={brief} theme={theme} t={t} /></Card>
      <View style={styles.sceneWrap}><Scene data={scene} size={size} testID="scene" /></View>

      <Text style={styles.label}>{t('play.filter')}</Text>
      <View style={styles.row}>
        {m.filters.map((f) => <Chip key={f} label={t(`filter.${f}`)} active={filter === f} onPress={() => setFilter(f)} testID={`filter-${f}`} />)}
      </View>

      {(m.options ?? []).map((o) => (
        <View key={o.id}>
          <Text style={styles.label}>{t(`option.${o.id}`)}</Text>
          <View style={styles.row}>
            {o.values.map((v) => (
              <View key={v.id} style={[styles.swatchWrap, options[o.id] === v.id && styles.swatchActive]}>
                <Pressable accessibilityRole="button" accessibilityLabel={t(`option.${o.id}.${v.id}`)} testID={`option-${v.id}`}
                  onPress={() => setOptions({ ...options, [o.id]: v.id })} style={[styles.swatch, { backgroundColor: v.color }]} />
              </View>
            ))}
          </View>
        </View>
      ))}

      {pickOrder(theme).map((slotId) => {
        const slot = slotById.get(slotId)!;
        const list = parts.filter((p) => p.slot === slotId);
        return (
          <View key={slotId}>
            <Text style={styles.label}>{t('play.choose', { slot: t(`slot.${slotId}`) })}{slot.required ? ' *' : ''}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {!slot.required ? <NoneChip label={t('common.none')} selected={!selection[slotId]} onPress={() => setSelection({ ...selection, [slotId]: null })} /> : null}
              {list.map((p) => (
                <PartChip key={p.id} part={p} t={t} vars={vars}
                  selected={selection[slotId] === p.id}
                  locked={p.tier === 'premium' && !flags.iap}
                  onPress={() => setSelection({ ...selection, [slotId]: p.id })} />
              ))}
            </ScrollView>
          </View>
        );
      })}
      <Text style={styles.hint}>{t('play.premiumHint')}</Text>

      {!ev.complete ? <Text style={styles.missing}>{t('play.missing', { slots: ev.missingSlots.map((s) => t(`slot.${s}`)).join(', ') })}</Text> : null}
      <Button title={t('play.rate')} disabled={!ev.complete} testID="rate" onPress={() => nav({ name: 'result', composition: comp })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 8, paddingBottom: 48 },
  sceneWrap: { alignItems: 'center', marginVertical: 8 },
  label: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 8, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  hint: { fontSize: 12, color: colors.muted, marginTop: 6 },
  missing: { color: colors.bad, marginTop: 6 },
  swatchWrap: { borderRadius: 999, padding: 3, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: colors.accent },
  swatch: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },
});
