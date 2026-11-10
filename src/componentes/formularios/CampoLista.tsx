import { useMemo } from 'react';
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { IDIOMA } from '../../config/textos-syncfusion';
import { MensajeCampo } from './MensajeCampo';

interface Props<T extends FieldValues, O extends object> {
  control: Control<T>;
  nombre: Path<T>;
  etiqueta: string;
  /** Opciones de la lista (por ejemplo, los equipos). */
  opciones: O[];
  /** Propiedad de cada opción que se muestra (por ejemplo, "nombre"). */
  campoTexto: keyof O & string;
  /** Propiedad de cada opción que se guarda en el formulario (por ejemplo, "id"). */
  campoValor: keyof O & string;
  ayuda?: string;
  /**
   * Agrega un cuadro de búsqueda en la lista desplegada, para listas largas (por ejemplo, los
   * jugadores). Busca el texto en cualquier parte de la opción, sin distinguir mayúsculas ni tildes.
   */
  filtrable?: boolean;
  /** Propiedad por la que se agrupan las opciones, con un título por grupo (por ejemplo, el predio). */
  campoGrupo?: keyof O & string;
  /** Muestra una cruz para dejar la lista sin elegir (el valor queda null). */
  permitirVacio?: boolean;
}

/**
 * Lista desplegable: el DropDownListComponent de Syncfusion conectado a React Hook Form.
 * Guarda en el formulario el valor de la opción elegida (campoValor) y muestra su texto (campoTexto),
 * como un SfDropDownList con TValue y TItem en Blazor.
 */
export function CampoLista<T extends FieldValues, O extends object>({
  control,
  nombre,
  etiqueta,
  opciones,
  campoTexto,
  campoValor,
  ayuda,
  filtrable = false,
  campoGrupo,
  permitirVacio = false,
}: Props<T, O>) {
  const { field, fieldState } = useController({ control, name: nombre });
  const idMensaje = `${field.name}-mensaje`;
  const conError = fieldState.error !== undefined;

  // Syncfusion toma cada objeto nuevo en sus props como un cambio de configuración y vuelve a
  // cargar la lista. Si se crearan en cada dibujo, la lista se recargaría mientras el usuario
  // elige y la selección se perdería. useMemo devuelve el mismo objeto mientras no cambien los datos.
  const campos = useMemo(
    () => ({ text: campoTexto, value: campoValor, groupBy: campoGrupo }),
    [campoTexto, campoValor, campoGrupo],
  );
  const atributos = useMemo(
    () => ({
      'aria-invalid': conError ? 'true' : 'false',
      'aria-describedby': idMensaje,
    }),
    [conError, idMensaje],
  );

  return (
    <div className="campo">
      <DropDownListComponent
        id={field.name}
        // Syncfusion tipa las opciones como objetos genéricos; el tipo real lo controla O.
        dataSource={opciones as unknown as { [clave: string]: object }[]}
        fields={campos}
        placeholder={etiqueta}
        floatLabelType="Auto"
        locale={IDIOMA}
        value={field.value ?? null}
        // Sin elección se guarda null y no undefined: React Hook Form toma undefined como "sin
        // cambios" y volvería al valor inicial (por ejemplo, la cancha que ya tenía el partido).
        change={(e) => field.onChange(e.value ?? null)}
        blur={field.onBlur}
        cssClass={conError ? 'e-error' : ''}
        htmlAttributes={atributos}
        allowFiltering={filtrable}
        filterType="Contains"
        ignoreAccent
        filterBarPlaceholder="Buscar…"
        showClearButton={permitirVacio}
      />
      <MensajeCampo
        id={idMensaje}
        error={fieldState.error?.message}
        ayuda={ayuda}
      />
    </div>
  );
}
