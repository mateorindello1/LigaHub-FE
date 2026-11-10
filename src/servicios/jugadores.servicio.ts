import { clienteApi } from '../api/cliente-api';
import type { JugadorResumen } from '../modelos/usuario';

/** Servicio de jugadores. Por ahora solo el listado para asociar un jugador a un usuario. */
export const jugadoresServicio = {
  obtenerTodos: (signal?: AbortSignal) =>
    clienteApi.get<JugadorResumen[]>('/jugadores', signal),
};
