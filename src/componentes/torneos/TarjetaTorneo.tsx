import { Link } from 'react-router';
import type { Torneo } from '../../modelos/torneo';
import { BadgeEstadoTorneo } from './BadgeEstadoTorneo';

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
        <BadgeEstadoTorneo estado={torneo.estadoTorneo} />
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
