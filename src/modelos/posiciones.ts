import type { Equipo } from './equipo';
import type { EstadoPartido, EstadoTorneo } from './estados';

/** Una línea de la tabla de posiciones (GET /torneos/:torneoId/posiciones). */
export interface FilaPosiciones {
  posicion: number;
  equipo: Equipo;
  partidosJugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
  puntos: number;
}

export type ResultadoPartido = 'Ganado' | 'Empatado' | 'Perdido';

/** Un partido del equipo, visto desde el equipo. */
export interface PartidoDetalle {
  id: string;
  numeroFecha: number;
  /** Fecha y hora en UTC (ISO 8601), o null si no está programado. Mostrar en hora local. */
  fechaHora: string | null;
  estadoPartido: EstadoPartido;
  condicion: 'Local' | 'Visitante';
  rival: { id: number; nombre: string };
  golesAFavor: number | null;
  golesEnContra: number | null;
  resultado: ResultadoPartido | null;
  cancha: { numero: number; predio: string } | null;
}

/** Jugador inscripto en el equipo para el torneo. */
export interface JugadorDetalle {
  id: string;
  jugadorId: number;
  nombres: string;
  apellidos: string;
  dorsal: number;
  capitan: boolean;
}

/** Detalle del equipo en un torneo (GET /torneos/:torneoId/equipos/:equipoId). */
export interface DetalleEquipo {
  torneo: {
    id: number;
    nombre: string;
    anio: number;
    estadoTorneo: EstadoTorneo;
  };
  equipo: Equipo;
  inscripcionId: string;
  posicion: Omit<FilaPosiciones, 'equipo'>;
  partidos: PartidoDetalle[];
  jugadores: JugadorDetalle[];
}
