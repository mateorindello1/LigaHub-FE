/** Cancha de un predio. */
export interface Cancha {
  id: number;
  numero: number;
  /** Por ejemplo: "Fútbol 7, césped sintético". */
  descripcion: string;
}

/** Predio con sus canchas, tal como lo devuelve la API (GET /predios). */
export interface Predio {
  id: number;
  nombre: string;
  direccion: string;
  canchas: Cancha[];
}

/** Datos para crear o modificar un predio. */
export interface DatosPredio {
  nombre: string;
  direccion: string;
}

/** Datos para crear o modificar una cancha (el predio va en la ruta). */
export interface DatosCancha {
  numero: number;
  descripcion: string;
}
