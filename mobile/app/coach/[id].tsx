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
import {
  getProgram,
  programAdherents,
  type Adherent,
  type Program,
} from '@/api/programs';
import { DEMO_ADHERENTS, DEMO_COACHED_PROGRAMS, DEMO_PROGRAM } from '@/data/demo';

/** Détail programme coaché (coach) : adhérents + adherence_pct + inviter. */
export default function CoachProgramDetail() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [program, setProgram] = useState<Program | null>(null);
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        getProgram(id).catch(() => null),
        programAdherents(id).catch(() => null),
      ]);
      setProgram(
        p ?? DEMO_COACHED_PROGRAMS.find((x) => String(x.id) === String(id)) ?? DEMO_PROGRAM,
      );
      setAdherents(a && a.length ? a : DEMO_ADHERENTS);
    } catch {
      setProgram(DEMO_PROGRAM);
      setAdherents(DEMO_ADHERENTS);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const avgAdherence =
    adherents.length > 0
      ? Math.round(adherents.reduce((s, a) => s + a.adherence_pct, 0) / adherents.length)
      : 0;

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Programme" subtitle={program?.title} />

      {loading || !program ? (
        <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />
      ) : (
        <>
          <StaggerItem index={0}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.line }]}>
                <Text style={[styles.statVal, { color: c.txt }]}>{adherents.length}</Text>
                <Text style={[styles.statLbl, { color: c.muted }]}>adhérents</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.line }]}>
                <Text style={[styles.statVal, { color: c.accent }]}>{avgAdherence}%</Text>
                <Text style={[styles.statLbl, { color: c.muted }]}>assiduité moy.</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.line }]}>
                <Text style={[styles.statVal, { color: c.txt }]}>{program.duration_days}</Text>
                <Text style={[styles.statLbl, { color: c.muted }]}>jours</Text>
              </View>
            </View>
          </StaggerItem>

          <StaggerItem index={1}>
            <PressableScale
              onPress={() =>
                router.push({ pathname: '/coach/invite', params: { programId: String(program.id) } })
              }
              style={[styles.inviteBtn, { backgroundColor: c.accent, shadowColor: c.accentDim }]}
            >
              <Icon name="group_add" size={20} color={c.onAccent} />
              <Text style={[styles.inviteTxt, { color: c.onAccent }]}>Inviter des sportifs</Text>
            </PressableScale>
          </StaggerItem>

          <Text style={[styles.sectionTitle, { color: c.muted2 }]}>ADHÉRENTS</Text>

          {adherents.length === 0 ? (
            <View style={[styles.empty, { borderColor: c.line }]}>
              <Text style={[styles.emptyTxt, { color: c.muted }]}>
                Aucun adhérent pour l'instant. Invite tes sportifs à rejoindre ce défi.
              </Text>
            </View>
          ) : (
            adherents.map((a, i) => (
              <StaggerItem key={a.member.id} index={i + 2}>
                <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.line }]}>
                  <View style={[styles.avatar, { backgroundColor: c.surface2, borderColor: c.accent }]}>
                    <Text style={[styles.avatarTxt, { color: c.accent }]}>
                      {(a.member.full_name ?? '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: c.txt }]} numberOfLines={1}>
                      {a.member.full_name ?? `Membre #${a.member.id}`}
                    </Text>
                    <Text style={[styles.sessions, { color: c.muted }]}>
                      {a.sessions_done}/{a.sessions_target} séances
                    </Text>
                    <View style={[styles.barTrack, { backgroundColor: c.line }]}>
                      <View
                        style={[
                          styles.barFill,
                          { backgroundColor: c.accent, width: `${Math.min(100, a.adherence_pct)}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={[styles.pct, { color: c.accent }]}>{a.adherence_pct}%</Text>
                </View>
              </StaggerItem>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 14 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 18, padding: 14, borderWidth: 1, alignItems: 'center', gap: 2 },
  statVal: { fontFamily: fonts.display, fontSize: 22 },
  statLbl: { fontFamily: fonts.bodyMedium, fontSize: 11, textAlign: 'center' },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  inviteTxt: { fontFamily: fonts.display, fontSize: 15 },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    marginTop: 6,
    marginBottom: -4,
  },
  empty: { borderWidth: 1, borderRadius: 20, padding: 22, alignItems: 'center' },
  emptyTxt: { fontFamily: fonts.body, fontSize: 13.5, textAlign: 'center', lineHeight: 20 },
  row: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontFamily: fonts.display, fontSize: 16 },
  name: { fontFamily: fonts.bodyBold, fontSize: 14.5 },
  sessions: { fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 2 },
  barTrack: { height: 6, borderRadius: 999, marginTop: 7, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  pct: { fontFamily: fonts.display, fontSize: 16 },
});
