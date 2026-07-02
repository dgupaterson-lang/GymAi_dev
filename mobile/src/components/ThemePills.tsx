import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type ThemeMode } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from './ui/Icon';
import PressableScale from './ui/PressableScale';

const OPTS: { key: ThemeMode; label: string; icon: string }[] = [
  { key: 'dark', label: 'Sombre', icon: 'dark_mode' },
  { key: 'rose', label: 'Rose', icon: 'favorite' },
];

/**
 * Sélecteur d'ambiance (Sombre / Rose) — porté de web/src/screens/ThemePills.tsx.
 * Ajoute un 3e pavé « Couleur » qui ouvre le color picker (accessible depuis
 * Welcome et Profil, comme demandé au brief).
 */
export function ThemePills({ onOpenPicker }: { onOpenPicker?: () => void }) {
  const { c, mode, setModeWithDefaultAccent } = useTheme();

  return (
    <View style={styles.row}>
      {OPTS.map(({ key, label, icon }) => {
        const active = mode === key;
        return (
          <PressableScale
            key={key}
            onPress={() => setModeWithDefaultAccent(key)}
            style={[
              styles.pill,
              {
                borderColor: active ? c.accent : c.line,
                backgroundColor: active ? c.accentDim : c.surface,
              },
            ]}
          >
            <Icon name={icon} size={18} color={active ? c.accent : c.muted} />
            <Text style={[styles.pillTxt, { color: active ? c.accent : c.muted }]}>
              {label}
            </Text>
          </PressableScale>
        );
      })}

      {onOpenPicker ? (
        <PressableScale
          onPress={onOpenPicker}
          style={[styles.pill, { borderColor: c.line, backgroundColor: c.surface }]}
        >
          <Icon name="palette" size={18} color={c.accent} />
          <Text style={[styles.pillTxt, { color: c.muted }]}>Couleur</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  pillTxt: { fontFamily: fonts.display, fontSize: 13.5 },
});

export default ThemePills;
