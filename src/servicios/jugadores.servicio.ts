import { clienteApi } from '../api/cliente-api';
import type {
  CrearJugador,
  Jugador,
  JugadorConInscripciones,
  ModificarJugador,
} from '../modelos/jugador';

/** Servicio de jugadores: un método por endpoint de /jugadores. */
export const jugadoresServicio = {
  /** Todos los jugadores, o con disponiblesEnTorneo solo los que se pueden inscribir en ese torneo. */
  obtenerTodos: (signal?: AbortSignal, disponiblesEnTorneo?: number) =>
    clienteApi.get<Jugador[]>(
      disponiblesEnTorneo === undefined
        ? '/jugadores'
        : `/jugadores?disponiblesEnTorneo=${disponiblesEnTorneo}`,
      signal,
    ),
  obtenerPorId: (id: number, signal?: AbortSignal) =>
    clienteApi.get<JugadorConInscripciones>(`/jugadores/${id}`, signal),
  crear: (datos: CrearJugador) => clienteApi.post<Jugador>('/jugadores', datos),
  modificar: (id: number, datos: ModificarJugador) =>
    clienteApi.patch<Jugador>(`/jugadores/${id}`, datos),
  borrar: (id: number) => clienteApi.delete(`/jugadores/${id}`),
};
