import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type { DatosCancha, DatosPredio } from '../modelos/predio';
import { prediosServicio } from '../servicios/predios.servicio';

/*
 * Hooks de predios y canchas (ver torneos.hooks.ts).
 * Las operaciones invalidan ['predios'] (la grilla, el predio con sus canchas y la lista de
 * canchas al programar un partido) y ['torneos'], porque el fixture y el detalle del equipo
 * muestran el nombre del predio y el número de cancha.
 */

function useInvalidarPredios() {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.predios }),
      clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.torneos }),
    ]);
}

/**
 * Predios con sus canchas.
 * @param habilitado false para no pedirlos todavía (el fixture los pide al abrir "Programar").
 */
export function usePredios(habilitado = true) {
  return useQuery({
    queryKey: clavesConsulta.predios,
    queryFn: habilitado
      ? ({ signal }) => prediosServicio.obtenerTodos(signal)
      : skipToken,
  });
}

/** Un predio con sus canchas. */
export function usePredio(id: number) {
  return useQuery({
    queryKey: clavesConsulta.predio(id),
    queryFn: ({ signal }) => prediosServicio.obtenerPorId(id, signal),
  });
}

/** Alta de un predio. */
export function useCrearPredio() {
  const invalidar = useInvalidarPredios();
  return useMutation({
    mutationFn: (datos: DatosPredio) => prediosServicio.crear(datos),
    onSuccess: invalidar,
  });
}

/** Modificación de un predio. */
export function useModificarPredio() {
  const invalidar = useInvalidarPredios();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: DatosPredio }) =>
      prediosServicio.modificar(id, datos),
    onSuccess: invalidar,
  });
}

/** Baja de un predio. */
export function useBorrarPredio() {
  const invalidar = useInvalidarPredios();
  return useMutation({
    mutationFn: (id: number) => prediosServicio.borrar(id),
    onSuccess: invalidar,
  });
}

/** Alta de una cancha en el predio. */
export function useCrearCancha(predioId: number) {
  const invalidar = useInvalidarPredios();
  return useMutation({
    mutationFn: (datos: DatosCancha) =>
      prediosServicio.crearCancha(predioId, datos),
    onSuccess: invalidar,
  });
}

/** Modificación de una cancha del predio. */
export function useModificarCancha(predioId: number) {
  const invalidar = useInvalidarPredios();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: DatosCancha }) =>
      prediosServicio.modificarCancha(predioId, id, datos),
    onSuccess: invalidar,
  });
}

/** Baja de una cancha del predio. */
export function useBorrarCancha(predioId: number) {
  const invalidar = useInvalidarPredios();
  return useMutation({
    mutationFn: (id: number) => prediosServicio.borrarCancha(predioId, id),
    onSuccess: invalidar,
  });
}
