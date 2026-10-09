/**
 * Configuración que depende del ambiente, leída de las variables VITE_ del archivo .env.
 * Equivale al appsettings.json de wwwroot en Blazor WebAssembly.
 */
export const entorno = {
  /** URL base de la API, sin barra final. */
  apiUrl: (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  ),
};
