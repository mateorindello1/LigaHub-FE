import type { EstadoPartido } from './estados';

/** Partido del fixture. */
export interface PartidoFixture {
  id: string;
  estadoPartido: EstadoPartido;
  /** Fecha y hora en UTC (ISO 8601), o null si no está programado. Mostrar en hora local. */
  fechaHora: string | null;
  local: { id: number; nombre: string };
  visitante: { id: number; nombre: string };
  golesLocal: number | null;
  golesVisitante: number | null;
  /** Null si todavía no se asignó cancha. predio es el nombre del predio. */
  cancha: {
    id: number;
    numero: number;
    predioId: number;
    predio: string;
  } | null;
}

/** Una fecha del fixture (GET /torneos/:torneoId/fixture). */
export interface FechaFixture {
  id: string;
  numeroFecha: number;
  partidos: PartidoFixture[];
  /** Equipo que no juega en esta fecha (cantidad impar de equipos). */
  equipoLibre: { id: number; nombre: string } | null;
}

/** Opciones para generar el fixture (POST /torneos/:torneoId/fixture). */
export interface GenerarFixture {
  idaYVuelta?: boolean;
  /** Fecha y hora de la primera fecha, en ISO 8601. */
  fechaInicio?: string;
}

/**
 * Programación de un partido (PATCH /partidos/:id/programacion). Solo se cambia lo que se envía;
 * null deja el dato "a confirmar".
 */
export interface ProgramarPartido {
  /** Día y hora en ISO 8601. */
  fechaHora?: string | null;
  canchaId?: number | null;
}

/** Respuesta de PATCH /partidos/:id/programacion. */
export type PartidoProgramado = Pick<
  PartidoFixture,
  'id' | 'estadoPartido' | 'fechaHora' | 'cancha'
>;
