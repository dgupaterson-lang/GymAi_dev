import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import StaggerItem from '@/components/ui/StaggerItem';
import ProgressRings from '@/components/ProgressRings';
import { useAuthStore } from '@/store';

/** Raccourcis « programmes coachés » ajoutés au dashboard (docs/16). */
const PROGRAM_LINKS = [
  { ic: 'emoji_events', title: 'Programmes coachés', sub: 'Rejoins un défi 30 jours', href: '/programs' as const },
  { ic: 'military_tech', title: 'Mes défis', sub: 'Suis ta progression', href: '/challenge' as const },
  { ic: 'mail', title: 'Invitations', sub: 'Défis auxquels tu es invité', href: '/invitations' as const },
];

const NAME = 'Alex';
const INITIAL = 'A';

const STATS = [
  { ic: 'monitor_weight', tag: '−1,2 kg', tagKey: 'good', value: '78,4', unit: 'kg', label: 'Poids actuel' },
  { ic: 'straighten', tag: 'normal', tagKey: 'muted2', value: '23,1', unit: '', label: 'Indice IMC' },
  { ic: 'exercise', tag: '+0,8 %', tagKey: 'good', value: '42', unit: '%', label: 'Masse musculaire' },
  { ic: 'water_drop', tag: '72 %', tagKey: 'muted2', value: '1,8', unit: '/ 2,5 L', label: 'Hydratation' },
] as const;

