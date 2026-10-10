import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Puerto fijo: el backend solo acepta pedidos (CORS) desde http://localhost:5173.
    port: 5173,
    strictPort: true,
  },
  build: {
    // La grilla de Syncfusion es un solo módulo de ~730 KB (160 KB comprimido) y no se puede
    // partir. Se descarga recién al entrar a una pantalla que la usa (rutas con carga diferida),
    // así que no afecta la carga inicial. El límite por defecto de Vite es 500 KB.
    chunkSizeWarningLimit: 800,
  },
});
