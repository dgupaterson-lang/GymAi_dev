import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import ThemePills from '@/components/ThemePills';
import { useAuthStore } from '@/store';

/** Profil — placeholder Sprint 0 + sélecteur d'ambiance et accès color picker. */
export default function Profile() {
  const { c, accent } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const displayName = user?.full_name?.trim() || 'Invité';
  const displaySub = user?.email ?? 'Mode démo local (non connecté)';
  const initial = (displayName[0] ?? 'G').toUpperCase();

  const onLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 10, paddingBottom: 30 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête profil */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: c.surface2, borderColor: c.accent, shadowColor: c.accent },
          ]}
        >
          <Text style={[styles.avatarTxt, { color: c.accent }]}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.txt }]}>{displayName}</Text>
          <Text style={[styles.handle, { color: c.muted }]}>{displaySub}</Text>
        </View>
      </View>

      {/* Ambiance */}
      <Text style={[styles.section, { color: c.muted2 }]}>Apparence</Text>
      <ThemePills onOpenPicker={() => router.push('/color-picker')} />

      <PressableScale
        onPress={() => router.push('/color-picker')}
        style={[styles.row, { backgroundColor: c.surface, borderColor: c.line }]}
      >
        <View style={[styles.rowSwatch, { backgroundColor: accent, shadowColor: accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: c.txt }]}>Couleur d'accent</Text>
          <Text style={[styles.rowSub, { color: c.muted }]}>
            {accent.toUpperCase()} · personnalise ton ambiance
          </Text>
        </View>
        <Icon name="chevron_right" size={22} color={c.muted2} />
      </PressableScale>

      {/* Autres réglages placeholder */}
      <Text style={[styles.section, { color: c.muted2 }]}>Compte</Text>
      {[
        { ic: 'tune', label: 'Préférences d\'entraînement' },
        { ic: 'person', label: 'Informations personnelles' },
      ].map((it) => (
        <View
          key={it.label}
          style={[styles.row, { backgroundColor: c.surface, borderColor: c.line }]}
        >
          <Icon name={it.ic} size={20} color={c.accent} />
          <Text style={[styles.rowTitle, { color: c.txt, flex: 1 }]}>{it.label}</Text>
          <Icon name="chevron_right" size={22} color={c.muted2} />
        </View>
      ))}

      {user ? (
        <PressableScale
          onPress={onLogout}
          style={[styles.row, { backgroundColor: c.surface, borderColor: c.line, marginTop: 8 }]}
        >
          <Icon name="logout" size={20} color={c.warn} />
          <Text style={[styles.rowTitle, { color: c.warn, flex: 1 }]}>Se déconnecter</Text>
        </PressableScale>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  avatarTxt: { fontFamily: fonts.display, fontSize: 24 },
  name: { fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.4 },
  handle: { fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  rowSwatch: {
    width: 34,
    height: 34,
    borderRadius: 10,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  rowTitle: { fontFamily: fonts.bodySemibold, fontSize: 14.5 },
  rowSub: { fontFamily: fonts.body, fontSize: 12.5, marginTop: 2 },
});
