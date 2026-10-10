import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { MensajeCampo } from './MensajeCampo';

interface Props<T extends FieldValues> {
  control: Control<T>;
  nombre: Path<T>;
  etiqueta: string;
  ayuda?: string;
}

/** Casilla de verificación: el CheckBoxComponent de Syncfusion conectado a React Hook Form. */
export function CampoCasilla<T extends FieldValues>({
  control,
  nombre,
  etiqueta,
  ayuda,
}: Props<T>) {
  const { field, fieldState } = useController({ control, name: nombre });

  return (
    <div className="campo">
      <CheckBoxComponent
        id={field.name}
        label={etiqueta}
        checked={Boolean(field.value)}
        change={(e) => field.onChange(e.checked)}
      />
      <MensajeCampo
        id={`${field.name}-mensaje`}
        error={fieldState.error?.message}
        ayuda={ayuda}
      />
    </div>
  );
}
