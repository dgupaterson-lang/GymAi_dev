import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from './Icon';
import PressableScale from './PressableScale';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Action de retour custom ; défaut = router.back(). */
  onBack?: () => void;
  /** Masque le bouton retour (écrans racine d'onglet). */
  hideBack?: boolean;
  /** Élément aligné à droite (ex. bouton +). */
  right?: React.ReactNode;
}

/** En-tête commun aux écrans programmes/coach : retour + titre + sous-titre. */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  hideBack = false,
  right,
}: ScreenHeaderProps) {
  const { c } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {!hideBack ? (
          <PressableScale
            onPress={onBack ?? (() => router.back())}
            style={styles.back}
            hitSlop={8}
          >
            <Icon name="arrow_back" size={22} color={c.txt} />
          </PressableScale>
        ) : null}
        <Text style={[styles.title, { color: c.txt }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: c.muted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { padding: 4, marginLeft: -4 },
  title: { flex: 1, fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.6 },
  right: { minWidth: 0 },
  subtitle: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19 },
});

export default ScreenHeader;
