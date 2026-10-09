import { clienteApi } from '../api/cliente-api';
import type { CrearEquipo, Equipo, ModificarEquipo } from '../modelos/equipo';

/** Servicio de equipos: un método por endpoint de /equipos. */
export const equiposServicio = {
  obtenerTodos: (signal?: AbortSignal) =>
    clienteApi.get<Equipo[]>('/equipos', signal),
  obtenerPorId: (id: number, signal?: AbortSignal) =>
    clienteApi.get<Equipo>(`/equipos/${id}`, signal),
  crear: (datos: CrearEquipo) => clienteApi.post<Equipo>('/equipos', datos),
  modificar: (id: number, datos: ModificarEquipo) =>
    clienteApi.patch<Equipo>(`/equipos/${id}`, datos),
  borrar: (id: number) => clienteApi.delete(`/equipos/${id}`),
};
