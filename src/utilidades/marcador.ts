import { TipoEvento, type EventoACargar } from '../modelos/partido';

export interface Marcador {
  golesLocal: number;
  golesVisitante: number;
}

/**
 * Marcador calculado a partir de los eventos, igual que en el backend (calcular-marcador.ts):
 * un gol suma al equipo del jugador y un gol en contra, al rival. Sirve para mostrar el resultado
 * mientras se carga la planilla; el que vale es el que calcula el backend al guardar.
 *
 * @param esLocal indica si una inscripción es del equipo local.
 */
export function calcularMarcador(
  eventos: Pick<EventoACargar, 'tipoEvento' | 'inscripcionJugadorId'>[],
  esLocal: (inscripcionJugadorId: string) => boolean,
): Marcador {
  const marcador: Marcador = { golesLocal: 0, golesVisitante: 0 };
  for (const evento of eventos) {
    const local = esLocal(evento.inscripcionJugadorId);
    if (evento.tipoEvento === TipoEvento.Gol) {
      if (local) marcador.golesLocal++;
      else marcador.golesVisitante++;
    } else if (evento.tipoEvento === TipoEvento.GolEnContra) {
      if (local) marcador.golesVisitante++;
      else marcador.golesLocal++;
    }
  }
  return marcador;
}
