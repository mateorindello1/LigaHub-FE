import { useMemo } from 'react';
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { MensajeCampo } from './MensajeCampo';

interface Props<T extends FieldValues> {
  /** Control del formulario (lo devuelve useForm). */
  control: Control<T>;
  /** Nombre del campo en el formulario. */
  nombre: Path<T>;
  etiqueta: string;
  /** Texto de ayuda debajo del campo, cuando no hay error. */
  ayuda?: string;
  tipo?: 'text' | 'url' | 'email' | 'password';
  /**
   * Valor del atributo autocomplete: le dice al navegador y a los gestores de contraseñas qué
   * dato es (por ejemplo, "username" o "current-password" en el login).
   */
  autocompletar?: string;
}

/**
 * Campo de texto: el TextBoxComponent de Syncfusion conectado a React Hook Form.
 * Muestra el error del campo (de Zod o del backend) debajo del control.
 *
 * Es genérico (<T>) para que "nombre" solo acepte campos que existen en el formulario,
 * como una expresión x => x.Nombre en .NET.
 */
export function CampoTexto<T extends FieldValues>({
  control,
  nombre,
  etiqueta,
  ayuda,
  tipo = 'text',
  autocompletar,
}: Props<T>) {
  // useController conecta un componente externo (el de Syncfusion) con el formulario:
  // field tiene el valor y los avisos de cambio; fieldState, el error.
  const { field, fieldState } = useController({ control, name: nombre });
  const idMensaje = `${field.name}-mensaje`;
  const conError = fieldState.error !== undefined;

  // Mismo objeto entre dibujos, para que Syncfusion no lo tome como un cambio de configuración.
  const atributos = useMemo(
    () => ({
      'aria-invalid': conError ? 'true' : 'false',
      'aria-describedby': idMensaje,
      ...(autocompletar && { autocomplete: autocompletar }),
    }),
    [conError, idMensaje, autocompletar],
  );

  return (
    <div className="campo">
      <TextBoxComponent
        id={field.name}
        type={tipo}
        placeholder={etiqueta}
        floatLabelType="Auto"
        value={field.value ?? ''}
        // "input" se dispara con cada tecla; "change" recién al salir del campo.
        input={(e) => field.onChange(e.value)}
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
