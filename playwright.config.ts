import { readFileSync } from 'node:fs';
import { defineConfig } from '@playwright/test';
import { config, parse } from 'dotenv';

/**
 * Tests end-to-end (pnpm test:e2e): Playwright abre un navegador real y recorre la aplicación
 * completa (frontend + API + base de Azure), como lo haría una persona.
 *
 * - Usa el Microsoft Edge instalado (channel 'msedge'): no hace falta descargar navegadores.
 * - Levanta el frontend y la API si no están corriendo; si ya lo están, los reutiliza.
 *   La API es el repositorio hermano ../LigaHub-BE (los dos clonados en la misma carpeta).
 * - Los tests corren de a uno: comparten la base y modifican datos del seed (y los restauran).
 * - La contraseña de los usuarios del seed se lee de E2E_CONTRASENIA o, si no está, de
 *   SEED_CONTRASENIA del .env del backend. Nunca se escribe en el código.
 */

/** Lee una variable del .env del backend, si el archivo existe. */
function leerEnvBackend(variable: string): string | undefined {
  try {
    return parse(readFileSync('../LigaHub-BE/.env'))[variable];
  } catch {
    return undefined;
  }
}

// Primero el .env del frontend (E2E_CONTRASENIA, opcional) y, si no está, el del backend.
config({ quiet: true });
process.env.E2E_CONTRASENIA ??= leerEnvBackend('SEED_CONTRASENIA');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  // La base de Azure se pausa sola: el primer pedido después de una pausa puede tardar.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    // Reporte HTML con el resultado de cada paso: es la evidencia de ejecución de los tests.
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'msedge',
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm start',
      cwd: '../LigaHub-BE',
      url: 'http://localhost:3000/torneos',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'pnpm dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
