/** Una fila de la tabla de goleadores (GET /torneos/:id/goleadores). */
export interface FilaGoleadores {
  /** Los empatados en goles comparten la posición. */
  posicion: number;
  jugador: { id: number; nombres: string; apellidos: string };
  equipo: { id: number; nombre: string; escudoURL: string | null };
  goles: number;
  partidosJugados: number;
}
