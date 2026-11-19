import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { filterVisible } from '../../engine/visibility';
import { buildScene } from '../../render/scene';
import { Scene } from '../../render/Scene';
import { useApp } from '../AppContext';
import { Button } from '../components/Basics';
import type { Nav } from '../nav';
import { colors } from '../theme';

export function Home({ nav }: { nav: Nav }) {
  const { t, theme, state, visibility } = useApp();
  const briefs = filterVisible(theme.briefs, visibility);
  const done = briefs.filter((b) => (state.best[`${theme.manifest.id}:${b.id}`] ?? 0) > 0).length;
  const last = state.collection.find((e) => e.composition.themeId === theme.manifest.id);
  const hero = useMemo(() => (last ? buildScene(theme, last.composition) : null), [last, theme]);
  return (
    <View style={styles.wrap}>
      <Text style={styles.app}>{t('app.name')}</Text>
      <Text style={styles.title}>{t('theme.name')}</Text>
      <Text style={styles.tag}>{t('theme.tagline')}</Text>
      {hero ? <View style={styles.hero}><Scene data={hero} size={200} lite /></View> : null}
      <Text style={styles.progress}>{t('home.progress', { done, total: briefs.length })}</Text>
      <View style={{ gap: 10, marginTop: 12 }}>
        <Button title={t('home.play')} testID="home-play" onPress={() => nav({ name: 'briefs' })} />
        <Button title={t('home.collection')} kind="secondary" testID="home-collection" onPress={() => nav({ name: 'collection' })} />
        <Button title={t('home.settings')} kind="secondary" testID="home-settings" onPress={() => nav({ name: 'settings' })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 20 },
  app: { fontSize: 14, fontWeight: '700', color: colors.accent, letterSpacing: 2, textTransform: 'uppercase' },
  title: { fontSize: 34, fontWeight: '900', color: colors.ink, marginTop: 4 },
  tag: { fontSize: 16, color: colors.muted, marginTop: 6, lineHeight: 22 },
  hero: { alignItems: 'center', marginTop: 18 },
  progress: { marginTop: 18, color: colors.muted },
});
