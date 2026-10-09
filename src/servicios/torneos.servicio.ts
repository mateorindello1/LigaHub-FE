import { clienteApi } from '../api/cliente-api';
import type { CrearTorneo, ModificarTorneo, Torneo } from '../modelos/torneo';

/** Servicio de torneos: un método por endpoint de /torneos. */
export const torneosServicio = {
  obtenerTodos: (signal?: AbortSignal) =>
    clienteApi.get<Torneo[]>('/torneos', signal),
  obtenerPorId: (id: number, signal?: AbortSignal) =>
    clienteApi.get<Torneo>(`/torneos/${id}`, signal),
  crear: (datos: CrearTorneo) => clienteApi.post<Torneo>('/torneos', datos),
  modificar: (id: number, datos: ModificarTorneo) =>
    clienteApi.patch<Torneo>(`/torneos/${id}`, datos),
  borrar: (id: number) => clienteApi.delete(`/torneos/${id}`),
};
