import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import { ErrorApi } from './api/error-api';
import { ProveedorNotificaciones } from './componentes/notificaciones/ProveedorNotificaciones';
import { router } from './rutas';

/** Configuración de TanStack Query para toda la aplicación. */
const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      // Durante 30 segundos los datos se consideran actuales y no se vuelven a pedir.
      staleTime: 30_000,
      // No reintenta los errores del pedido (4xx): repetirlo daría el mismo resultado.
      retry: (intentos, error) =>
        !(error instanceof ErrorApi && error.esErrorDelCliente) && intentos < 2,
      refetchOnWindowFocus: false,
    },
  },
});

/** Componente raíz: proveedores globales (datos y notificaciones) y rutas. */
export default function App() {
  return (
    <QueryClientProvider client={clienteConsultas}>
      <ProveedorNotificaciones>
        <RouterProvider router={router} />
      </ProveedorNotificaciones>
    </QueryClientProvider>
  );
}
