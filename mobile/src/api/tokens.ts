import * as SecureStore from 'expo-secure-store';

/**
 * Stockage sécurisé des JWT via expo-secure-store (Keychain iOS / Keystore Android).
 * Clés : `gymai.access` et `gymai.refresh`.
 *
 * NB : SecureStore n'est pas dispo sur le web. On enveloppe les appels dans des
 * try/catch et on log un warning en repli — l'app ne doit jamais planter à cause
 * du stockage (repli gracieux).
 */
const ACCESS_KEY = 'gymai.access';
const REFRESH_KEY = 'gymai.refresh';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_KEY);
  } catch (e) {
    console.warn('[tokens] getToken a échoué:', e);
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY);
  } catch (e) {
    console.warn('[tokens] getRefreshToken a échoué:', e);
    return null;
  }
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  } catch (e) {
    console.warn('[tokens] setTokens a échoué:', e);
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch (e) {
    console.warn('[tokens] clearTokens a échoué:', e);
  }
}
