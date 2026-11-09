import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
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
 * - Lee la sesión guardada (sobrevive a recargar la página, no a cerrar la pestaña).
 * - Al abrir la aplicación con una sesión guardada, la revalida con GET /auth/yo: si el usuario
 *   cambió (por ejemplo, sus roles) se actualiza, y si el token ya no sirve se cierra.
 * - Cierra la sesión sola cuando vence el token, y avisa.
 */
export function ProveedorSesion({ children }: Props) {
  const notificaciones = useNotificaciones();

  // useSyncExternalStore: lee un almacén externo a React y vuelve a dibujar cuando cambia.
  const sesion = useSyncExternalStore(
    sesionGuardada.suscribir,
    sesionGuardada.obtener,
  );

  // Revalidación al abrir la aplicación (una sola vez).
  useEffect(() => {
    if (!sesionGuardada.obtener()) return;
    const cancelacion = new AbortController();
    authServicio
      .obtenerUsuarioActual(cancelacion.signal)
      .then((usuario) => sesionGuardada.actualizarUsuario(usuario))
      .catch(() => {
        // Un 401 ya cerró la sesión en el cliente de API. Otros errores (por ejemplo, sin
        // conexión) no la cierran: se sigue con los datos guardados.
      });
    return () => cancelacion.abort();
  }, []);

  // Cierre automático al vencer el token.
  useEffect(() => {
    if (!sesion) return;
    const milisegundos = new Date(sesion.expira).getTime() - Date.now();
    const temporizador = setTimeout(
      () => sesionGuardada.borrar('vencida'),
      Math.max(milisegundos, 0),
    );
    return () => clearTimeout(temporizador);
  }, [sesion]);

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

  const cerrarSesion = useCallback(() => sesionGuardada.borrar('cierre'), []);

  const valor = useMemo<ContextoSesionValor>(() => {
    const usuario = sesion?.usuario ?? null;
    return {
      usuario,
      iniciarSesion,
      cerrarSesion,
      tieneRol: (...roles: Rol[]) =>
        usuario?.roles.some((rol) => roles.includes(rol)) ?? false,
    };
  }, [sesion, iniciarSesion, cerrarSesion]);

  return (
    <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
  );
}
