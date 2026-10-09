import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { mensajeDeError } from '../../api/error-api';

interface Props {
  /** Error a mostrar (por ejemplo, el que devuelve useQuery). */
  error: unknown;
  /** Si se pasa, se muestra un botón para volver a intentar. */
  onReintentar?: () => void;
}

/** Mensaje de error amigable, con la opción de reintentar. */
export function MensajeError({ error, onReintentar }: Props) {
  return (
    <div className="mensaje-error" role="alert">
      <span className="e-icons e-warning" aria-hidden="true" />
      <p>{mensajeDeError(error)}</p>
      {onReintentar && (
        <ButtonComponent cssClass="e-outline" onClick={onReintentar}>
          Reintentar
        </ButtonComponent>
      )}
    </div>
  );
}
