import { createBrowserRouter } from 'react-router';
import { Layout } from './componentes/layout/Layout';
import { EnConstruccionPagina } from './paginas/EnConstruccionPagina';
import { EquiposPagina } from './paginas/EquiposPagina';
import { InicioPagina } from './paginas/InicioPagina';
import { InscripcionesPagina } from './paginas/InscripcionesPagina';
import { NoEncontradaPagina } from './paginas/NoEncontradaPagina';
import { TorneosPagina } from './paginas/TorneosPagina';

/**
 * Rutas de la aplicación. Todas se dibujan dentro del Layout (en su <Outlet />).
 * Equivale a las directivas @page de cada componente en Blazor.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <InicioPagina /> },
      { path: 'torneos', element: <TorneosPagina /> },
      { path: 'equipos', element: <EquiposPagina /> },
      { path: 'inscripciones', element: <InscripcionesPagina /> },
      {
        path: 'posiciones',
        element: <EnConstruccionPagina titulo="Posiciones" etapa={6} />,
      },
      {
        path: 'fixture',
        element: <EnConstruccionPagina titulo="Fixture" etapa={7} />,
      },
      { path: '*', element: <NoEncontradaPagina /> },
    ],
  },
]);
