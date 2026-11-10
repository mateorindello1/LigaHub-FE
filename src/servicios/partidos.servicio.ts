import { clienteApi } from '../api/cliente-api';
import type { PartidoProgramado, ProgramarPartido } from '../modelos/fixture';

/** Servicio de partidos (/partidos). Por ahora, la programación. */
export const partidosServicio = {
  programar: (id: string, datos: ProgramarPartido) =>
    clienteApi.patch<PartidoProgramado>(`/partidos/${id}/programacion`, datos),
};
