import { clienteApi } from '../api/cliente-api';
import type { FechaFixture, GenerarFixture } from '../modelos/fixture';

const ruta = (torneoId: number) => `/torneos/${torneoId}/fixture`;

/** Servicio del fixture de un torneo (/torneos/:torneoId/fixture). */
export const fixtureServicio = {
  obtener: (torneoId: number, signal?: AbortSignal) =>
    clienteApi.get<FechaFixture[]>(ruta(torneoId), signal),
  generar: (torneoId: number, opciones: GenerarFixture = {}) =>
    clienteApi.post<FechaFixture[]>(ruta(torneoId), opciones),
  deshacer: (torneoId: number) => clienteApi.delete(ruta(torneoId)),
};
