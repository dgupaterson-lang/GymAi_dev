import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AxiosError } from 'axios';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import AuthField from '@/components/ui/AuthField';
import { useAuthStore } from '@/store';

/** Écran de connexion : email + mot de passe. */
export default function Login() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const busy = useAuthStore((s) => s.busy);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Renseigne ton email et ton mot de passe.');
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(errorMessage(e));
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
          { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PressableScale onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <Icon name="arrow_back" size={22} color={c.txt} />
        </PressableScale>

        <View style={styles.logoRow}>
          <View style={[styles.logoMark, { backgroundColor: c.accent, shadowColor: c.accent }]}>
            <Icon name="fitness_center" size={22} color={c.onAccent} />
          </View>
          <Text style={[styles.wordmark, { color: c.txt }]}>
            Gym<Text style={{ color: c.accent }}>AI</Text>
          </Text>
        </View>

        <Text style={[styles.title, { color: c.txt }]}>Bon retour</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Connecte-toi pour reprendre l'entraînement.
        </Text>

        <View style={styles.form}>
          <AuthField
            label="Email"
            icon="mail"
            placeholder="toi@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
          />
          <AuthField
            label="Mot de passe"
            icon="lock"
            placeholder="••••••••"
            secure
            autoCapitalize="none"
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />

          {error ? (
            <View style={styles.errorRow}>
              <Icon name="error_outline" size={16} color={c.warn} />
              <Text style={[styles.errorTxt, { color: c.warn }]}>{error}</Text>
            </View>
          ) : null}

          <PressableScale
            onPress={onSubmit}
            disabled={busy}
            style={[
              styles.cta,
              { backgroundColor: c.accent, shadowColor: c.accentDim, opacity: busy ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.ctaTxt, { color: c.onAccent }]}>
              {busy ? 'Connexion…' : 'Se connecter'}
            </Text>
          </PressableScale>
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchTxt, { color: c.muted }]}>Pas encore de compte ?</Text>
          <PressableScale onPress={() => router.replace('/(auth)/register')} hitSlop={8}>
            <Text style={[styles.switchLink, { color: c.accent }]}>Créer un compte</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function errorMessage(e: unknown): string {
  if (e instanceof AxiosError) {
    if (e.response?.status === 401 || e.response?.status === 400) {
      return 'Email ou mot de passe incorrect.';
    }
    if (!e.response) {
      return 'Serveur injoignable. Vérifie ta connexion (ou l\'URL de l\'API).';
    }
  }
  return 'Une erreur est survenue. Réessaie.';
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24 },
  back: { alignSelf: 'flex-start', padding: 6, marginBottom: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  wordmark: { fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 28, letterSpacing: -0.8 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, marginTop: 8, lineHeight: 20 },
  form: { marginTop: 28 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  errorTxt: { fontFamily: fonts.bodyMedium, fontSize: 13, flex: 1 },
  cta: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowOpacity: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  ctaTxt: { fontFamily: fonts.display, fontSize: 15 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  switchTxt: { fontFamily: fonts.body, fontSize: 13.5 },
  switchLink: { fontFamily: fonts.bodyBold, fontSize: 13.5 },
});
