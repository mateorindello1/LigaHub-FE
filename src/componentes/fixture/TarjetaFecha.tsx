import { EstadoPartido, NOMBRES_ESTADO_PARTIDO } from '../../modelos/estados';
import type { FechaFixture, PartidoFixture } from '../../modelos/fixture';
import { formatearFechaHora } from '../../utilidades/formato';

/** Color del badge para los estados que se destacan. */
const COLOR_ESTADO: Partial<Record<EstadoPartido, string>> = {
  [EstadoPartido.WO]: 'e-badge-warning',
  [EstadoPartido.Suspendido]: 'e-badge-danger',
};

interface Props {
  fecha: FechaFixture;
}

/** Una fecha del fixture como tarjeta: sus partidos y el equipo libre, si lo hay. */
export function TarjetaFecha({ fecha }: Props) {
  return (
    <article className="e-card tarjeta-fecha">
      <div className="e-card-header">
        <div className="e-card-header-caption">
          <h2 className="e-card-header-title">Fecha {fecha.numeroFecha}</h2>
        </div>
      </div>
      <ul className="tarjeta-fecha__partidos">
        {fecha.partidos.map((partido) => (
          <FilaPartido key={partido.id} partido={partido} />
        ))}
      </ul>
      {fecha.equipoLibre && (
        <p className="tarjeta-fecha__libre">
          Libre: {fecha.equipoLibre.nombre}
        </p>
      )}
    </article>
  );
}

/** Un partido: local, marcador (o "vs") y visitante; debajo, día, hora, cancha y estado. */
function FilaPartido({ partido }: { partido: PartidoFixture }) {
  const jugado = partido.golesLocal !== null && partido.golesVisitante !== null;
  const colorEstado = COLOR_ESTADO[partido.estadoPartido];

  return (
    <li className="partido">
      <div className="partido__equipos">
        <span className="partido__local">{partido.local.nombre}</span>
        <span className={jugado ? 'partido__marcador' : 'partido__vs'}>
          {jugado ? `${partido.golesLocal} - ${partido.golesVisitante}` : 'vs'}
        </span>
        <span className="partido__visitante">{partido.visitante.nombre}</span>
      </div>
      <div className="partido__info">
        <span>{formatearFechaHora(partido.fechaHora)}</span>
        {partido.cancha && (
          <span>
            {partido.cancha.predio}, cancha {partido.cancha.numero}
          </span>
        )}
        {colorEstado && (
          <span className={`e-badge ${colorEstado}`}>
            {NOMBRES_ESTADO_PARTIDO[partido.estadoPartido]}
          </span>
        )}
      </div>
    </li>
  );
}
