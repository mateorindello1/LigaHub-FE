import type { EstadoPartido, EstadoTorneo } from './estados';

/** Tipo de evento. Los valores coinciden con los del backend (Evento.tipoEvento). */
export const TipoEvento = {
  Gol: 1,
  GolEnContra: 2,
  Amonestacion: 3,
  Expulsion: 4,
  Cambio: 5,
} as const;
export type TipoEvento = (typeof TipoEvento)[keyof typeof TipoEvento];

export const NOMBRES_TIPO_EVENTO: Record<TipoEvento, string> = {
  [TipoEvento.Gol]: 'Gol',
  [TipoEvento.GolEnContra]: 'Gol en contra',
  [TipoEvento.Amonestacion]: 'Amonestación',
  [TipoEvento.Expulsion]: 'Expulsión',
  [TipoEvento.Cambio]: 'Cambio',
};

/** Jugador del plantel en la planilla. */
export interface JugadorPlanilla {
  inscripcionJugadorId: string;
  jugadorId: number;
  nombres: string;
  apellidos: string;
  dorsal: number;
  capitan: boolean;
  /** Figura entre los que participaron del partido. */
  jugo: boolean;
  /** Cumple una suspensión en este partido: no puede jugarlo. */
  suspendido: boolean;
}

/** Uno de los dos equipos, con su plantel en el torneo. */
export interface EquipoPlanilla {
  id: number;
  nombre: string;
  escudoURL: string | null;
  plantel: JugadorPlanilla[];
}

/** Evento del partido. Los jugadores se identifican por su inscripción en el equipo. */
export interface EventoPlanilla {
  id: string;
  tipoEvento: TipoEvento;
  minuto: number;
  inscripcionJugadorId: string;
  /** Solo en un cambio: el jugador que entra. */
  inscripcionJugadorEntraId: string | null;
}

/** Planilla del partido (GET /partidos/:id). */
export interface PlanillaPartido {
  id: string;
  estadoPartido: EstadoPartido;
  /** UTC (ISO 8601), o null si no está programado. */
  fechaHora: string | null;
  numeroFecha: number;
  torneo: { id: number; nombre: string; estadoTorneo: EstadoTorneo };
  cancha: { numero: number; predio: string } | null;
  golesLocal: number | null;
  golesVisitante: number | null;
  local: EquipoPlanilla;
  visitante: EquipoPlanilla;
  /** Por minuto. */
  eventos: EventoPlanilla[];
}

/** Evento a enviar al cargar el resultado. */
export type EventoACargar = Omit<EventoPlanilla, 'id'>;

/** Resultado a cargar (PUT /partidos/:id/resultado). Reemplaza lo que hubiera. */
export interface CargarResultado {
  /** Finalizado (jugado), W.O. o suspendido. */
  estadoPartido: EstadoPartido;
  /** Solo jugado: inscripciones de los jugadores que participaron. */
  jugadores?: string[];
  /** Solo jugado. El marcador lo calcula el backend a partir de los goles. */
  eventos?: EventoACargar[];
  /** Solo W.O.: el equipo que se presentó. */
  equipoGanadorId?: number;
}
