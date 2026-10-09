import { clienteApi } from '../api/cliente-api';
import type {
  DatosInscripcionEquipo,
  InscripcionEquipo,
} from '../modelos/inscripcion-equipo';

const ruta = (torneoId: number) => `/torneos/${torneoId}/inscripciones`;

/** Servicio de inscripciones de equipos a un torneo (/torneos/:torneoId/inscripciones). */
export const inscripcionesEquipoServicio = {
  obtenerPorTorneo: (torneoId: number, signal?: AbortSignal) =>
    clienteApi.get<InscripcionEquipo[]>(ruta(torneoId), signal),
  crear: (torneoId: number, datos: DatosInscripcionEquipo) =>
    clienteApi.post<InscripcionEquipo>(ruta(torneoId), datos),
  modificar: (torneoId: number, id: string, datos: DatosInscripcionEquipo) =>
    clienteApi.patch<InscripcionEquipo>(`${ruta(torneoId)}/${id}`, datos),
  borrar: (torneoId: number, id: string) =>
    clienteApi.delete(`${ruta(torneoId)}/${id}`),
};
