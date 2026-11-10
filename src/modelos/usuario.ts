import type { Rol } from './sesion';

/** Jugador asociado a un usuario: lo justo para mostrar su nombre. */
export interface JugadorDeUsuario {
  id: number;
  nombres: string;
  apellidos: string;
}

/** Usuario, tal como lo devuelve la API (GET /usuarios). Nunca trae la contraseña ni su hash. */
export interface Usuario {
  id: number;
  email: string;
  fotoPerfilURL: string | null;
  /** Jugador asociado (solo para usuarios con rol Jugador). */
  jugadorId: number | null;
  jugador: JugadorDeUsuario | null;
  roles: Rol[];
}

/** Datos para crear un usuario (POST /usuarios). */
export interface CrearUsuario {
  email: string;
  contrasenia: string;
  roles: Rol[];
  jugadorId?: number | null;
}

/**
 * Datos para modificar un usuario (PATCH /usuarios/:id). La contraseña se cambia aparte.
 * jugadorId: null quita el jugador asociado.
 */
export type ModificarUsuario = Partial<Omit<CrearUsuario, 'contrasenia'>>;

/** Datos para cambiar la contraseña de un usuario (PATCH /usuarios/:id/contrasenia). */
export interface CambiarContrasenia {
  contrasenia: string;
}

/** Jugador para elegir en una lista, tal como lo devuelve GET /jugadores. */
export interface JugadorResumen {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  /** Usuario asociado, o null si no tiene. */
  usuarioId: number | null;
}

/** Nombre para mostrar de un jugador: "Apellidos, Nombres". */
export function nombreJugador(jugador: JugadorDeUsuario): string {
  return `${jugador.apellidos}, ${jugador.nombres}`;
}
