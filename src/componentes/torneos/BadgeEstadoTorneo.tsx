import { EstadoTorneo, NOMBRES_ESTADO_TORNEO } from '../../modelos/estados';

/** Clase de color del badge de Syncfusion según el estado del torneo. */
const COLOR_ESTADO: Record<EstadoTorneo, string> = {
  [EstadoTorneo.Inscripcion]: 'e-badge-info',
  [EstadoTorneo.EnCurso]: 'e-badge-success',
  [EstadoTorneo.Finalizado]: 'e-badge-secondary',
};

interface Props {
  estado: EstadoTorneo;
}

/** Estado del torneo como badge de color. */
export function BadgeEstadoTorneo({ estado }: Props) {
  return (
    <span className={`e-badge ${COLOR_ESTADO[estado]}`}>
      {NOMBRES_ESTADO_TORNEO[estado]}
    </span>
  );
}
