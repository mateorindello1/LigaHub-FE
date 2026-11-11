import { skipToken, useQuery } from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import { goleadoresServicio } from '../servicios/goleadores.servicio';
import { suspensionesServicio } from '../servicios/suspensiones.servicio';

/*
 * Hooks de los goleadores y las suspensiones. Solo consultan: el backend los calcula a partir de
 * los partidos. Sus claves cuelgan de ['torneos', torneoId], así que al cargar un resultado se
 * actualizan solos (ver resultados.hooks.ts).
 */

/** Goleadores del torneo. Con torneoId null no pide nada. */
export function useGoleadores(torneoId: number | null) {
  return useQuery({
    queryKey: clavesConsulta.goleadores(torneoId ?? 0),
    queryFn:
      torneoId === null
        ? skipToken
        : ({ signal }) => goleadoresServicio.obtener(torneoId, signal),
  });
}

/** Sanciones y tarjetas del torneo. Con torneoId null no pide nada. */
export function useSuspensiones(torneoId: number | null) {
  return useQuery({
    queryKey: clavesConsulta.suspensiones(torneoId ?? 0),
    queryFn:
      torneoId === null
        ? skipToken
        : ({ signal }) => suspensionesServicio.obtener(torneoId, signal),
  });
}
