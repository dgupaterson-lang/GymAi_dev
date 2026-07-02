import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from './ui/Icon';

/** Écran placeholder générique (Séance / Coach) pour le Sprint 0. */
export function ScreenPlaceholder({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: c.surface2, shadowColor: c.accent, borderColor: c.line },
        ]}
      >
        <Icon name={icon} size={34} color={c.accent} />
      </View>
      <Text style={[styles.title, { color: c.txt }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: c.muted }]}>{subtitle}</Text>
      <View style={[styles.badge, { backgroundColor: c.accentDim }]}>
        <Text style={[styles.badgeTxt, { color: c.accent }]}>Bientôt disponible</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  title: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  badge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, marginTop: 4 },
  badgeTxt: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.5 },
});

export default ScreenPlaceholder;
