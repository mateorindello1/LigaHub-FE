import { clienteApi } from '../api/cliente-api';
import type {
  Cancha,
  DatosCancha,
  DatosPredio,
  Predio,
} from '../modelos/predio';

const rutaCanchas = (predioId: number) => `/predios/${predioId}/canchas`;

/** Servicio de predios (/predios) y de sus canchas (/predios/:predioId/canchas). */
export const prediosServicio = {
  obtenerTodos: (signal?: AbortSignal) =>
    clienteApi.get<Predio[]>('/predios', signal),
  obtenerPorId: (id: number, signal?: AbortSignal) =>
    clienteApi.get<Predio>(`/predios/${id}`, signal),
  crear: (datos: DatosPredio) => clienteApi.post<Predio>('/predios', datos),
  modificar: (id: number, datos: Partial<DatosPredio>) =>
    clienteApi.patch<Predio>(`/predios/${id}`, datos),
  borrar: (id: number) => clienteApi.delete(`/predios/${id}`),

  crearCancha: (predioId: number, datos: DatosCancha) =>
    clienteApi.post<Cancha>(rutaCanchas(predioId), datos),
  modificarCancha: (
    predioId: number,
    id: number,
    datos: Partial<DatosCancha>,
  ) => clienteApi.patch<Cancha>(`${rutaCanchas(predioId)}/${id}`, datos),
  borrarCancha: (predioId: number, id: number) =>
    clienteApi.delete(`${rutaCanchas(predioId)}/${id}`),
};
