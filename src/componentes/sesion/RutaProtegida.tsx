import { Navigate, Outlet, useLocation } from 'react-router';
import type { Rol } from '../../modelos/sesion';
import { SinPermisoPagina } from '../../paginas/SinPermisoPagina';
import { useSesion } from './contexto-sesion';

interface Props {
  /** Roles que pueden entrar (alcanza con uno). Sin roles, alcanza con haber iniciado sesión. */
  roles?: Rol[];
}

/**
 * Protege un grupo de rutas: se usa como elemento de una ruta sin dirección y dibuja las rutas
 * hijas (en su <Outlet />) solo si el usuario puede verlas.
 * - Sin sesión: lleva al login y, después de ingresar, vuelve a la pantalla pedida.
 * - Con sesión pero sin el rol: muestra "sin permiso".
 *
 * Equivale a [Authorize(Roles = "...")] en una página de Blazor, o a <AuthorizeRouteView>.
 * Es solo para la experiencia de uso: la protección real está en la API, que rechaza cualquier
 * pedido sin el rol aunque alguien llegue a la pantalla.
 */
export function RutaProtegida({ roles = [] }: Props) {
  const { usuario, tieneRol } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    const volver = encodeURIComponent(ubicacion.pathname + ubicacion.search);
    return <Navigate to={`/login?volver=${volver}`} replace />;
  }
  if (roles.length > 0 && !tieneRol(...roles)) {
    return <SinPermisoPagina />;
  }
  return <Outlet />;
}
