/** Equipo, tal como lo devuelve la API (GET /equipos). */
export interface Equipo {
  id: number;
  nombre: string;
  /** URL del escudo, o null si no tiene. */
  escudoURL: string | null;
}

/** Datos para crear un equipo (POST /equipos). */
export interface CrearEquipo {
  nombre: string;
  escudoURL?: string | null;
}

/** Datos para modificar un equipo (PATCH /equipos/:id). escudoURL: null quita el escudo. */
export type ModificarEquipo = Partial<CrearEquipo>;
