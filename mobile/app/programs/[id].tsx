import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import ScreenHeader from '@/components/ui/ScreenHeader';
import StaggerItem from '@/components/ui/StaggerItem';
import { getProgram, enroll, type Program } from '@/api/programs';
import { DEMO_COACHED_PROGRAMS, DEMO_PROGRAM } from '@/data/demo';

/** Détail d'un programme coaché : jours + exercices, bouton Rejoindre. */
export default function ProgramDetail() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getProgram(id);
      setProgram(p);
    } catch {
      const found = DEMO_COACHED_PROGRAMS.find((p) => String(p.id) === String(id));
      setProgram(found ?? DEMO_PROGRAM);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onJoin = async () => {
    if (!program) return;
    setJoining(true);
    try {
      const e = await enroll(program.id);
      router.replace({ pathname: '/challenge/[id]', params: { id: String(e.id) } });
    } catch {
      router.replace('/challenge');
    } finally {
      setJoining(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Programme" />

      {loading || !program ? (
        <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />
      ) : (
        <>
          <StaggerItem index={0}>
            <View style={[styles.hero, { backgroundColor: c.surface, borderColor: c.line }]}>
              <View style={[styles.badge, { backgroundColor: c.accentDim }]}>
                <Icon name="emoji_events" size={14} color={c.accent} />
                <Text style={[styles.badgeTxt, { color: c.accent }]}>
                  Défi {program.duration_days} jours
                </Text>
              </View>
              <Text style={[styles.title, { color: c.txt }]}>{program.title}</Text>
              {program.description ? (
                <Text style={[styles.desc, { color: c.muted }]}>{program.description}</Text>
              ) : null}
              <View style={styles.metaRow}>
                {program.coach_name ? (
                  <View style={styles.metaItem}>
                    <Icon name="person" size={15} color={c.muted} />
                    <Text style={[styles.metaTxt, { color: c.muted }]}>{program.coach_name}</Text>
                  </View>
                ) : null}
                {program.level ? (
                  <View style={styles.metaItem}>
                    <Icon name="trending_up" size={15} color={c.muted} />
                    <Text style={[styles.metaTxt, { color: c.muted }]}>{program.level}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </StaggerItem>

          {(program.days ?? []).map((day, i) => (
            <StaggerItem key={day.id ?? i} index={i + 1}>
              <View style={[styles.dayCard, { backgroundColor: c.surface, borderColor: c.line }]}>
                <View style={styles.dayHead}>
                  <Text style={[styles.dayTitle, { color: c.txt }]}>{day.title}</Text>
                  <Text style={[styles.dayIdx, { color: c.muted2 }]}>
                    Jour {(day.order ?? i) + 1}
                  </Text>
                </View>
                {(day.exercises ?? []).map((ex, j) => (
                  <View
                    key={j}
                    style={[styles.exRow, { borderTopColor: c.line2 }, j === 0 && styles.exFirst]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.exName, { color: c.txt }]}>
                        {ex.exercise?.name ?? ex.exercise_name ?? 'Exercice'}
                      </Text>
                      <Text style={[styles.exMeta, { color: c.muted }]}>
                        {ex.sets} × {ex.reps}
                        {ex.charge ? `  ·  ${ex.charge}` : ''}
                        {ex.rest_s ? `  ·  ${ex.rest_s}s repos` : ''}
                      </Text>
                    </View>
                  </View>
                ))}
                {(day.exercises ?? []).length === 0 ? (
                  <Text style={[styles.exMeta, { color: c.muted2, marginTop: 6 }]}>
                    Détail des exercices à venir.
                  </Text>
                ) : null}
              </View>
            </StaggerItem>
          ))}
        </>
      )}

      {program ? (
        <PressableScale
          onPress={onJoin}
          disabled={joining}
          style={[
            styles.cta,
            { backgroundColor: c.accent, shadowColor: c.accentDim, opacity: joining ? 0.6 : 1 },
          ]}
        >
          <Icon name="add" size={20} color={c.onAccent} />
          <Text style={[styles.ctaTxt, { color: c.onAccent }]}>
            {joining ? 'Adhésion…' : 'Rejoindre ce défi'}
          </Text>
        </PressableScale>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 14 },
  hero: { borderRadius: 22, padding: 18, borderWidth: 1, gap: 10 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeTxt: { fontFamily: fonts.bodyBold, fontSize: 11 },
  title: { fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.5 },
  desc: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { fontFamily: fonts.bodyMedium, fontSize: 12.5 },
  dayCard: { borderRadius: 20, padding: 16, borderWidth: 1 },
  dayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dayTitle: { fontFamily: fonts.display, fontSize: 15 },
  dayIdx: { fontFamily: fonts.bodySemibold, fontSize: 12 },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1 },
  exFirst: { borderTopWidth: 0 },
  exName: { fontFamily: fonts.bodySemibold, fontSize: 14 },
  exMeta: { fontFamily: fonts.body, fontSize: 12.5, marginTop: 2 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 6,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaTxt: { fontFamily: fonts.display, fontSize: 15 },
});
