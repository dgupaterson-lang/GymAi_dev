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
import { listCoachedPrograms, enroll, type Program } from '@/api/programs';
import { DEMO_COACHED_PROGRAMS } from '@/data/demo';

/**
 * « Programmes coachés » — liste des programmes découvrables (/programs/coached)
 * avec bouton Rejoindre (enroll). Repli en données démo si l'API est injoignable.
 */
export default function CoachedPrograms() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listCoachedPrograms();
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

  const onJoin = async (p: Program) => {
    setJoiningId(p.id);
    try {
      const e = await enroll(p.id);
      router.push({ pathname: '/challenge/[id]', params: { id: String(e.id) } });
    } catch {
      // Repli démo : on route vers le tracker démo sans planter.
      router.push('/challenge');
    } finally {
      setJoiningId(null);
    }
  };

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
        title="Programmes coachés"
        subtitle="Rejoins un programme animé par un coach et suis ta progression sur 30 jours."
      />

      {demo ? (
        <View style={[styles.demoTag, { backgroundColor: c.accentDim }]}>
          <Icon name="bolt" size={13} color={c.accent} />
          <Text style={[styles.demoTxt, { color: c.accent }]}>
            Mode démo (API injoignable)
          </Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />
      ) : (
        programs.map((p, i) => (
          <StaggerItem key={p.id} index={i}>
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
              <View style={styles.cardHead}>
                <View style={[styles.badge, { backgroundColor: c.accentDim }]}>
                  <Icon name="emoji_events" size={14} color={c.accent} />
                  <Text style={[styles.badgeTxt, { color: c.accent }]}>
                    {p.duration_days} j
                  </Text>
                </View>
                {p.enrollments_count != null ? (
                  <View style={styles.meta}>
                    <Icon name="people" size={14} color={c.muted2} />
                    <Text style={[styles.metaTxt, { color: c.muted2 }]}>
                      {p.enrollments_count}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.title, { color: c.txt }]}>{p.title}</Text>
              {p.description ? (
                <Text style={[styles.desc, { color: c.muted }]} numberOfLines={2}>
                  {p.description}
                </Text>
              ) : null}
              <View style={styles.tagRow}>
                {p.objective ? (
                  <Text style={[styles.tag, { color: c.muted, borderColor: c.line }]}>
                    {p.objective}
                  </Text>
                ) : null}
                {p.level ? (
                  <Text style={[styles.tag, { color: c.muted, borderColor: c.line }]}>
                    {p.level}
                  </Text>
                ) : null}
              </View>
              <View style={styles.actions}>
                <PressableScale
                  onPress={() =>
                    router.push({ pathname: '/programs/[id]', params: { id: String(p.id) } })
                  }
                  style={[styles.ghostBtn, { borderColor: c.line }]}
                >
                  <Text style={[styles.ghostTxt, { color: c.txt }]}>Détails</Text>
                </PressableScale>
                <PressableScale
                  onPress={() => onJoin(p)}
                  disabled={joiningId === p.id}
                  style={[
                    styles.joinBtn,
                    { backgroundColor: c.accent, shadowColor: c.accentDim, opacity: joiningId === p.id ? 0.6 : 1 },
                  ]}
                >
                  <Icon name="add" size={18} color={c.onAccent} />
                  <Text style={[styles.joinTxt, { color: c.onAccent }]}>
                    {joiningId === p.id ? 'Adhésion…' : 'Rejoindre'}
                  </Text>
                </PressableScale>
              </View>
            </View>
          </StaggerItem>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 14 },
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
  card: { borderRadius: 22, padding: 18, borderWidth: 1, gap: 8 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeTxt: { fontFamily: fonts.bodyBold, fontSize: 11 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { fontFamily: fonts.bodySemibold, fontSize: 12 },
  title: { fontFamily: fonts.display, fontSize: 18, letterSpacing: -0.4 },
  desc: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  tag: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostTxt: { fontFamily: fonts.bodyBold, fontSize: 14 },
  joinBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 13,
    paddingVertical: 12,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  joinTxt: { fontFamily: fonts.display, fontSize: 14 },
});
