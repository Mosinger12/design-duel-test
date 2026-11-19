import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { filterVisible } from '../../engine/visibility';
import { useApp } from '../AppContext';
import { Header, Stars } from '../components/Basics';
import { BriefInfo } from '../components/BriefInfo';
import type { Nav } from '../nav';
import { colors, radius } from '../theme';

export function Briefs({ nav }: { nav: Nav }) {
  const { t, theme, state, visibility } = useApp();
  const briefs = filterVisible(theme.briefs, visibility);
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Header title={t('briefs.title')} onBack={() => nav({ name: 'home' })} backLabel={t('common.back')} />
      {briefs.map((b) => {
        const best = state.best[`${theme.manifest.id}:${b.id}`] ?? 0;
        return (
          <Pressable key={b.id} testID={`brief-${b.id}`} accessibilityRole="button" onPress={() => nav({ name: 'play', briefId: b.id })} style={styles.card}>
            <BriefInfo brief={b} theme={theme} t={t} full={false} />
            <View style={styles.bestRow}>
              {best > 0 ? <Stars n={best} size={16} /> : <Text style={styles.new}>{t('briefs.new')}</Text>}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 10, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: 14, borderWidth: 1, borderColor: colors.line },
  bestRow: { marginTop: 6 },
  new: { color: colors.accent, fontWeight: '700', fontSize: 12 },
});
