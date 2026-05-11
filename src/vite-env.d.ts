/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PUBLIC_CLIENT_ID: string;
  readonly VITE_PUBLIC_CALLBACK_URL: string;
  readonly VITE_PUBLIC_SCOPE: string;
  readonly VITE_PUBLIC_AUTH_URL: string;
  readonly VITE_PUBLIC_LOGOUT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
