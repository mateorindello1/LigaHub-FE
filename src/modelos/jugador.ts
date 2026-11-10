import type { EstadoTorneo } from './estados';

/** Jugador, tal como lo devuelve la API (GET /jugadores). Solo lo ve el Administrador. */
export interface Jugador {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  /** Email de contacto. No es el email con el que inicia sesión su usuario. */
  email: string;
  telefono: string;
  direccion: string;
  /** Usuario asociado, o null si no tiene. */
  usuarioId: number | null;
}

/** Datos para crear un jugador (POST /jugadores). */
export type CrearJugador = Omit<Jugador, 'id' | 'usuarioId'>;

/**
 * Datos para modificar un jugador (PATCH /jugadores/:id). Solo se envía lo que cambia.
 * El propio jugador solo puede enviar los datos de contacto (DatosContactoJugador).
 */
export type ModificarJugador = Partial<CrearJugador>;

/** Datos que el propio jugador puede modificar. */
export type DatosContactoJugador = Pick<
  CrearJugador,
  'email' | 'telefono' | 'direccion'
>;

/** Inscripción del jugador en un equipo de un torneo (en GET /jugadores/:id). */
export interface InscripcionDelJugador {
  id: string;
  dorsal: number;
  capitan: boolean;
  inscripcionEquipoId: string;
  equipo: { id: number; nombre: string; escudoURL: string | null };
  torneo: {
    id: number;
    nombre: string;
    anio: number;
    estadoTorneo: EstadoTorneo;
  };
}

/** Jugador con sus inscripciones (GET /jugadores/:id): el Administrador o el propio jugador. */
export interface JugadorConInscripciones extends Jugador {
  inscripciones: InscripcionDelJugador[];
}

/** Lo mínimo para mostrar el nombre de un jugador. */
export interface NombreDeJugador {
  nombres: string;
  apellidos: string;
}

/** Nombre para mostrar de un jugador: "Apellidos, Nombres". */
export function nombreJugador(jugador: NombreDeJugador): string {
  return `${jugador.apellidos}, ${jugador.nombres}`;
}
