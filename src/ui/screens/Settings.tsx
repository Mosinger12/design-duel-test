import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { FLAG_NAMES, setFlag } from '../../config/featureFlags';
import { LANGUAGES } from '../../i18n';
import { defaultState } from '../../storage/store';
import { getTheme, THEME_IDS } from '../../themes';
import { useApp } from '../AppContext';
import { Button, Card, Chip, Header } from '../components/Basics';
import type { Nav } from '../nav';
import { colors } from '../theme';

export function Settings({ nav }: { nav: Nav }) {
  const { t, state, update, flags } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const set = (patch: Partial<typeof state.settings>) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Header title={t('settings.title')} onBack={() => nav({ name: 'home' })} backLabel={t('common.back')} />
      <Card>
        <Text style={styles.label}>{t('settings.theme')}</Text>
        <View style={styles.row}>
          {THEME_IDS.map((id) => {
            const name = getTheme(id).i18n[state.settings.lang]['theme.name'];
            return <Chip key={id} label={name} active={state.settings.themeId === id} onPress={() => set({ themeId: id })} testID={`theme-${id}`} />;
          })}
        </View>
        <Text style={styles.label}>{t('settings.language')}</Text>
        <View style={styles.row}>
          {LANGUAGES.map((l) => <Chip key={l} label={t(`settings.lang.${l}`)} active={state.settings.lang === l} onPress={() => set({ lang: l })} testID={`lang-${l}`} />)}
        </View>
      </Card>

      <Card style={{ gap: 6 }}>
        <Text style={styles.label}>{t('settings.flags')}</Text>
        {FLAG_NAMES.map((f) => (
          <View key={f} style={styles.flagRow}>
            <Text style={styles.flagName}>{t(`flag.${f}`)}</Text>
            <Text style={{ color: flags[f] ? colors.bad : colors.good, fontWeight: '700' }}>{flags[f] ? t('settings.flag.on') : t('settings.flag.off')}</Text>
          </View>
        ))}
        <Text style={styles.note}>{t('settings.privacy')}</Text>
      </Card>

      {__DEV__ ? (
        <Card style={{ gap: 6 }}>
          <Text style={styles.label}>{t('settings.dev')}</Text>
          <View style={styles.flagRow}>
            <Text style={styles.flagName}>{t('settings.devSponsored')}</Text>
            <Switch value={flags.sponsoredContent} onValueChange={(v) => setFlag('sponsoredContent', v)} testID="dev-sponsored" />
          </View>
        </Card>
      ) : null}

      <Button
        kind="secondary"
        title={confirm ? t('settings.resetConfirm') : t('settings.reset')}
        onPress={() => {
          if (!confirm) { setConfirm(true); setDone(false); return; }
          const keep = state.settings;
          update(() => ({ ...defaultState(), settings: keep }));
          setConfirm(false);
          setDone(true);
        }}
      />
      {done ? <Text style={styles.note}>{t('settings.resetDone')}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 8, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  flagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  flagName: { color: colors.ink, fontSize: 14 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
