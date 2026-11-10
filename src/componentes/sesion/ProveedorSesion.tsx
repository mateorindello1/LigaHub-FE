import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { refrescarSesion } from '../../api/refresco-sesion';
import { sesionGuardada } from '../../api/sesion-guardada';
import type { DatosLogin, Rol } from '../../modelos/sesion';
import { authServicio } from '../../servicios/auth.servicio';
import { useNotificaciones } from '../notificaciones/contexto-notificaciones';
import { ContextoSesion, type ContextoSesionValor } from './contexto-sesion';

interface Props {
  children: ReactNode;
}

/**
 * Administra la sesión y la ofrece a toda la aplicación a través del contexto.
 * - Al abrir la aplicación (o recargar la página) recupera la sesión con la cookie del token de
 *   refresco: el token de acceso vive solo en memoria y se pierde al recargar.
 * - Mientras tanto, `verificando` es true y las pantallas protegidas esperan.
 * - Avisa cuando la sesión se cierra por vencimiento.
 */
export function ProveedorSesion({ children }: Props) {
  const notificaciones = useNotificaciones();

  // useSyncExternalStore: lee un almacén externo a React y vuelve a dibujar cuando cambia.
  const sesion = useSyncExternalStore(
    sesionGuardada.suscribir,
    sesionGuardada.obtener,
  );
  const verificada = useSyncExternalStore(
    sesionGuardada.suscribir,
    sesionGuardada.estaVerificada,
  );

  // Recuperación de la sesión al abrir la aplicación (una sola vez). En desarrollo StrictMode
  // ejecuta el efecto dos veces, pero refrescarSesion unifica los pedidos simultáneos.
  useEffect(() => {
    if (sesionGuardada.estaVerificada()) return;
    refrescarSesion()
      .then((recuperada) => {
        if (recuperada) sesionGuardada.guardar(recuperada);
      })
      .catch(() => {
        // Sin conexión o error del servidor: se sigue sin sesión, la aplicación funciona igual
        // para las consultas públicas.
      })
      .finally(() => sesionGuardada.marcarVerificada());
  }, []);

  // Aviso cuando la sesión se cierra por vencimiento (no cuando el usuario sale a propósito).
  useEffect(
    () =>
      sesionGuardada.suscribir(() => {
        if (
          !sesionGuardada.obtener() &&
          sesionGuardada.ultimoMotivo() === 'vencida'
        ) {
          notificaciones.error('Tu sesión venció. Iniciá sesión de nuevo.');
        }
      }),
    [notificaciones],
  );

  const iniciarSesion = useCallback(async (datos: DatosLogin) => {
    const respuesta = await authServicio.iniciarSesion(datos);
    sesionGuardada.guardar(respuesta);
    return respuesta.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    // La sesión se cierra en el momento en la interfaz; la API revoca el token de refresco y
    // borra la cookie. Si ese pedido falla (sin conexión), la sesión vence sola.
    sesionGuardada.borrar('cierre');
    authServicio.cerrarSesion().catch(() => undefined);
  }, []);

  const valor = useMemo<ContextoSesionValor>(() => {
    const usuario = sesion?.usuario ?? null;
    return {
      usuario,
      verificando: !verificada,
      iniciarSesion,
      cerrarSesion,
      tieneRol: (...roles: Rol[]) =>
        usuario?.roles.some((rol) => roles.includes(rol)) ?? false,
    };
  }, [sesion, verificada, iniciarSesion, cerrarSesion]);

  return (
    <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
  );
}
