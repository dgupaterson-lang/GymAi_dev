import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store';

/**
 * Point d'entrée : redirige selon l'état de session.
 * - authentifié -> (tabs)/home
 * - sinon        -> (auth)/welcome
 *
 * L'hydratation de la session (lecture SecureStore + GET /me) est déclenchée
 * dans app/_layout.tsx au boot ; le rendu est gaté sur `auth.hydrated` là-bas,
 * donc ici `isAuthenticated` est déjà fiable.
 */
export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <Redirect href={isAuthenticated ? '/(tabs)/home' : '/(auth)/welcome'} />
  );
}
