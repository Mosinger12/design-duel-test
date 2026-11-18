import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

export function Button({ title, onPress, disabled, kind = 'primary', testID, style }: {
  title: string; onPress: () => void; disabled?: boolean; kind?: 'primary' | 'secondary'; testID?: string; style?: ViewStyle;
}) {
  const primary = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: primary ? colors.accent : colors.card, borderColor: primary ? colors.accent : colors.line, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: primary ? colors.accentInk : colors.ink }]}>{title}</Text>
    </Pressable>
  );
}

export function Stars({ n, size = 22 }: { n: number; size?: number }) {
  return (
    <Text style={{ fontSize: size, color: '#E0A526', letterSpacing: 2 }} accessibilityLabel={`${n}/5`}>
      {'★'.repeat(n)}
      <Text style={{ color: '#D8D2C6' }}>{'★'.repeat(5 - n)}</Text>
    </Text>
  );
}

export function Header({ title, onBack, backLabel }: { title: string; onBack?: () => void; backLabel: string }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" style={styles.back} testID="back">
          <Text style={styles.backText}>‹ {backLabel}</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ label, active, onPress, testID }: { label: string; active?: boolean; onPress: () => void; testID?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" testID={testID}
      style={[styles.chip, { backgroundColor: active ? colors.ink : colors.card, borderColor: active ? colors.ink : colors.line }]}>
      <Text style={{ color: active ? '#fff' : colors.ink, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: radius, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700' },
  header: { paddingTop: 8, paddingBottom: 12 },
  back: { paddingVertical: 6, alignSelf: 'flex-start' },
  backText: { color: colors.accent, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: 14, borderWidth: 1, borderColor: colors.line },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
});
