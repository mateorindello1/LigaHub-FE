import { Link } from 'react-router';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
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
  /**
   * Abre la programación de un partido (cancha y día y hora). Si no se pasa, no se muestra el
   * botón: solo el Administrador programa partidos.
   */
  onProgramar?: (partido: PartidoFixture) => void;
  /** Muestra el enlace a la planilla para cargar o corregir el resultado (Asistente y Administrador). */
  conResultado?: boolean;
}

/** Estados en los que un partido todavía se puede programar (no se jugó). */
const PROGRAMABLES: EstadoPartido[] = [
  EstadoPartido.Programado,
  EstadoPartido.Suspendido,
];

/** Una fecha del fixture como tarjeta: sus partidos y el equipo libre, si lo hay. */
export function TarjetaFecha({
  fecha,
  onProgramar,
  conResultado = false,
}: Props) {
  return (
    <article className="e-card tarjeta-fecha">
      <div className="e-card-header">
        <div className="e-card-header-caption">
          <h2 className="e-card-header-title">Fecha {fecha.numeroFecha}</h2>
        </div>
      </div>
      <ul className="tarjeta-fecha__partidos">
        {fecha.partidos.map((partido) => (
          <FilaPartido
            key={partido.id}
            partido={partido}
            onProgramar={
              onProgramar && PROGRAMABLES.includes(partido.estadoPartido)
                ? () => onProgramar(partido)
                : undefined
            }
            conResultado={conResultado}
          />
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
function FilaPartido({
  partido,
  onProgramar,
  conResultado,
}: {
  partido: PartidoFixture;
  onProgramar?: () => void;
  conResultado: boolean;
}) {
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
        {onProgramar && (
          <ButtonComponent
            cssClass="e-flat e-small partido__programar"
            iconCss="e-icons e-clock"
            title={`Programar ${partido.local.nombre} vs ${partido.visitante.nombre}`}
            aria-label={`Programar ${partido.local.nombre} vs ${partido.visitante.nombre}`}
            onClick={onProgramar}
          >
            Programar
          </ButtonComponent>
        )}
        {conResultado && (
          <Link
            className="e-btn e-flat e-small partido__resultado"
            to={`/fixture/partidos/${partido.id}`}
            aria-label={`Resultado de ${partido.local.nombre} vs ${partido.visitante.nombre}`}
          >
            <span className="e-icons e-edit" aria-hidden="true" />
            {jugado ? 'Corregir resultado' : 'Cargar resultado'}
          </Link>
        )}
      </div>
    </li>
  );
}
