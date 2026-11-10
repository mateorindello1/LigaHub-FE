/**
 * Roles de usuario. Los valores coinciden con los del backend (UsuarioRol.rol y el enum Rol).
 * Mismo patrón "objeto as const + tipo" que los estados (ver estados.ts).
 */
export const Rol = {
  Administrador: 1,
  Asistente: 2,
  Jugador: 3,
} as const;
export type Rol = (typeof Rol)[keyof typeof Rol];

export const NOMBRES_ROL: Record<Rol, string> = {
  [Rol.Administrador]: 'Administrador',
  [Rol.Asistente]: 'Asistente',
  [Rol.Jugador]: 'Jugador',
};

/** Usuario de la sesión, tal como lo devuelven POST /auth/login y GET /auth/yo. */
export interface UsuarioSesion {
  id: number;
  email: string;
  fotoPerfilURL: string | null;
  /** Jugador asociado (solo para usuarios con rol Jugador). */
  jugadorId: number | null;
  /** Nombre del jugador asociado, o null si no tiene. */
  jugador: { id: number; nombres: string; apellidos: string } | null;
  roles: Rol[];
}

/** Datos para iniciar sesión (POST /auth/login). */
export interface DatosLogin {
  email: string;
  contrasenia: string;
}

/**
 * Respuesta de POST /auth/login y POST /auth/refrescar. El token de refresco no viene acá: la API
 * lo deja en una cookie httpOnly, que el JavaScript no puede leer.
 */
export interface RespuestaLogin {
  /** Token de acceso que se envía en cada pedido: "Authorization: Bearer <token>". Dura 15 minutos. */
  token: string;
  /** Vencimiento del token de acceso (UTC, ISO 8601). */
  expira: string;
  usuario: UsuarioSesion;
}
