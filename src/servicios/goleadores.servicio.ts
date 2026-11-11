import { clienteApi } from '../api/cliente-api';
import type { FilaGoleadores } from '../modelos/goleadores';

/** Servicio de la tabla de goleadores por torneo. */
export const goleadoresServicio = {
  obtener: (torneoId: number, signal?: AbortSignal) =>
    clienteApi.get<FilaGoleadores[]>(`/torneos/${torneoId}/goleadores`, signal),
};
