import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { MensajeCampo } from './MensajeCampo';

interface Props<T extends FieldValues> {
  control: Control<T>;
  nombre: Path<T>;
  etiqueta: string;
  ayuda?: string;
  /**
   * Formato de Syncfusion. Por defecto "#": un entero sin separador de miles
   * (para que un año se vea 2026 y no 2.026).
   */
  formato?: string;
}

/**
 * Campo numérico entero: el NumericTextBoxComponent de Syncfusion conectado a React Hook Form.
 * Los límites (mínimo y máximo) los valida Zod y no el control, así el usuario ve el mensaje
 * en lugar de que el valor se corrija solo.
 */
export function CampoNumero<T extends FieldValues>({
  control,
  nombre,
  etiqueta,
  ayuda,
  formato = '#',
}: Props<T>) {
  const { field, fieldState } = useController({ control, name: nombre });
  const idMensaje = `${field.name}-mensaje`;

  return (
    <div className="campo">
      <NumericTextBoxComponent
        id={field.name}
        placeholder={etiqueta}
        floatLabelType="Auto"
        format={formato}
        decimals={0}
        validateDecimalOnType
        showSpinButton={false}
        value={field.value ?? undefined}
        // El NumericTextBox avisa el cambio al salir del campo o al presionar Enter.
        // Si queda vacío, el valor es null y Zod responde "obligatorio".
        change={(e) => field.onChange(e.value ?? null)}
        blur={field.onBlur}
        cssClass={fieldState.error ? 'e-error' : ''}
        htmlAttributes={{
          'aria-invalid': fieldState.error ? 'true' : 'false',
          'aria-describedby': idMensaje,
        }}
      />
      <MensajeCampo
        id={idMensaje}
        error={fieldState.error?.message}
        ayuda={ayuda}
      />
    </div>
  );
}
