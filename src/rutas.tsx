import { createBrowserRouter } from 'react-router';
import { Cargando } from './componentes/comunes/Cargando';
import { Layout } from './componentes/layout/Layout';
import { ErrorRutaPagina } from './paginas/ErrorRutaPagina';
import { InicioPagina } from './paginas/InicioPagina';
import { NoEncontradaPagina } from './paginas/NoEncontradaPagina';

/**
 * Rutas de la aplicación. Todas se dibujan dentro del Layout (en su <Outlet />).
 * Equivale a las directivas @page de cada componente en Blazor.
 *
 * Carga diferida ("lazy"): el código de cada pantalla con grilla o formularios se descarga
 * recién la primera vez que se entra. Así el inicio carga menos (la grilla de Syncfusion es
 * lo más pesado). Es como el lazy loading de ensamblados de Blazor WebAssembly.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    // Mientras se carga la primera pantalla al abrir la aplicación.
    hydrateFallbackElement: <Cargando texto="Cargando LigaHub…" />,
    children: [
      {
        // Ruta sin dirección propia: agrupa las pantallas para que un error inesperado se muestre
        // dentro del Layout (con la barra y el menú) y no en una página en blanco.
        errorElement: <ErrorRutaPagina />,
        children: [
          { index: true, element: <InicioPagina /> },
          {
            path: 'torneos',
            lazy: async () => ({
              Component: (await import('./paginas/TorneosPagina'))
                .TorneosPagina,
            }),
          },
          {
            path: 'equipos',
            lazy: async () => ({
              Component: (await import('./paginas/EquiposPagina'))
                .EquiposPagina,
            }),
          },
          {
            path: 'inscripciones',
            lazy: async () => ({
              Component: (await import('./paginas/InscripcionesPagina'))
                .InscripcionesPagina,
            }),
          },
          {
            path: 'posiciones',
            lazy: async () => ({
              Component: (await import('./paginas/PosicionesPagina'))
                .PosicionesPagina,
            }),
          },
          {
            path: 'posiciones/:torneoId/equipos/:equipoId',
            lazy: async () => ({
              Component: (await import('./paginas/DetalleEquipoPagina'))
                .DetalleEquipoPagina,
            }),
          },
          {
            path: 'fixture',
            lazy: async () => ({
              Component: (await import('./paginas/FixturePagina'))
                .FixturePagina,
            }),
          },
          { path: '*', element: <NoEncontradaPagina /> },
        ],
      },
    ],
  },
]);
