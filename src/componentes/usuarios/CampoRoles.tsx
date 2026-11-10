import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { NOMBRES_ROL, Rol } from '../../modelos/sesion';
import { MensajeCampo } from '../formularios/MensajeCampo';

/** Roles en el orden en que se muestran. */
const ROLES: Rol[] = [Rol.Administrador, Rol.Asistente, Rol.Jugador];

interface Props<T extends FieldValues> {
  control: Control<T>;
  nombre: Path<T>;
  ayuda?: string;
}

/**
 * Elección de roles: una casilla por rol, conectadas a un único campo del formulario que guarda
 * la lista de roles marcados (como un SfCheckBox por ítem enlazado a una List<Rol> en Blazor).
 */
export function CampoRoles<T extends FieldValues>({
  control,
  nombre,
  ayuda,
}: Props<T>) {
  const { field, fieldState } = useController({ control, name: nombre });
  const roles: Rol[] = field.value ?? [];

  /** Agrega o quita el rol de la lista, manteniendo el orden de ROLES. */
  function cambiar(rol: Rol, marcado: boolean) {
    const nuevos = marcado ? [...roles, rol] : roles.filter((r) => r !== rol);
    field.onChange(ROLES.filter((r) => nuevos.includes(r)));
  }

  return (
    <fieldset
      className="campo campo-roles"
      aria-describedby={`${field.name}-mensaje`}
    >
      <legend>Roles</legend>
      <div className="campo-roles__opciones">
        {ROLES.map((rol) => (
          <CheckBoxComponent
            key={rol}
            id={`${field.name}-${rol}`}
            label={NOMBRES_ROL[rol]}
            checked={roles.includes(rol)}
            change={(e) => cambiar(rol, Boolean(e.checked))}
          />
        ))}
      </div>
      <MensajeCampo
        id={`${field.name}-mensaje`}
        error={fieldState.error?.message}
        ayuda={ayuda}
      />
    </fieldset>
  );
}
