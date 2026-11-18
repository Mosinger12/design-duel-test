import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { badgesFor } from '../../engine/visibility';
import type { CommercialFields, Tier } from '../../engine/types';
import type { TFunction } from '../../i18n';
import { colors } from '../theme';

/**
 * Kennzeichnungen. Gesponserte Inhalte zeigen IMMER "Sponsored" – unabhängig vom Sponsor-Label.
 */
export function Badges({ item, t, compact = false }: { item: CommercialFields & { tier?: Tier }; t: TFunction; compact?: boolean }) {
  const badges = badgesFor(item);
  if (!badges.length) return null;
  return (
    <View style={styles.row}>
      {badges.map((b) =>
        b.kind === 'sponsored' ? (
          <View key="s" style={[styles.badge, { backgroundColor: colors.sponsored }]} testID="badge-sponsored" accessibilityRole="text">
            <Text style={styles.text}>{t(b.textKey)}</Text>
            {!compact && b.label ? <Text style={styles.sub}>{` · ${b.label}`}</Text> : null}
          </View>
        ) : (
          <View key="p" style={[styles.badge, { backgroundColor: colors.premium }]} testID="badge-premium">
            <Text style={styles.text}>{t(b.textKey)}</Text>
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  badge: { flexDirection: 'row', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  text: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sub: { color: '#fff', fontSize: 11 },
});
