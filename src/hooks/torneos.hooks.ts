import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type { CrearTorneo, ModificarTorneo } from '../modelos/torneo';
import { torneosServicio } from '../servicios/torneos.servicio';

/*
 * Hooks de datos de torneos: lo que en MVVM hace el ViewModel con sus comandos.
 * - useTorneos: la colección (como el ViewModel de listado).
 * - useCrearTorneo, useModificarTorneo, useBorrarTorneo: las operaciones (como los
 *   CreateCommand, UpdateCommand y DeleteCommand del ViewModel de CRUD).
 *
 * Después de cada operación exitosa se invalida la clave ['torneos']: TanStack Query vuelve a
 * pedir los datos y todas las pantallas que los muestran se actualizan (la grilla, el inicio,
 * las posiciones). Es la "recarga de la grilla tras éxito", pero automática.
 */

/** Lista de torneos. */
export function useTorneos() {
  return useQuery({
    queryKey: clavesConsulta.torneos,
    queryFn: ({ signal }) => torneosServicio.obtenerTodos(signal),
  });
}

/** Alta de un torneo. */
export function useCrearTorneo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: CrearTorneo) => torneosServicio.crear(datos),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.torneos }),
  });
}

/** Modificación de un torneo. */
export function useModificarTorneo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ModificarTorneo }) =>
      torneosServicio.modificar(id, datos),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.torneos }),
  });
}

/** Baja de un torneo. */
export function useBorrarTorneo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => torneosServicio.borrar(id),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.torneos }),
  });
}
