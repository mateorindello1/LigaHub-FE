import { defineConfig, mergeConfig } from 'vitest/config';
import configuracionVite from './vite.config.ts';

/**
 * Tests unitarios y de componentes (pnpm test). Reusa la configuración de Vite (el plugin de
 * React) y agrega la de Vitest:
 * - jsdom: un DOM simulado en Node, para dibujar componentes sin abrir un navegador.
 * - Los tests son los *.test.ts(x) de src; los end-to-end (e2e/) los corre Playwright.
 */
export default mergeConfig(
  configuracionVite,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/preparacion.ts'],
      css: false,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
      },
    },
  }),
);
