/**
 * Amarillas que hay que acumular para una fecha de suspensión. Es la regla del backend
 * (calcularSuspensiones); acá se usa solo para los textos.
 */
export const AMONESTACIONES_PARA_SUSPENSION = 5;

export type MotivoSancion = 'Expulsion' | 'Amonestaciones';

/** Jugador amonestado o expulsado. */
export interface JugadorSancionado {
  inscripcionJugadorId: string;
  jugador: { id: number; nombres: string; apellidos: string };
  equipo: { id: number; nombre: string };
}

/** Partido en el que el jugador no puede jugar por una sanción. */
export interface PartidoSuspendido {
  partidoId: string;
  numeroFecha: number;
  /** Ya se jugó: esa fecha de suspensión está cumplida. */
  cumplida: boolean;
}

/** Una sanción y los partidos en que se cumple. */
export interface Sancion extends JugadorSancionado {
  motivo: MotivoSancion;
  /** Fecha en que se recibió. */
  numeroFecha: number;
  /** Fechas de suspensión. */
  fechas: number;
  /** Puede tener menos que "fechas" si al equipo no le quedan partidos. */
  partidos: PartidoSuspendido[];
  cumplida: boolean;
}

/** Tarjetas de un jugador en el torneo. */
export interface ResumenTarjetas extends JugadorSancionado {
  amonestaciones: number;
  expulsiones: number;
  /** Amarillas que cuentan para la próxima suspensión. */
  amonestacionesAcumuladas: number;
}

/** Respuesta de GET /torneos/:id/suspensiones. */
export interface Suspensiones {
  /** Pendientes primero. */
  sanciones: Sancion[];
  tarjetas: ResumenTarjetas[];
}
