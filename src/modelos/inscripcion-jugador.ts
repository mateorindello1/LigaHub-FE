/**
 * Jugador inscripto en el equipo de un torneo
 * (GET /torneos/:torneoId/inscripciones/:inscripcionId/jugadores). Es público: no trae datos
 * personales del jugador, solo su nombre.
 */
export interface InscripcionJugador {
  /** UUID de la inscripción del jugador. */
  id: string;
  inscripcionEquipoId: string;
  jugadorId: number;
  dorsal: number;
  capitan: boolean;
  jugador: { id: number; nombres: string; apellidos: string };
}

/** Datos para inscribir un jugador en el equipo. */
export interface CrearInscripcionJugador {
  jugadorId: number;
  dorsal: number;
  capitan: boolean;
}

/** Datos para modificar la inscripción (el jugador no se cambia: se da de baja y se inscribe otro). */
export type ModificarInscripcionJugador = Partial<
  Omit<CrearInscripcionJugador, 'jugadorId'>
>;
