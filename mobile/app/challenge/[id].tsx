import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import ScreenHeader from '@/components/ui/ScreenHeader';
import StaggerItem from '@/components/ui/StaggerItem';
import ProgressRing from '@/components/ProgressRing';
import { getEnrollment, logSession, type Enrollment } from '@/api/programs';
import { DEMO_ENROLLMENT } from '@/data/demo';

/** Jours restants dérivés si le backend ne les renvoie pas. */
function daysRemaining(e: Enrollment): number {
  if (typeof e.days_remaining === 'number') return e.days_remaining;
  const end = new Date(e.end_date).getTime();
  const diff = Math.ceil((end - Date.now()) / 86_400_000);
  return Math.max(0, diff);
}

/**
 * « Mon défi » — tracker d'adhésion : anneau 30 j (sessions_done/target, jours
 * restants) + bouton « J'ai fait ma séance » (log-session). Repli démo.
 */
export default function ChallengeTracker() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [enr, setEnr] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const e = await getEnrollment(id);
      setEnr(e);
      setDemo(false);
    } catch {
      setEnr(DEMO_ENROLLMENT);
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onLog = async () => {
    if (!enr) return;
    setLogging(true);
    try {
      const updated = await logSession(enr.id);
      setEnr(updated);
      setDemo(false);
    } catch {
      // Repli démo : incrément local borné à la cible.
      setEnr((prev) => {
        if (!prev) return prev;
        const done = Math.min(prev.sessions_done + 1, prev.sessions_target);
        return {
          ...prev,
          sessions_done: done,
          adherence_pct: Math.round((100 * done) / Math.max(prev.sessions_target, 1)),
        };
      });
      setDemo(true);
    } finally {
      setLogging(false);
    }
  };

  const pct = enr ? enr.sessions_done / Math.max(enr.sessions_target, 1) : 0;
  const complete = !!enr && enr.sessions_done >= enr.sessions_target;

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Mon défi" subtitle={enr?.program.title} />

      {demo ? (
        <View style={[styles.demoTag, { backgroundColor: c.accentDim }]}>
          <Icon name="bolt" size={13} color={c.accent} />
          <Text style={[styles.demoTxt, { color: c.accent }]}>Mode démo (API injoignable)</Text>
        </View>
      ) : null}

      {loading || !enr ? (
        <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />
      ) : (
        <>
          <StaggerItem index={0}>
            <View style={[styles.ringCard, { backgroundColor: c.surface, borderColor: c.line }]}>
              <ProgressRing
                progress={pct}
                centerLabel={`${enr.adherence_pct}%`}
                centerSub="assiduité"
              />
              <View style={styles.ringLegend}>
                <View style={styles.legendItem}>
                  <Icon name="check_circle" size={18} color={c.accent} />
                  <Text style={[styles.legendVal, { color: c.txt }]}>
                    {enr.sessions_done}
                    <Text style={[styles.legendUnit, { color: c.muted2 }]}> / {enr.sessions_target}</Text>
                  </Text>
                  <Text style={[styles.legendLbl, { color: c.muted }]}>séances</Text>
                </View>
                <View style={styles.legendItem}>
                  <Icon name="calendar_today" size={17} color={c.violet} />
                  <Text style={[styles.legendVal, { color: c.txt }]}>{daysRemaining(enr)}</Text>
                  <Text style={[styles.legendLbl, { color: c.muted }]}>jours restants</Text>
                </View>
              </View>
            </View>
          </StaggerItem>

          <StaggerItem index={1}>
            <View style={[styles.datesCard, { backgroundColor: c.surface, borderColor: c.line }]}>
              <View style={styles.dateItem}>
                <Text style={[styles.dateLbl, { color: c.muted2 }]}>Début</Text>
                <Text style={[styles.dateVal, { color: c.txt }]}>{enr.start_date}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: c.line }]} />
              <View style={styles.dateItem}>
                <Text style={[styles.dateLbl, { color: c.muted2 }]}>Fin</Text>
                <Text style={[styles.dateVal, { color: c.txt }]}>{enr.end_date}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: c.line }]} />
              <View style={styles.dateItem}>
                <Text style={[styles.dateLbl, { color: c.muted2 }]}>Statut</Text>
                <Text style={[styles.dateVal, { color: complete ? c.good : c.txt }]}>
                  {complete ? 'Terminé' : 'Actif'}
                </Text>
              </View>
            </View>
          </StaggerItem>

          <StaggerItem index={2}>
            <PressableScale
              onPress={onLog}
              disabled={logging || complete}
              style={[
                styles.cta,
                {
                  backgroundColor: complete ? c.surface2 : c.accent,
                  shadowColor: c.accentDim,
                  opacity: logging ? 0.6 : 1,
                },
              ]}
            >
              <Icon
                name={complete ? 'emoji_events' : 'check_circle'}
                size={20}
                color={complete ? c.accent : c.onAccent}
              />
              <Text
                style={[styles.ctaTxt, { color: complete ? c.accent : c.onAccent }]}
              >
                {complete
                  ? 'Défi complété — bravo !'
                  : logging
                    ? 'Enregistrement…'
                    : "J'ai fait ma séance"}
              </Text>
            </PressableScale>
          </StaggerItem>
        </>
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
  ringCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  ringLegend: { flex: 1, gap: 16 },
  legendItem: { gap: 2 },
  legendVal: { fontFamily: fonts.display, fontSize: 22 },
  legendUnit: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  legendLbl: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  datesCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: { flex: 1, alignItems: 'center', gap: 3 },
  dateLbl: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dateVal: { fontFamily: fonts.displayMedium, fontSize: 13.5 },
  divider: { width: 1, height: 34 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 15,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaTxt: { fontFamily: fonts.display, fontSize: 15 },
});
