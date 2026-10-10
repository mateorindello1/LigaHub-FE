import { createBrowserRouter } from 'react-router';
import { Layout } from './componentes/layout/Layout';
import { DetalleEquipoPagina } from './paginas/DetalleEquipoPagina';
import { EquiposPagina } from './paginas/EquiposPagina';
import { FixturePagina } from './paginas/FixturePagina';
import { InicioPagina } from './paginas/InicioPagina';
import { InscripcionesPagina } from './paginas/InscripcionesPagina';
import { NoEncontradaPagina } from './paginas/NoEncontradaPagina';
import { PosicionesPagina } from './paginas/PosicionesPagina';
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
      { path: 'posiciones', element: <PosicionesPagina /> },
      {
        path: 'posiciones/:torneoId/equipos/:equipoId',
        element: <DetalleEquipoPagina />,
      },
      { path: 'fixture', element: <FixturePagina /> },
      { path: '*', element: <NoEncontradaPagina /> },
    ],
  },
]);
