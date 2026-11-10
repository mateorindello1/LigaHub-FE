import { clienteApi } from '../api/cliente-api';
import type {
  CrearInscripcionJugador,
  InscripcionJugador,
  ModificarInscripcionJugador,
} from '../modelos/inscripcion-jugador';

const ruta = (torneoId: number, inscripcionId: string) =>
  `/torneos/${torneoId}/inscripciones/${inscripcionId}/jugadores`;

/**
 * Servicio de inscripciones de jugadores: el plantel de un equipo en un torneo
 * (/torneos/:torneoId/inscripciones/:inscripcionId/jugadores).
 */
export const inscripcionesJugadorServicio = {
  obtenerPlantel: (
    torneoId: number,
    inscripcionId: string,
    signal?: AbortSignal,
  ) =>
    clienteApi.get<InscripcionJugador[]>(ruta(torneoId, inscripcionId), signal),
  crear: (
    torneoId: number,
    inscripcionId: string,
    datos: CrearInscripcionJugador,
  ) =>
    clienteApi.post<InscripcionJugador>(ruta(torneoId, inscripcionId), datos),
  modificar: (
    torneoId: number,
    inscripcionId: string,
    id: string,
    datos: ModificarInscripcionJugador,
  ) =>
    clienteApi.patch<InscripcionJugador>(
      `${ruta(torneoId, inscripcionId)}/${id}`,
      datos,
    ),
  borrar: (torneoId: number, inscripcionId: string, id: string) =>
    clienteApi.delete(`${ruta(torneoId, inscripcionId)}/${id}`),
};
