import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type { CrearJugador, ModificarJugador } from '../modelos/jugador';
import { jugadoresServicio } from '../servicios/jugadores.servicio';

/*
 * Hooks de datos de jugadores (ver torneos.hooks.ts).
 * Las operaciones invalidan:
 * - ['jugadores']: la grilla, las listas para elegir y el detalle de cada jugador.
 * - ['usuarios']: la gestión de usuarios muestra el nombre del jugador asociado.
 * - ['torneos']: el detalle del equipo y los planteles muestran los nombres.
 */

/** Invalida jugadores, usuarios y torneos después de una operación exitosa. */
function useInvalidarJugadores() {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all(
      [
        clavesConsulta.jugadores,
        clavesConsulta.usuarios,
        clavesConsulta.torneos,
      ].map((clave) => clienteConsultas.invalidateQueries({ queryKey: clave })),
    );
}

/** Lista de jugadores (solo el Administrador). */
export function useJugadores() {
  return useQuery({
    queryKey: clavesConsulta.jugadores,
    queryFn: ({ signal }) => jugadoresServicio.obtenerTodos(signal),
  });
}

/** Jugadores que todavía se pueden inscribir en el torneo (no están en ninguno de sus equipos). */
export function useJugadoresDisponibles(torneoId: number, habilitado = true) {
  return useQuery({
    queryKey: clavesConsulta.jugadoresDisponibles(torneoId),
    // Solo se piden al abrir el formulario de inscripción.
    queryFn: habilitado
      ? ({ signal }) => jugadoresServicio.obtenerTodos(signal, torneoId)
      : skipToken,
  });
}

/** Un jugador con sus inscripciones. Con id null (todavía no se sabe cuál) no pide nada. */
export function useJugador(id: number | null) {
  return useQuery({
    queryKey: clavesConsulta.jugador(id ?? 0),
    queryFn:
      id === null
        ? skipToken
        : ({ signal }) => jugadoresServicio.obtenerPorId(id, signal),
  });
}

/** Alta de un jugador. */
export function useCrearJugador() {
  const invalidar = useInvalidarJugadores();
  return useMutation({
    mutationFn: (datos: CrearJugador) => jugadoresServicio.crear(datos),
    onSuccess: invalidar,
  });
}

/** Modificación de un jugador (todos los datos, o solo los de contacto si es el propio jugador). */
export function useModificarJugador() {
  const invalidar = useInvalidarJugadores();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ModificarJugador }) =>
      jugadoresServicio.modificar(id, datos),
    onSuccess: invalidar,
  });
}

/** Baja de un jugador. */
export function useBorrarJugador() {
  const invalidar = useInvalidarJugadores();
  return useMutation({
    mutationFn: (id: number) => jugadoresServicio.borrar(id),
    onSuccess: invalidar,
  });
}
