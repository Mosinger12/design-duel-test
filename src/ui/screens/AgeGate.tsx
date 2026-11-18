import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppContext';
import { Button, Card } from '../components/Basics';
import { colors } from '../theme';

export function AgeGate() {
  const { t, update } = useApp();
  const [declined, setDeclined] = useState(false);
  return (
    <View style={styles.wrap}>
      <Card style={{ gap: 14 }}>
        <Text style={styles.title}>{t('age.title')}</Text>
        <Text style={styles.body}>{declined ? t('age.declined') : t('age.body')}</Text>
        {!declined ? (
          <>
            <Button title={t('age.confirm')} testID="age-confirm" onPress={() => update((s) => ({ ...s, settings: { ...s.settings, ageConfirmed: true } }))} />
            <Button title={t('age.decline')} kind="secondary" onPress={() => setDeclined(true)} />
          </>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  body: { fontSize: 16, color: colors.muted, lineHeight: 22 },
});
