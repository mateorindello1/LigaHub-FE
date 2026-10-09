import type { EstadoTorneo } from './estados';

/** Torneo, tal como lo devuelve la API (GET /torneos). */
export interface Torneo {
  id: number;
  nombre: string;
  anio: number;
  estadoTorneo: EstadoTorneo;
}

/** Datos para crear un torneo (POST /torneos). */
export interface CrearTorneo {
  nombre: string;
  anio: number;
}

/** Datos para modificar un torneo (PATCH /torneos/:id): solo se envía lo que cambia. */
export type ModificarTorneo = Partial<CrearTorneo>;
