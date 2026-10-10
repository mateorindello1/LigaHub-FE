import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type { DatosInscripcionEquipo } from '../modelos/inscripcion-equipo';
import { inscripcionesEquipoServicio } from '../servicios/inscripciones-equipo.servicio';

/*
 * Hooks de datos de inscripciones (ver torneos.hooks.ts). Las inscripciones dependen de un torneo:
 * cada hook recibe su id.
 *
 * Después de cada operación se invalida ['torneos', torneoId]: se recargan las inscripciones
 * y también las posiciones, el detalle y el fixture de ese torneo, que dependen de quién está inscripto.
 */

/** Equipos inscriptos en el torneo. Con torneoId null (todavía no hay torneo elegido) no pide nada. */
export function useInscripciones(torneoId: number | null) {
  return useQuery({
    queryKey: clavesConsulta.inscripciones(torneoId ?? 0),
    // skipToken: la consulta queda en espera hasta que haya un torneo.
    queryFn:
      torneoId === null
        ? skipToken
        : ({ signal }) =>
            inscripcionesEquipoServicio.obtenerPorTorneo(torneoId, signal),
  });
}

/** Inscribe un equipo en el torneo. */
export function useInscribirEquipo(torneoId: number) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosInscripcionEquipo) =>
      inscripcionesEquipoServicio.crear(torneoId, datos),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({
        queryKey: clavesConsulta.torneo(torneoId),
      }),
  });
}

/** Cambia el equipo de una inscripción. */
export function useModificarInscripcion(torneoId: number) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: DatosInscripcionEquipo;
    }) => inscripcionesEquipoServicio.modificar(torneoId, id, datos),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({
        queryKey: clavesConsulta.torneo(torneoId),
      }),
  });
}

/** Da de baja una inscripción. */
export function useBorrarInscripcion(torneoId: number) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      inscripcionesEquipoServicio.borrar(torneoId, id),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({
        queryKey: clavesConsulta.torneo(torneoId),
      }),
  });
}
