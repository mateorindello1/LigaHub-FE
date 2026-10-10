import { useMemo } from 'react';
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { IDIOMA } from '../../config/textos-syncfusion';
import { MensajeCampo } from './MensajeCampo';

interface Props<T extends FieldValues> {
  control: Control<T>;
  nombre: Path<T>;
  etiqueta: string;
  ayuda?: string;
}

/**
 * Fecha y hora: el DateTimePickerComponent de Syncfusion conectado a React Hook Form.
 * Guarda un Date (en hora local) o null si el campo queda vacío.
 */
export function CampoFechaHora<T extends FieldValues>({
  control,
  nombre,
  etiqueta,
  ayuda,
}: Props<T>) {
  const { field, fieldState } = useController({ control, name: nombre });
  const idMensaje = `${field.name}-mensaje`;
  const conError = fieldState.error !== undefined;

  // Mismo objeto entre dibujos, para que Syncfusion no lo tome como un cambio de configuración.
  const atributos = useMemo(
    () => ({
      'aria-invalid': conError ? 'true' : 'false',
      'aria-describedby': idMensaje,
    }),
    [conError, idMensaje],
  );

  return (
    <div className="campo">
      <DateTimePickerComponent
        id={field.name}
        placeholder={etiqueta}
        floatLabelType="Auto"
        locale={IDIOMA}
        format="dd/MM/yyyy HH:mm"
        timeFormat="HH:mm"
        step={30}
        value={field.value ?? undefined}
        change={(e) => field.onChange(e.value ?? null)}
        blur={field.onBlur}
        cssClass={conError ? 'e-error' : ''}
        htmlAttributes={atributos}
      />
      <MensajeCampo
        id={idMensaje}
        error={fieldState.error?.message}
        ayuda={ayuda}
      />
    </div>
  );
}
