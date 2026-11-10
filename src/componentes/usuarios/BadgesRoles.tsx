import { NOMBRES_ROL, Rol } from '../../modelos/sesion';

/** Clase de color del badge de Syncfusion según el rol. */
const COLOR_ROL: Record<Rol, string> = {
  [Rol.Administrador]: 'e-badge-primary',
  [Rol.Asistente]: 'e-badge-info',
  [Rol.Jugador]: 'e-badge-success',
};

interface Props {
  roles: Rol[];
}

/** Roles de un usuario como badges de color. */
export function BadgesRoles({ roles }: Props) {
  return (
    <div className="badges-roles">
      {roles.map((rol) => (
        <span key={rol} className={`e-badge ${COLOR_ROL[rol]}`}>
          {NOMBRES_ROL[rol]}
        </span>
      ))}
    </div>
  );
}
