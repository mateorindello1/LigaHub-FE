/** Cuántas fechas y partidos tendrá un fixture "todos contra todos". */
export interface ResumenFixture {
  fechas: number;
  partidosPorFecha: number;
  partidosTotales: number;
  /** Con cantidad impar de equipos, en cada fecha uno queda libre. */
  hayEquipoLibre: boolean;
}

/**
 * Calcula el tamaño del fixture antes de generarlo, con la misma regla que el backend
 * (método del círculo): con n equipos pares hay n - 1 fechas de n / 2 partidos; con n impares se
 * agrega un "libre" y hay n fechas de (n - 1) / 2 partidos. Ida y vuelta duplica las fechas.
 */
export function calcularResumenFixture(
  cantidadEquipos: number,
  idaYVuelta: boolean,
): ResumenFixture {
  const hayEquipoLibre = cantidadEquipos % 2 === 1;
  const equiposConLibre = hayEquipoLibre
    ? cantidadEquipos + 1
    : cantidadEquipos;
  const ruedas = idaYVuelta ? 2 : 1;

  const fechas = (equiposConLibre - 1) * ruedas;
  const partidosPorFecha = Math.floor(cantidadEquipos / 2);

  return {
    fechas,
    partidosPorFecha,
    partidosTotales: fechas * partidosPorFecha,
    hayEquipoLibre,
  };
}
