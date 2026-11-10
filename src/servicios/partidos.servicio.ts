import { clienteApi } from '../api/cliente-api';
import type { PartidoProgramado, ProgramarPartido } from '../modelos/fixture';
import type { CargarResultado, PlanillaPartido } from '../modelos/partido';

/** Servicio de partidos (/partidos): planilla, programación y resultado. */
export const partidosServicio = {
  obtenerPlanilla: (id: string, signal?: AbortSignal) =>
    clienteApi.get<PlanillaPartido>(`/partidos/${id}`, signal),
  programar: (id: string, datos: ProgramarPartido) =>
    clienteApi.patch<PartidoProgramado>(`/partidos/${id}/programacion`, datos),
  cargarResultado: (id: string, datos: CargarResultado) =>
    clienteApi.put<PlanillaPartido>(`/partidos/${id}/resultado`, datos),
  anularResultado: (id: string) =>
    clienteApi.delete(`/partidos/${id}/resultado`),
};
