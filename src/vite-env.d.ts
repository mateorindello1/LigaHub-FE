/// <reference types="vite/client" />

/** Variables de entorno de la aplicación (archivo .env). Ver .env.example. */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SYNCFUSION_LICENSE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
