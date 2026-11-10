import type { EquipoPlanilla } from '../../modelos/partido';
import { EscudoEquipo } from '../equipos/EscudoEquipo';

interface Props {
  local: Pick<EquipoPlanilla, 'nombre' | 'escudoURL'>;
  visitante: Pick<EquipoPlanilla, 'nombre' | 'escudoURL'>;
  /** Goles, o null para mostrar "vs" (partido sin resultado o suspendido). */
  golesLocal: number | null;
  golesVisitante: number | null;
}

/** Marcador grande: escudo y nombre de cada equipo, y los goles en el medio. */
export function MarcadorPartido({
  local,
  visitante,
  golesLocal,
  golesVisitante,
}: Props) {
  const conResultado = golesLocal !== null && golesVisitante !== null;
  return (
    <div className="marcador-partido" aria-live="polite">
      <div className="marcador-partido__equipo">
        <EscudoEquipo
          nombre={local.nombre}
          escudoURL={local.escudoURL}
          tamanio={48}
        />
        <span>{local.nombre}</span>
      </div>
      <div className="marcador-partido__goles">
        {conResultado ? `${golesLocal} - ${golesVisitante}` : 'vs'}
      </div>
      <div className="marcador-partido__equipo">
        <EscudoEquipo
          nombre={visitante.nombre}
          escudoURL={visitante.escudoURL}
          tamanio={48}
        />
        <span>{visitante.nombre}</span>
      </div>
    </div>
  );
}
