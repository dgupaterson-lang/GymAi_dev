import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import ScreenHeader from '@/components/ui/ScreenHeader';
import StaggerItem from '@/components/ui/StaggerItem';
import { acceptInvitation, type ResolvedInvitation } from '@/api/invitations';
import { DEMO_RECEIVED_INVITATIONS } from '@/data/demo';

/**
 * Invitations reçues (côté membre) + acceptation.
 * NB : le contrat docs/16 n'expose pas d'endpoint « liste des invitations reçues
 * par un membre » (seulement GET /invitations/{token} pour résoudre un lien).
 * On alimente donc en données démo ; l'acceptation appelle le vrai endpoint
 * POST /invitations/{token}/accept et bascule vers « Mon défi » (repli démo sinon).
 */
export default function ReceivedInvitations() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ResolvedInvitation[]>(DEMO_RECEIVED_INVITATIONS);
  const [busyToken, setBusyToken] = useState<string | null>(null);

  const onAccept = async (inv: ResolvedInvitation) => {
    setBusyToken(inv.token);
    try {
      const e = await acceptInvitation(inv.token);
      setItems((prev) => prev.filter((x) => x.token !== inv.token));
      router.push({ pathname: '/challenge/[id]', params: { id: String(e.id) } });
    } catch {
      // Repli démo : on retire l'invitation et on ouvre le tracker démo.
      setItems((prev) => prev.filter((x) => x.token !== inv.token));
      router.push('/challenge');
    } finally {
      setBusyToken(null);
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
        title="Invitations"
        subtitle="Les défis auxquels un coach t'a invité à participer."
      />

      {items.length === 0 ? (
        <View style={[styles.empty, { borderColor: c.line }]}>
          <Icon name="mail" size={30} color={c.muted2} />
          <Text style={[styles.emptyTxt, { color: c.muted }]}>
            Aucune invitation en attente.
          </Text>
        </View>
      ) : (
        items.map((inv, i) => (
          <StaggerItem key={inv.token} index={i}>
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
              <View style={styles.head}>
                <View style={[styles.iconWrap, { backgroundColor: c.accentDim }]}>
                  <Icon name="redeem" size={20} color={c.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: c.txt }]} numberOfLines={1}>
                    {inv.program?.title ?? 'Programme coaché'}
                  </Text>
                  {inv.from_coach?.full_name ? (
                    <Text style={[styles.from, { color: c.muted }]}>
                      Invité par {inv.from_coach.full_name}
                    </Text>
                  ) : null}
                </View>
              </View>
              {inv.program?.description ? (
                <Text style={[styles.desc, { color: c.muted }]} numberOfLines={2}>
                  {inv.program.description}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                {inv.program?.duration_days ? (
                  <Text style={[styles.tag, { color: c.muted, borderColor: c.line }]}>
                    {inv.program.duration_days} jours
                  </Text>
                ) : null}
                {inv.expires_at ? (
                  <Text style={[styles.tag, { color: c.warn, borderColor: c.line }]}>
                    Expire le {inv.expires_at}
                  </Text>
                ) : null}
              </View>
              <PressableScale
                onPress={() => onAccept(inv)}
                disabled={busyToken === inv.token}
                style={[
                  styles.cta,
                  { backgroundColor: c.accent, shadowColor: c.accentDim, opacity: busyToken === inv.token ? 0.6 : 1 },
                ]}
              >
                <Icon name="check" size={18} color={c.onAccent} />
                <Text style={[styles.ctaTxt, { color: c.onAccent }]}>
                  {busyToken === inv.token ? 'Adhésion…' : 'Accepter & rejoindre'}
                </Text>
              </PressableScale>
            </View>
          </StaggerItem>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 14 },
  empty: { borderWidth: 1, borderRadius: 22, padding: 30, alignItems: 'center', gap: 12, marginTop: 8 },
  emptyTxt: { fontFamily: fonts.body, fontSize: 14, textAlign: 'center' },
  card: { borderRadius: 22, padding: 18, borderWidth: 1, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.3 },
  from: { fontFamily: fonts.bodyMedium, fontSize: 12.5, marginTop: 2 },
  desc: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 13,
    marginTop: 4,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  ctaTxt: { fontFamily: fonts.display, fontSize: 14 },
});
