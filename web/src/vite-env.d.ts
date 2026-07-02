/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de l'API GymAI (défaut http://localhost:8000/api/v1). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