/** Dashboard porté de web/src/screens/Home.tsx (mêmes textes, couleurs du thème). */
export default function Home() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.user?.role);
  const isCoach = role === 'coach' || role === 'manager';
  let order = 0;

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 6, paddingBottom: 26 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête */}
      <StaggerItem index={order++}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: c.muted2 }]}>Mardi 30 juin</Text>
            <Text style={[styles.hello, { color: c.txt }]}>Bonjour, {NAME}</Text>
          </View>
          <View
            style={[
              styles.avatar,
              { backgroundColor: c.surface2, borderColor: c.accent, shadowColor: c.accent },
            ]}
          >
            <Text style={[styles.avatarTxt, { color: c.accent }]}>{INITIAL}</Text>
          </View>
        </View>
      </StaggerItem>

      {/* Programme du jour */}
      <StaggerItem index={order++}>
        <LinearGradient
          colors={[c.heroGradFrom, c.heroGradTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderColor: c.line }]}
        >
          <View
            style={[styles.heroBlob, { backgroundColor: c.accent }]}
            pointerEvents="none"
          />
          <View style={styles.heroLabel}>
            <Icon name="bolt" size={16} color={c.accent} />
            <Text style={[styles.heroLabelTxt, { color: c.accent }]}>
              Programme du jour
            </Text>
          </View>
          <Text style={[styles.heroTitle, { color: c.txt }]}>Pectoraux & Triceps</Text>
          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <Icon name="exercise" size={15} color={c.muted} />
              <Text style={[styles.metaTxt, { color: c.muted }]}>6 exercices</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="schedule" size={15} color={c.muted} />
              <Text style={[styles.metaTxt, { color: c.muted }]}>45 min</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="local_fire_department" size={15} color={c.muted} />
              <Text style={[styles.metaTxt, { color: c.muted }]}>~420 kcal</Text>
            </View>
          </View>
          <PressableScale
            onPress={() => router.push('/(tabs)/workout')}
            style={[styles.heroCta, { backgroundColor: c.accent, shadowColor: c.accentDim }]}
          >
            <Icon name="play_arrow" size={20} color={c.onAccent} />
            <Text style={[styles.heroCtaTxt, { color: c.onAccent }]}>
              Commencer la séance
            </Text>
          </PressableScale>
          <Text style={[styles.heroFoot, { color: c.muted2 }]}>
            Prochaine séance collective dans 2 h 15
          </Text>
        </LinearGradient>
      </StaggerItem>

      {/* Cette semaine */}
      <StaggerItem index={order++}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: c.txt }]}>Cette semaine</Text>
            <Text style={[styles.cardDate, { color: c.muted2 }]}>26 — 30 juin</Text>
          </View>
          <View style={styles.weekRow}>
            <ProgressRings caloriesPct={0.78} sessionsPct={0.8} />
            <View style={styles.weekLegend}>
              <View>
                <View style={styles.legendLabel}>
                  <View style={[styles.dot, { backgroundColor: c.violet }]} />
                  <Text style={[styles.legendTxt, { color: c.muted }]}>Calories brûlées</Text>
                </View>
                <Text style={[styles.legendValue, { color: c.txt }]}>
                  4 820 <Text style={[styles.legendUnit, { color: c.muted2 }]}>/ 6 200 kcal</Text>
                </Text>
              </View>
              <View>
                <View style={styles.legendLabel}>
                  <View style={[styles.dot, { backgroundColor: c.accent }]} />
                  <Text style={[styles.legendTxt, { color: c.muted }]}>Séances</Text>
                </View>
                <Text style={[styles.legendValue, { color: c.txt }]}>
                  4 <Text style={[styles.legendUnit, { color: c.muted2 }]}>/ 5 objectif</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </StaggerItem>

      {/* Grille de stats */}
      <StaggerItem index={order++}>
        <View style={styles.grid}>
          {STATS.map((st) => (
            <View
              key={st.label}
              style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.line }]}
            >
              <View style={styles.statHead}>
                <Icon name={st.ic} size={20} color={c.accent} />
                <Text
                  style={[
                    styles.statTag,
                    { color: st.tagKey === 'good' ? c.good : c.muted2 },
                  ]}
                >
                  {st.tag}
                </Text>
              </View>
              <Text style={[styles.statValue, { color: c.txt }]}>
                {st.value}
                {st.unit ? (
                  <Text style={[styles.statUnit, { color: c.muted2 }]}> {st.unit}</Text>
                ) : null}
              </Text>
              <Text style={[styles.statLabel, { color: c.muted }]}>{st.label}</Text>
            </View>
          ))}
        </View>
      </StaggerItem>

      {/* Programmes coachés & défis */}
      <StaggerItem index={order++}>
        <View style={styles.linksSection}>
          {PROGRAM_LINKS.map((l) => (
            <PressableScale
              key={l.href}
              onPress={() => router.push(l.href)}
              style={[styles.linkCard, { backgroundColor: c.surface, borderColor: c.line }]}
            >
              <View style={[styles.linkIcon, { backgroundColor: c.accentDim }]}>
                <Icon name={l.ic} size={22} color={c.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkTitle, { color: c.txt }]}>{l.title}</Text>
                <Text style={[styles.linkSub, { color: c.muted }]}>{l.sub}</Text>
              </View>
              <Icon name="chevron_right" size={22} color={c.muted2} />
            </PressableScale>
          ))}
          {isCoach ? (
            <PressableScale
              onPress={() => router.push('/coach')}
              style={[styles.linkCard, { backgroundColor: c.surface, borderColor: c.accent }]}
            >
              <View style={[styles.linkIcon, { backgroundColor: c.accentDim }]}>
                <Icon name="group_add" size={22} color={c.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkTitle, { color: c.txt }]}>Espace coach</Text>
                <Text style={[styles.linkSub, { color: c.muted }]}>
                  Crée un programme, suis tes adhérents
                </Text>
              </View>
              <Icon name="chevron_right" size={22} color={c.muted2} />
            </PressableScale>
          ) : null}
        </View>
      </StaggerItem>

      {/* Carte coach IA */}
      <StaggerItem index={order++}>
        <PressableScale onPress={() => router.push('/(tabs)/coach')}>
          <LinearGradient
            colors={[c.violetDim, c.accentDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.coachCard, { borderColor: c.line }]}
          >
            <View
              style={[
                styles.coachIcon,
                { backgroundColor: c.surface2, shadowColor: c.accentDim },
              ]}
            >
              <Icon name="auto_awesome" size={26} color={c.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.coachTitle, { color: c.txt }]}>Coach IA</Text>
              <Text style={[styles.coachSub, { color: c.muted }]}>
                « Au rythme actuel, objectif atteint dans 67 jours. »
              </Text>
            </View>
            <Icon name="chevron_right" size={22} color={c.muted2} />
          </LinearGradient>
        </PressableScale>
      </StaggerItem>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    fontFamily: fonts.displayMedium,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  hello: { fontFamily: fonts.display, fontSize: 25, letterSpacing: -0.5, marginTop: 4 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  avatarTxt: { fontFamily: fonts.display, fontSize: 18 },
  hero: {
    position: 'relative',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  heroBlob: {
    position: 'absolute',
    right: -34,
    top: -34,
    width: 170,
    height: 170,
    borderRadius: 85,
    opacity: 0.15,
  },
  heroLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroLabelTxt: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: { fontFamily: fonts.display, fontSize: 22, marginTop: 8, letterSpacing: -0.5 },
  heroMeta: { flexDirection: 'row', gap: 14, marginTop: 9, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { fontFamily: fonts.bodyMedium, fontSize: 12.5 },
  heroCta: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroCtaTxt: { fontFamily: fonts.display, fontSize: 15 },
  heroFoot: { textAlign: 'center', fontFamily: fonts.body, fontSize: 12, marginTop: 10 },
  card: { borderRadius: 24, padding: 18, borderWidth: 1 },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: { fontFamily: fonts.display, fontSize: 15 },
  cardDate: { fontFamily: fonts.bodySemibold, fontSize: 12 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  weekLegend: { flex: 1, gap: 14 },
  legendLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  legendTxt: { fontFamily: fonts.bodySemibold, fontSize: 12 },
  legendValue: { fontFamily: fonts.display, fontSize: 21, marginTop: 2 },
  legendUnit: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
  },
  statHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statTag: { fontFamily: fonts.bodyBold, fontSize: 11 },
  statValue: { fontFamily: fonts.display, fontSize: 23, marginTop: 10 },
  statUnit: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 2 },
  coachCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  coachIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  coachTitle: { fontFamily: fonts.display, fontSize: 15 },
  coachSub: { fontFamily: fonts.body, fontSize: 12.5, marginTop: 2, lineHeight: 17 },
  linksSection: { gap: 10 },
  linkCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: { fontFamily: fonts.display, fontSize: 15 },
  linkSub: { fontFamily: fonts.body, fontSize: 12.5, marginTop: 2 },
});
