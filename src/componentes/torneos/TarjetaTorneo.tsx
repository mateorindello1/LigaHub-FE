import { Link } from 'react-router';
import { EstadoTorneo, NOMBRES_ESTADO_TORNEO } from '../../modelos/estados';
import type { Torneo } from '../../modelos/torneo';

/** Clase de color del badge de Syncfusion según el estado del torneo. */
const COLOR_ESTADO: Record<EstadoTorneo, string> = {
  [EstadoTorneo.Inscripcion]: 'e-badge-info',
  [EstadoTorneo.EnCurso]: 'e-badge-success',
  [EstadoTorneo.Finalizado]: 'e-badge-secondary',
};

interface Props {
  torneo: Torneo;
}

/** Tarjeta con los datos de un torneo y accesos a su tabla y su fixture. */
export function TarjetaTorneo({ torneo }: Props) {
  return (
    <article className="e-card tarjeta-torneo">
      <div className="e-card-header">
        <div className="e-card-header-caption">
          <div className="e-card-header-title">{torneo.nombre}</div>
          <div className="e-card-sub-title">{torneo.anio}</div>
        </div>
        <span className={`e-badge ${COLOR_ESTADO[torneo.estadoTorneo]}`}>
          {NOMBRES_ESTADO_TORNEO[torneo.estadoTorneo]}
        </span>
      </div>
      <div className="e-card-actions">
        <Link
          className="e-btn e-flat e-primary"
          to={`/posiciones?torneo=${torneo.id}`}
        >
          Posiciones
        </Link>
        <Link
          className="e-btn e-flat e-primary"
          to={`/fixture?torneo=${torneo.id}`}
        >
          Fixture
        </Link>
      </div>
    </article>
  );
}
