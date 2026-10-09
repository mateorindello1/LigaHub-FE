import type { Equipo } from './equipo';

/** Inscripción de un equipo en un torneo (GET /torneos/:torneoId/inscripciones). */
export interface InscripcionEquipo {
  /** UUID de la inscripción. */
  id: string;
  torneoId: number;
  equipoId: number;
  equipo: Equipo;
}

/** Datos para inscribir o cambiar el equipo de una inscripción. */
export interface DatosInscripcionEquipo {
  equipoId: number;
}
