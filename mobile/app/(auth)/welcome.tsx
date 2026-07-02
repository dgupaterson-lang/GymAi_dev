import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import Stripes from '@/components/ui/Stripes';
import ThemePills from '@/components/ThemePills';

/**
 * Écran Welcome porté depuis web/src/screens/Welcome.tsx — mêmes textes FR,
 * mêmes couleurs (via le thème), fond rayé + dégradé vers le fond.
 */
export default function Welcome() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      {/* Fond rayé (équiv. repeating-linear-gradient) */}
      <Stripes color1={c.ph2} color2={c.ph3} style={StyleSheet.absoluteFill} />

      <Text style={[styles.placeholderTag, { color: c.muted2, top: insets.top + 14 }]}>
        photo lifestyle · athlète
      </Text>

      {/* Dégradé vers le fond */}
      <LinearGradient
        colors={['transparent', c.bg]}
        locations={[0.16, 0.7]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Contenu bas */}
      <View style={[styles.bottom, { paddingBottom: 28 + insets.bottom }]}>
        <View style={styles.logoRow}>
          <View
            style={[
              styles.logoMark,
              { backgroundColor: c.accent, shadowColor: c.accent },
            ]}
          >
            <Icon name="fitness_center" size={24} color={c.onAccent} />
          </View>
          <Text style={[styles.wordmark, { color: c.txt }]}>
            Gym<Text style={{ color: c.accent }}>AI</Text>
          </Text>
        </View>

        <Text style={[styles.headline, { color: c.txt }]}>
          Ton coach intelligent, à chaque répétition.
        </Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Programmes générés par l'IA, suivi en temps réel, nutrition et coaching —
          dans une seule app.
        </Text>

        <Text style={[styles.kicker, { color: c.muted2 }]}>Choisis ton ambiance</Text>
        <ThemePills onOpenPicker={() => router.push('/color-picker')} />

        <PressableScale
          onPress={() => router.push('/(auth)/register')}
          style={[
            styles.cta,
            { backgroundColor: c.accent, shadowColor: c.accentDim },
          ]}
        >
          <Text style={[styles.ctaTxt, { color: c.onAccent }]}>Créer un compte</Text>
        </PressableScale>

        <PressableScale
          onPress={() => router.push('/(auth)/login')}
          style={[styles.ctaGhost, { borderColor: c.line }]}
        >
          <Text style={[styles.ctaGhostTxt, { color: c.txt }]}>
            J'ai déjà un compte
          </Text>
        </PressableScale>

        <Text style={[styles.footer, { color: c.muted2 }]}>
          Déjà 12 000 sportifs accompagnés par l'IA
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  placeholderTag: {
    position: 'absolute',
    left: 18,
    fontFamily: fonts.displayMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -0.9,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 9,
  },
  cta: {
    marginTop: 22,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowOpacity: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  ctaTxt: { fontFamily: fonts.display, fontSize: 15 },
  ctaGhost: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
  },
  ctaGhostTxt: { fontFamily: fonts.display, fontSize: 15 },
  footer: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 14,
  },
});
