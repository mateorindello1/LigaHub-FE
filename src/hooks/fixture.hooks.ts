import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type { GenerarFixture } from '../modelos/fixture';
import { fixtureServicio } from '../servicios/fixture.servicio';

/*
 * Hooks del fixture. Generarlo o deshacerlo cambia el estado del torneo (Inscripción ↔ En curso),
 * así que se invalida ['torneos'] completo: la lista de torneos (con su estado) y todo lo que
 * cuelga de cada torneo (fixture, posiciones, inscripciones, detalle).
 */

/** Fechas y partidos del fixture. Lista vacía si el torneo todavía no tiene fixture. */
export function useFixture(torneoId: number | null) {
  return useQuery({
    queryKey: clavesConsulta.fixture(torneoId ?? 0),
    queryFn:
      torneoId === null
        ? skipToken
        : ({ signal }) => fixtureServicio.obtener(torneoId, signal),
  });
}

/** Caso de uso: genera el fixture del torneo y lo pasa a En curso. */
export function useGenerarFixture(torneoId: number) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (opciones: GenerarFixture) =>
      fixtureServicio.generar(torneoId, opciones),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.torneos }),
  });
}

/** Deshace el fixture (si no hay partidos jugados) y vuelve el torneo a Inscripción. */
export function useDeshacerFixture(torneoId: number) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: () => fixtureServicio.deshacer(torneoId),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.torneos }),
  });
}
