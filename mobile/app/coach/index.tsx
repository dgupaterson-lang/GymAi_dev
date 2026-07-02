import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import ScreenHeader from '@/components/ui/ScreenHeader';
import StaggerItem from '@/components/ui/StaggerItem';
import { useAuthStore } from '@/store';
import { coachPrograms, type Program } from '@/api/programs';
import { DEMO_COACHED_PROGRAMS } from '@/data/demo';

/**
 * Espace coach — mes programmes coachés + création.
 * Réservé aux comptes coach/manager (garde-fou : redirige sinon).
 */
export default function CoachHub() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.user?.role);
  const isCoach = role === 'coach' || role === 'manager';

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await coachPrograms();
      setPrograms(list.length ? list : DEMO_COACHED_PROGRAMS);
      setDemo(list.length === 0);
    } catch {
      setPrograms(DEMO_COACHED_PROGRAMS);
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Garde-fou d'accès : un non-coach ne reste pas ici.
  useEffect(() => {
    if (!isCoach) router.replace('/(tabs)/home');
  }, [isCoach]);

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Espace coach"
        subtitle="Tes programmes coachés et leurs adhérents."
        right={
          <PressableScale
            onPress={() => router.push('/coach/new')}
            style={[styles.addBtn, { backgroundColor: c.accentDim }]}
            hitSlop={8}
          >
            <Icon name="add" size={20} color={c.accent} />
          </PressableScale>
        }
      />

      {demo ? (
        <View style={[styles.demoTag, { backgroundColor: c.accentDim }]}>
          <Icon name="bolt" size={13} color={c.accent} />
          <Text style={[styles.demoTxt, { color: c.accent }]}>Mode démo (API injoignable)</Text>
        </View>
      ) : null}

      <PressableScale
        onPress={() => router.push('/coach/new')}
        style={[styles.createCard, { backgroundColor: c.surface, borderColor: c.line }]}
      >
        <View style={[styles.createIcon, { backgroundColor: c.accentDim }]}>
          <Icon name="add_circle" size={24} color={c.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.createTitle, { color: c.txt }]}>Créer un programme coaché</Text>
          <Text style={[styles.createSub, { color: c.muted }]}>
            Titre, durée, jours et exercices.
          </Text>
        </View>
        <Icon name="chevron_right" size={22} color={c.muted2} />
      </PressableScale>

      <Text style={[styles.sectionTitle, { color: c.muted2 }]}>MES PROGRAMMES</Text>

      {loading ? (
        <ActivityIndicator color={c.accent} style={{ marginTop: 20 }} />
      ) : (
        programs.map((p, i) => (
          <StaggerItem key={p.id} index={i}>
            <PressableScale
              onPress={() => router.push({ pathname: '/coach/[id]', params: { id: String(p.id) } })}
              style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: c.txt }]} numberOfLines={1}>{p.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Icon name="emoji_events" size={14} color={c.muted} />
                    <Text style={[styles.metaTxt, { color: c.muted }]}>{p.duration_days} j</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="people" size={14} color={c.muted} />
                    <Text style={[styles.metaTxt, { color: c.muted }]}>
                      {p.enrollments_count ?? 0} adhérents
                    </Text>
                  </View>
                </View>
              </View>
              <Icon name="chevron_right" size={22} color={c.muted2} />
            </PressableScale>
          </StaggerItem>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 14 },
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  demoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  demoTxt: { fontFamily: fonts.bodyBold, fontSize: 11 },
  createCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  createTitle: { fontFamily: fonts.display, fontSize: 15 },
  createSub: { fontFamily: fonts.body, fontSize: 12.5, marginTop: 2 },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    marginTop: 6,
    marginBottom: -4,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.3 },
  metaRow: { flexDirection: 'row', gap: 14, marginTop: 5 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { fontFamily: fonts.bodyMedium, fontSize: 12 },
});
