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
import { useAuthStore } from '@/store';
import {
  acceptInvitation,
  resolveInvitation,
  type ResolvedInvitation,
} from '@/api/invitations';
import { DEMO_RESOLVED_INVITATION } from '@/data/demo';

/**
 * Deep link `gymai://invite/<token>` (route app/invite/[token].tsx).
 * Résout l'invitation (résumé programme + statut) → bouton Adhérer
 * (acceptInvitation → auto-enroll) → navigue vers « Mon défi ».
 *
 * Gère l'app déjà ouverte (expo-router capte l'URL et monte cet écran).
 * Non authentifié → invite à se connecter, puis reviendra sur ce lien (RG-58 :
 * le deferred deep link post-install est hors scope MVP, cf. docs/16).
 */
export default function InviteScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { token } = useLocalSearchParams<{ token: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [inv, setInv] = useState<ResolvedInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resolved = await resolveInvitation(token);
      setInv(resolved);
      setDemo(false);
    } catch {
      // Repli démo : on montre un résumé plausible sans planter.
      setInv({ ...DEMO_RESOLVED_INVITATION, token });
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onAccept = async () => {
    if (!isAuthenticated) {
      // Pas connecté : on renvoie vers l'auth (le lien pourra être rouvert).
      router.push('/(auth)/welcome');
      return;
    }
    setAccepting(true);
    setError(null);
    try {
      const e = await acceptInvitation(token);
      router.replace({ pathname: '/challenge/[id]', params: { id: String(e.id) } });
    } catch {
      // Repli démo : bascule quand même vers le tracker démo.
      router.replace('/challenge');
    } finally {
      setAccepting(false);
    }
  };

  const expired = inv?.status === 'expired';
  const accepted = inv?.status === 'accepted';

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
        title="Invitation"
        onBack={() => router.replace('/(tabs)/home')}
      />

      {loading || !inv ? (
        <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={[styles.iconWrap, { backgroundColor: c.accentDim }]}>
              <Icon name="redeem" size={28} color={c.accent} />
            </View>
            <Text style={[styles.kicker, { color: c.accent }]}>
              {inv.from_coach?.full_name
                ? `${inv.from_coach.full_name} t'invite`
                : 'Tu es invité·e'}
            </Text>
            <Text style={[styles.title, { color: c.txt }]}>
              {inv.program?.title ?? 'Programme coaché'}
            </Text>
            {inv.program?.description ? (
              <Text style={[styles.desc, { color: c.muted }]}>
                {inv.program.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              {inv.program?.duration_days ? (
                <View style={styles.metaItem}>
                  <Icon name="emoji_events" size={16} color={c.muted} />
                  <Text style={[styles.metaTxt, { color: c.muted }]}>
                    Défi {inv.program.duration_days} jours
                  </Text>
                </View>
              ) : null}
              {inv.program?.days_count != null ? (
                <View style={styles.metaItem}>
                  <Icon name="fitness_center" size={15} color={c.muted} />
                  <Text style={[styles.metaTxt, { color: c.muted }]}>
                    {inv.program.days_count} séances / sem.
                  </Text>
                </View>
              ) : null}
            </View>
            {expired ? (
              <View style={[styles.statusPill, { backgroundColor: c.line2 }]}>
                <Text style={[styles.statusTxt, { color: c.warn }]}>Invitation expirée</Text>
              </View>
            ) : accepted ? (
              <View style={[styles.statusPill, { backgroundColor: c.line2 }]}>
                <Text style={[styles.statusTxt, { color: c.good }]}>Déjà acceptée</Text>
              </View>
            ) : null}
          </View>

          {demo ? (
            <View style={[styles.demoTag, { backgroundColor: c.accentDim }]}>
              <Icon name="bolt" size={13} color={c.accent} />
              <Text style={[styles.demoTxt, { color: c.accent }]}>Mode démo (API injoignable)</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorRow}>
              <Icon name="error_outline" size={16} color={c.warn} />
              <Text style={[styles.errorTxt, { color: c.warn }]}>{error}</Text>
            </View>
          ) : null}

          <PressableScale
            onPress={onAccept}
            disabled={accepting || expired || accepted}
            style={[
              styles.cta,
              {
                backgroundColor: expired || accepted ? c.surface2 : c.accent,
                shadowColor: c.accentDim,
                opacity: accepting ? 0.6 : 1,
              },
            ]}
          >
            <Icon
              name="check_circle"
              size={20}
              color={expired || accepted ? c.muted : c.onAccent}
            />
            <Text
              style={[
                styles.ctaTxt,
                { color: expired || accepted ? c.muted : c.onAccent },
              ]}
            >
              {accepting
                ? 'Adhésion…'
                : !isAuthenticated
                  ? 'Se connecter pour adhérer'
                  : 'Adhérer au défi'}
            </Text>
          </PressableScale>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 16 },
  card: { borderRadius: 24, padding: 22, borderWidth: 1, alignItems: 'center', gap: 8 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.5, textAlign: 'center' },
  desc: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, textAlign: 'center' },
  metaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { fontFamily: fonts.bodyMedium, fontSize: 12.5 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 6 },
  statusTxt: { fontFamily: fonts.bodyBold, fontSize: 12 },
  demoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  demoTxt: { fontFamily: fonts.bodyBold, fontSize: 11 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  errorTxt: { fontFamily: fonts.bodyMedium, fontSize: 13 },
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
