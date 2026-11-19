import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Brief, Theme } from '../../engine/types';
import { capitalize, type TFunction } from '../../i18n';
import { colors } from '../theme';
import { Badges } from './Badges';

export function BriefInfo({ brief, theme, t, full = true }: { brief: Brief; theme: Theme; t: TFunction; full?: boolean }) {
  const fields = theme.manifest.contextFields ?? [];
  return (
    <View style={{ gap: 6 }}>
      <Badges item={brief} t={t} />
      <Text style={styles.title}>{t(`brief.${brief.id}.title`)}</Text>
      {full ? <Text style={styles.desc}>{t(`brief.${brief.id}.desc`)}</Text> : null}
      <View style={styles.row}>
        {fields.filter((f) => brief.context?.[f]).map((f) => (
          <View key={f} style={styles.ctx}><Text style={styles.ctxText}>{capitalize(t(`context.${f}.${brief.context![f]}`))}</Text></View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  desc: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ctx: { backgroundColor: colors.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.line },
  ctxText: { fontSize: 12, color: colors.ink, fontWeight: '600' },
});
