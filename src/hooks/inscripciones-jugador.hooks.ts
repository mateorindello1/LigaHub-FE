import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type {
  CrearInscripcionJugador,
  ModificarInscripcionJugador,
} from '../modelos/inscripcion-jugador';
import { inscripcionesEquipoServicio } from '../servicios/inscripciones-equipo.servicio';
import { inscripcionesJugadorServicio } from '../servicios/inscripciones-jugador.servicio';

/*
 * Hooks del plantel de un equipo en un torneo (ver torneos.hooks.ts). Dependen del torneo y de la
 * inscripción del equipo: cada hook recibe los dos ids.
 *
 * Después de cada operación se invalidan:
 * - ['torneos', torneoId]: el plantel y el detalle del equipo (que lista los jugadores).
 * - ['jugadores']: qué jugadores quedan disponibles y las inscripciones de cada uno.
 */

/** Invalida el torneo y los jugadores después de una operación exitosa. */
function useInvalidarPlantel(torneoId: number) {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all([
      clienteConsultas.invalidateQueries({
        queryKey: clavesConsulta.torneo(torneoId),
      }),
      clienteConsultas.invalidateQueries({
        queryKey: clavesConsulta.jugadores,
      }),
    ]);
}

/** La inscripción del equipo (con el nombre y el escudo), para el encabezado del plantel. */
export function useInscripcionEquipo(torneoId: number, inscripcionId: string) {
  return useQuery({
    queryKey: clavesConsulta.inscripcion(torneoId, inscripcionId),
    queryFn: ({ signal }) =>
      inscripcionesEquipoServicio.obtenerPorId(torneoId, inscripcionId, signal),
  });
}

/** Jugadores inscriptos en el equipo, por dorsal. */
export function usePlantel(torneoId: number, inscripcionId: string) {
  return useQuery({
    queryKey: clavesConsulta.plantel(torneoId, inscripcionId),
    queryFn: ({ signal }) =>
      inscripcionesJugadorServicio.obtenerPlantel(
        torneoId,
        inscripcionId,
        signal,
      ),
  });
}

/** Inscribe un jugador en el equipo. */
export function useInscribirJugador(torneoId: number, inscripcionId: string) {
  const invalidar = useInvalidarPlantel(torneoId);
  return useMutation({
    mutationFn: (datos: CrearInscripcionJugador) =>
      inscripcionesJugadorServicio.crear(torneoId, inscripcionId, datos),
    onSuccess: invalidar,
  });
}

/** Cambia el dorsal o la capitanía de un jugador del equipo. */
export function useModificarInscripcionJugador(
  torneoId: number,
  inscripcionId: string,
) {
  const invalidar = useInvalidarPlantel(torneoId);
  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: ModificarInscripcionJugador;
    }) =>
      inscripcionesJugadorServicio.modificar(
        torneoId,
        inscripcionId,
        id,
        datos,
      ),
    onSuccess: invalidar,
  });
}

/** Da de baja a un jugador del equipo. */
export function useBorrarInscripcionJugador(
  torneoId: number,
  inscripcionId: string,
) {
  const invalidar = useInvalidarPlantel(torneoId);
  return useMutation({
    mutationFn: (id: string) =>
      inscripcionesJugadorServicio.borrar(torneoId, inscripcionId, id),
    onSuccess: invalidar,
  });
}
