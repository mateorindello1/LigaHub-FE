import { clienteApi } from '../api/cliente-api';
import type { DetalleEquipo, FilaPosiciones } from '../modelos/posiciones';

/** Servicio de la tabla de posiciones y el detalle de equipo por torneo. */
export const posicionesServicio = {
  obtenerPosiciones: (torneoId: number, signal?: AbortSignal) =>
    clienteApi.get<FilaPosiciones[]>(`/torneos/${torneoId}/posiciones`, signal),
  obtenerDetalleEquipo: (
    torneoId: number,
    equipoId: number,
    signal?: AbortSignal,
  ) =>
    clienteApi.get<DetalleEquipo>(
      `/torneos/${torneoId}/equipos/${equipoId}`,
      signal,
    ),
};
