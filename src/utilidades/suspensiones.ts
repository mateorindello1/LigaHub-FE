import {
  AMONESTACIONES_PARA_SUSPENSION,
  type Sancion,
} from '../modelos/suspensiones';

/** Textos de una sanción para mostrar en la grilla. */
export interface TextosSancion {
  textoMotivo: string;
  /** En qué fechas no juega, o por qué todavía no se sabe. */
  noJuega: string;
  estado: 'Cumplida' | 'Pendiente';
}

/**
 * Arma los textos de una sanción. Ejemplos de "noJuega": "Fecha 4", "Fechas 4 y 5",
 * "Sin partidos restantes" (al equipo no le quedan partidos en el torneo).
 */
export function describirSancion(sancion: Sancion): TextosSancion {
  const textoMotivo =
    sancion.motivo === 'Expulsion'
      ? 'Expulsión'
      : `${AMONESTACIONES_PARA_SUSPENSION} amarillas`;

  const fechas = sancion.partidos.map((p) => p.numeroFecha);
  const faltan = sancion.fechas - fechas.length;
  let noJuega =
    fechas.length === 0
      ? ''
      : fechas.length === 1
        ? `Fecha ${fechas[0]}`
        : `Fechas ${fechas.slice(0, -1).join(', ')} y ${fechas.at(-1)}`;
  if (faltan > 0) {
    const sinPartidos =
      faltan === 1
        ? '1 fecha sin partido asignado'
        : `${faltan} fechas sin partido asignado`;
    noJuega = noJuega
      ? `${noJuega} (y ${sinPartidos})`
      : 'Sin partidos restantes';
  }

  return {
    textoMotivo,
    noJuega,
    estado: sancion.cumplida ? 'Cumplida' : 'Pendiente',
  };
}
