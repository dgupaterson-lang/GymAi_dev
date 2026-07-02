import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import ScreenHeader from '@/components/ui/ScreenHeader';
import InviteQR from '@/components/InviteQR';
import {
  createInvitation,
  type Invitation,
  type InvitationTargetType,
} from '@/api/invitations';

/** Construit le deep link partageable à partir du token (scheme gymai). */
function inviteUrl(inv: Invitation): string {
  return inv.url ?? `gymai://invite/${inv.token}`;
}

/**
 * « Inviter » (coach) : génère une invitation (createInvitation) → affiche le
 * lien gymai://invite/<token> + partage natif (Share RN) + QR. Cible : membre
 * existant (id) ou contact externe (tél/e-mail). Repli démo si API injoignable.
 */
export default function InviteGenerate() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { programId } = useLocalSearchParams<{ programId?: string }>();

  const [target, setTarget] = useState<InvitationTargetType>('contact');
  const [value, setValue] = useState('');
  const [inv, setInv] = useState<Invitation | null>(null);
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setError(null);
    setBusy(true);
    const programIdNum = programId ? parseInt(programId, 10) : undefined;
    try {
      const created = await createInvitation({
        kind: 'program',
        program_id: programIdNum,
        target_type: target,
        member_id: target === 'member' ? parseInt(value, 10) || undefined : undefined,
        contact: target === 'contact' ? value.trim() || undefined : undefined,
      });
      setInv(created);
      setDemo(false);
    } catch {
      // Repli démo : token local généré, lien partageable quand même.
      const token = `demo-${Math.random().toString(36).slice(2, 10)}`;
      setInv({ token, url: `gymai://invite/${token}`, status: 'pending', kind: 'program' });
      setDemo(true);
    } finally {
      setBusy(false);
    }
  };

  const url = inv ? inviteUrl(inv) : '';

  const onShare = async () => {
    if (!url) return;
    try {
      await Share.share({
        message: `Rejoins mon défi GymAI ! Ouvre ce lien : ${url}`,
        url,
      });
    } catch {
      // partage annulé / indisponible : silencieux
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 30 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Inviter"
          subtitle="Génère un lien d'invitation à partager. Le lien pousse au téléchargement puis à l'adhésion."
        />

        <View style={styles.segment}>
          {(['contact', 'member'] as InvitationTargetType[]).map((t) => {
            const active = target === t;
            return (
              <PressableScale
                key={t}
                onPress={() => {
                  setTarget(t);
                  setValue('');
                }}
                style={[
                  styles.segItem,
                  { backgroundColor: active ? c.accent : c.surface, borderColor: active ? c.accent : c.line },
                ]}
              >
                <Text style={[styles.segTxt, { color: active ? c.onAccent : c.muted }]}>
                  {t === 'contact' ? 'Contact externe' : 'Membre existant'}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        <Text style={[styles.label, { color: c.muted2 }]}>
          {target === 'contact' ? 'Téléphone / e-mail' : 'ID du membre'}
        </Text>
        <View style={[styles.field, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Icon name={target === 'contact' ? 'mail' : 'person'} size={19} color={c.muted} />
          <TextInput
            style={[styles.input, { color: c.txt }]}
            placeholderTextColor={c.muted2}
            value={value}
            onChangeText={setValue}
            placeholder={target === 'contact' ? '+225 07 00 00 00 00' : '42'}
            keyboardType={target === 'contact' ? 'default' : 'number-pad'}
            autoCapitalize="none"
          />
        </View>

        <PressableScale
          onPress={onGenerate}
          disabled={busy}
          style={[styles.cta, { backgroundColor: c.accent, shadowColor: c.accentDim, opacity: busy ? 0.6 : 1 }]}
        >
          <Icon name="link" size={20} color={c.onAccent} />
          <Text style={[styles.ctaTxt, { color: c.onAccent }]}>
            {busy ? 'Génération…' : "Générer l'invitation"}
          </Text>
        </PressableScale>

        {error ? (
          <View style={styles.errorRow}>
            <Icon name="error_outline" size={16} color={c.warn} />
            <Text style={[styles.errorTxt, { color: c.warn }]}>{error}</Text>
          </View>
        ) : null}

        {inv ? (
          <View style={[styles.resultCard, { backgroundColor: c.surface, borderColor: c.line }]}>
            {demo ? (
              <View style={[styles.demoTag, { backgroundColor: c.accentDim }]}>
                <Icon name="bolt" size={12} color={c.accent} />
                <Text style={[styles.demoTxt, { color: c.accent }]}>Démo — lien local (API injoignable)</Text>
              </View>
            ) : null}

            <InviteQR value={url} size={168} />

            <Text style={[styles.linkLabel, { color: c.muted2 }]}>LIEN D'INVITATION</Text>
            <View style={[styles.linkBox, { backgroundColor: c.surface2, borderColor: c.line }]}>
              <Text style={[styles.linkTxt, { color: c.txt }]} numberOfLines={2} selectable>
                {url}
              </Text>
            </View>

            {inv.expires_at ? (
              <Text style={[styles.expires, { color: c.muted }]}>Expire le {inv.expires_at}</Text>
            ) : null}

            <PressableScale
              onPress={onShare}
              style={[styles.shareBtn, { backgroundColor: c.accent, shadowColor: c.accentDim }]}
            >
              <Icon name="share" size={19} color={c.onAccent} />
              <Text style={[styles.shareTxt, { color: c.onAccent }]}>Partager le lien</Text>
            </PressableScale>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 14 },
  segment: { flexDirection: 'row', gap: 10 },
  segItem: { flex: 1, borderRadius: 13, borderWidth: 1, paddingVertical: 12, alignItems: 'center' },
  segTxt: { fontFamily: fonts.bodyBold, fontSize: 13 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: -6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    height: 52,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 15, height: '100%', padding: 0 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 15,
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaTxt: { fontFamily: fonts.display, fontSize: 15 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorTxt: { fontFamily: fonts.bodyMedium, fontSize: 13, flex: 1 },
  resultCard: { borderRadius: 22, padding: 20, borderWidth: 1, alignItems: 'center', gap: 12 },
  demoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  demoTxt: { fontFamily: fonts.bodyBold, fontSize: 11 },
  linkLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    alignSelf: 'flex-start',
  },
  linkBox: { width: '100%', borderRadius: 12, borderWidth: 1, padding: 12 },
  linkTxt: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  expires: { fontFamily: fonts.body, fontSize: 12 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  shareTxt: { fontFamily: fonts.display, fontSize: 14 },
});
