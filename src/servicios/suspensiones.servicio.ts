import { clienteApi } from '../api/cliente-api';
import type { Suspensiones } from '../modelos/suspensiones';

/** Servicio de las suspensiones por torneo. */
export const suspensionesServicio = {
  obtener: (torneoId: number, signal?: AbortSignal) =>
    clienteApi.get<Suspensiones>(`/torneos/${torneoId}/suspensiones`, signal),
};
