import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { evaluate } from '../../engine/scoring';
import type { Composition } from '../../engine/types';
import { buildScene } from '../../render/scene';
import { Scene } from '../../render/Scene';
import { addToCollection } from '../../storage/store';
import { useApp } from '../AppContext';
import { Button, Card, Header, Stars } from '../components/Basics';
import type { Nav } from '../nav';
import { colors } from '../theme';

export function Result({ nav, composition }: { nav: Nav; composition: Composition }) {
  const { t, theme, update } = useApp();
  const { width } = useWindowDimensions();
  const brief = theme.briefs.find((b) => b.id === composition.briefId)!;
  const ev = useMemo(() => evaluate(theme, brief, composition.selection), [theme, brief, composition]);
  const scene = useMemo(() => buildScene(theme, composition), [theme, composition]);
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current || !ev.complete) return;
    saved.current = true;
    update((s) => addToCollection(s, composition, ev.stars));
  }, [ev, composition, update]);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Header title={t('result.title')} onBack={() => nav({ name: 'briefs' })} backLabel={t('common.back')} />
      <Text style={styles.brief}>{t(`brief.${brief.id}.title`)}</Text>
      <View style={styles.sceneWrap}><Scene data={scene} size={Math.min(width - 32, 420)} /></View>
      <View style={styles.center} testID="result-stars" accessibilityLabel={t('common.stars', { n: ev.stars })}>
        <Stars n={ev.stars} size={34} />
        <Text style={styles.summary}>{t(ev.summaryKey)}</Text>
      </View>
      <Card style={{ gap: 10 }}>
        <Text style={styles.why}>{t('result.why')}</Text>
        {ev.reasons.map((r) => {
          const icon = r.score >= 1 ? '✓' : r.score > 0 ? '~' : '✗';
          const c = r.score >= 1 ? colors.good : r.score > 0 ? colors.ok : colors.bad;
          return (
            <View key={r.ruleId} style={styles.reason} testID={`reason-${r.ruleId}`}>
              <Text style={[styles.icon, { color: c }]}>{icon}</Text>
              <Text style={styles.reasonText}>{t(r.textKey, r.params)}</Text>
            </View>
          );
        })}
      </Card>
      <Text style={styles.saved}>{t('result.saved')}</Text>
      <Button title={t('result.again')} kind="secondary" onPress={() => nav({ name: 'play', briefId: brief.id, from: composition })} />
      <Button title={t('result.next')} testID="result-next" onPress={() => nav({ name: 'briefs' })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 10, paddingBottom: 48 },
  brief: { fontSize: 16, color: colors.muted, fontWeight: '600' },
  sceneWrap: { alignItems: 'center' },
  center: { alignItems: 'center', gap: 4 },
  summary: { fontSize: 17, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  why: { fontSize: 15, fontWeight: '800', color: colors.ink },
  reason: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  icon: { fontSize: 18, fontWeight: '900', width: 20, textAlign: 'center' },
  reasonText: { flex: 1, fontSize: 14, color: colors.ink, lineHeight: 20 },
  saved: { textAlign: 'center', color: colors.good, fontWeight: '600' },
});
