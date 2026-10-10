import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type { CrearEquipo, ModificarEquipo } from '../modelos/equipo';
import { equiposServicio } from '../servicios/equipos.servicio';

/*
 * Hooks de datos de equipos (ver torneos.hooks.ts).
 * Además de ['equipos'] se invalida ['torneos']: el nombre y el escudo del equipo también
 * aparecen en las posiciones, el detalle y el fixture, que cuelgan de esa clave.
 */

function invalidarEquipos(clienteConsultas: QueryClient) {
  return Promise.all([
    clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.equipos }),
    clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.torneos }),
  ]);
}

/** Lista de equipos. */
export function useEquipos() {
  return useQuery({
    queryKey: clavesConsulta.equipos,
    queryFn: ({ signal }) => equiposServicio.obtenerTodos(signal),
  });
}

/** Alta de un equipo. */
export function useCrearEquipo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (datos: CrearEquipo) => equiposServicio.crear(datos),
    onSuccess: () => invalidarEquipos(clienteConsultas),
  });
}

/** Modificación de un equipo. */
export function useModificarEquipo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ModificarEquipo }) =>
      equiposServicio.modificar(id, datos),
    onSuccess: () => invalidarEquipos(clienteConsultas),
  });
}

/** Baja de un equipo. */
export function useBorrarEquipo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equiposServicio.borrar(id),
    onSuccess: () => invalidarEquipos(clienteConsultas),
  });
}
