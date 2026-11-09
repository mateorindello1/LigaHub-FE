import { createContext, useContext } from 'react';
import type { DatosLogin, Rol, UsuarioSesion } from '../../modelos/sesion';

/** Lo que ofrece el contexto de sesión a los componentes. */
export interface ContextoSesionValor {
  /** Usuario de la sesión, o null si no inició sesión. */
  usuario: UsuarioSesion | null;
  /** Inicia sesión. Si las credenciales no son válidas, la promesa falla con un ErrorApi. */
  iniciarSesion: (datos: DatosLogin) => Promise<UsuarioSesion>;
  cerrarSesion: () => void;
  /** Indica si el usuario de la sesión tiene alguno de los roles. */
  tieneRol: (...roles: Rol[]) => boolean;
}

/**
 * Contexto de la sesión. Equivale al AuthenticationStateProvider de Blazor: cualquier componente
 * puede saber quién inició sesión y con qué roles.
 */
export const ContextoSesion = createContext<ContextoSesionValor | null>(null);

/** Hook para usar la sesión desde cualquier componente. */
export function useSesion(): ContextoSesionValor {
  const sesion = useContext(ContextoSesion);
  if (!sesion) {
    throw new Error('useSesion se tiene que usar dentro de ProveedorSesion.');
  }
  return sesion;
}
