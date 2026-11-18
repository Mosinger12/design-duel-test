import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildScene } from '../../render/scene';
import { Scene } from '../../render/Scene';
import { useApp } from '../AppContext';
import { Header, Stars } from '../components/Basics';
import type { Nav } from '../nav';
import { colors } from '../theme';

export function Collection({ nav }: { nav: Nav }) {
  const { t, theme, state } = useApp();
  const entries = state.collection.filter((e) => e.composition.themeId === theme.manifest.id && theme.briefs.some((b) => b.id === e.composition.briefId));
  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString(state.settings.lang === 'de' ? 'de-DE' : 'en-GB');
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Header title={t('collection.title')} onBack={() => nav({ name: 'home' })} backLabel={t('common.back')} />
      <Text style={styles.count}>{t('collection.count', { n: entries.length })}</Text>
      {entries.length === 0 ? <Text style={styles.empty}>{t('collection.empty')}</Text> : null}
      <View style={styles.grid}>
        {entries.map((e) => (
          <Pressable key={e.id} style={styles.item} testID="collection-item" accessibilityRole="button"
            onPress={() => nav({ name: 'result', composition: e.composition })}>
            <Scene data={buildScene(theme, e.composition)} size={150} lite />
            <Text style={styles.title} numberOfLines={1}>{t(`brief.${e.composition.briefId}.title`)}</Text>
            <Stars n={e.stars} size={14} />
            <Text style={styles.date}>{dateFmt(e.createdAt)}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40 },
  count: { color: colors.muted, marginBottom: 10 },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: { width: 166, backgroundColor: colors.card, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center', gap: 3 },
  title: { fontSize: 13, fontWeight: '700', color: colors.ink },
  date: { fontSize: 11, color: colors.muted },
});
