/**
 * Preparación común de los tests de componentes (setupFiles de vitest.config.ts).
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Agrega a expect los comparadores del DOM: toBeInTheDocument, toHaveTextContent, toBeDisabled…
// (el import de arriba). Y desmonta lo dibujado después de cada test, para que no se mezclen.
afterEach(() => {
  cleanup();
});

// jsdom no implementa matchMedia, que usan algunos componentes de Syncfusion (por ejemplo, para
// las columnas que se ocultan según el ancho). Se simula una pantalla que no cumple ninguna media.
if (!window.matchMedia) {
  window.matchMedia = (consulta: string) =>
    ({
      matches: false,
      media: consulta,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
