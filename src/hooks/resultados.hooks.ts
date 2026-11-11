import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type { CargarResultado } from '../modelos/partido';
import { partidosServicio } from '../servicios/partidos.servicio';

/*
 * Hooks del caso de uso "cargar el resultado de un partido" (ver torneos.hooks.ts).
 * Cargar o anular un resultado invalida:
 * - ['partidos']: la planilla y las de los demás partidos, porque una expulsión o una amarilla
 *   cambia quién está suspendido en los partidos siguientes.
 * - ['torneos', torneoId]: el fixture, la tabla de posiciones, el detalle de los equipos, los
 *   goleadores y las suspensiones, que se calculan a partir de los partidos. Así "se actualizan
 *   solos" también en pantalla.
 * - ['jugadores']: un jugador que jugó ya no se puede dar de baja del plantel.
 */

function useInvalidarResultado(torneoId: number) {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all(
      [
        clavesConsulta.partidos,
        clavesConsulta.torneo(torneoId),
        clavesConsulta.jugadores,
      ].map((clave) => clienteConsultas.invalidateQueries({ queryKey: clave })),
    );
}

/** Planilla del partido: planteles, quién jugó, marcador y eventos. */
export function usePlanilla(id: string) {
  return useQuery({
    queryKey: clavesConsulta.partido(id),
    queryFn: ({ signal }) => partidosServicio.obtenerPlanilla(id, signal),
  });
}

/** Carga (o reemplaza) el resultado del partido. */
export function useCargarResultado(id: string, torneoId: number) {
  const invalidar = useInvalidarResultado(torneoId);
  return useMutation({
    mutationFn: (datos: CargarResultado) =>
      partidosServicio.cargarResultado(id, datos),
    onSuccess: invalidar,
  });
}

/** Anula el resultado: el partido vuelve a Programado. */
export function useAnularResultado(id: string, torneoId: number) {
  const invalidar = useInvalidarResultado(torneoId);
  return useMutation({
    mutationFn: () => partidosServicio.anularResultado(id),
    onSuccess: invalidar,
  });
}
