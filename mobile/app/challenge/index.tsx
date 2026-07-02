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
import { myEnrollments, type Enrollment } from '@/api/programs';
import { DEMO_ENROLLMENTS } from '@/data/demo';

/** « Mes défis » — liste de mes adhésions ; ouvre le tracker au tap. */
export default function MyChallenges() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await myEnrollments();
      setItems(list.length ? list : DEMO_ENROLLMENTS);
      setDemo(list.length === 0);
    } catch {
      setItems(DEMO_ENROLLMENTS);
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        title="Mes défis"
        subtitle="Tes adhésions en cours et leur progression."
        right={
          <PressableScale
            onPress={() => router.push('/programs')}
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

      {loading ? (
        <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={[styles.empty, { borderColor: c.line }]}>
          <Icon name="emoji_events" size={30} color={c.muted2} />
          <Text style={[styles.emptyTxt, { color: c.muted }]}>
            Aucun défi en cours. Rejoins un programme coaché pour démarrer.
          </Text>
          <PressableScale
            onPress={() => router.push('/programs')}
            style={[styles.emptyCta, { backgroundColor: c.accent }]}
          >
            <Text style={[styles.emptyCtaTxt, { color: c.onAccent }]}>Explorer les programmes</Text>
          </PressableScale>
        </View>
      ) : (
        items.map((e, i) => (
          <StaggerItem key={e.id} index={i}>
            <PressableScale
              onPress={() => router.push({ pathname: '/challenge/[id]', params: { id: String(e.id) } })}
              style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: c.txt }]} numberOfLines={1}>
                  {e.program.title}
                </Text>
                <Text style={[styles.sub, { color: c.muted }]}>
                  {e.sessions_done}/{e.sessions_target} séances · {e.adherence_pct}% assiduité
                </Text>
                <View style={[styles.barTrack, { backgroundColor: c.line }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: c.accent,
                        width: `${Math.min(100, e.adherence_pct)}%`,
                      },
                    ]}
                  />
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
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.3 },
  sub: { fontFamily: fonts.bodyMedium, fontSize: 12.5, marginTop: 3 },
  barTrack: { height: 7, borderRadius: 999, marginTop: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  empty: { borderWidth: 1, borderRadius: 22, padding: 26, alignItems: 'center', gap: 12, marginTop: 8 },
  emptyTxt: { fontFamily: fonts.body, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyCta: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 13 },
  emptyCtaTxt: { fontFamily: fonts.display, fontSize: 14 },
});
