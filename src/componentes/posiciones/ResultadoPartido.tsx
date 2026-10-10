import { EstadoPartido, NOMBRES_ESTADO_PARTIDO } from '../../modelos/estados';
import type {
  PartidoDetalle,
  ResultadoPartido as Resultado,
} from '../../modelos/posiciones';

/** Letra y color del badge según el resultado del partido para el equipo. */
const BADGE_RESULTADO: Record<Resultado, { letra: string; clase: string }> = {
  Ganado: { letra: 'G', clase: 'e-badge-success' },
  Empatado: { letra: 'E', clase: 'e-badge-warning' },
  Perdido: { letra: 'P', clase: 'e-badge-danger' },
};

interface Props {
  partido: PartidoDetalle;
}

/**
 * Resultado de un partido visto desde el equipo: "G 2 - 1".
 * Si todavía no tiene resultado, muestra el estado (Programado, Suspendido).
 */
export function ResultadoPartido({ partido }: Props) {
  if (partido.resultado === null) {
    return (
      <span className="texto-secundario">
        {NOMBRES_ESTADO_PARTIDO[partido.estadoPartido]}
      </span>
    );
  }

  const badge = BADGE_RESULTADO[partido.resultado];
  return (
    <span className="resultado-partido">
      <span
        className={`e-badge ${badge.clase}`}
        title={partido.resultado}
        aria-label={partido.resultado}
      >
        {badge.letra}
      </span>
      <span>
        {partido.golesAFavor} - {partido.golesEnContra}
      </span>
      {partido.estadoPartido === EstadoPartido.WO && (
        <span className="texto-secundario">(W.O.)</span>
      )}
    </span>
  );
}
