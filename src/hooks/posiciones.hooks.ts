import { skipToken, useQuery } from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import { posicionesServicio } from '../servicios/posiciones.servicio';

/*
 * Hooks de la tabla de posiciones y el detalle de equipo. Solo consultan: las posiciones se
 * calculan en el backend a partir de los partidos, no se editan.
 */

/** Tabla de posiciones del torneo. Con torneoId null no pide nada. */
export function usePosiciones(torneoId: number | null) {
  return useQuery({
    queryKey: clavesConsulta.posiciones(torneoId ?? 0),
    queryFn:
      torneoId === null
        ? skipToken
        : ({ signal }) =>
            posicionesServicio.obtenerPosiciones(torneoId, signal),
  });
}

/** Detalle de un equipo en un torneo: su línea de la tabla, sus partidos y sus jugadores. */
export function useDetalleEquipo(torneoId: number, equipoId: number) {
  return useQuery({
    queryKey: clavesConsulta.detalleEquipo(torneoId, equipoId),
    queryFn: ({ signal }) =>
      posicionesServicio.obtenerDetalleEquipo(torneoId, equipoId, signal),
  });
}
