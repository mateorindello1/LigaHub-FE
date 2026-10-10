import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Dialogo } from './Dialogo';

interface Props {
  titulo: string;
  mensaje: string;
  /** Texto del botón que confirma (por defecto, "Borrar"). */
  textoConfirmar?: string;
  /** Mientras es true, los botones quedan deshabilitados. */
  procesando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Pide confirmación antes de una acción que no se puede deshacer, como un borrado. */
export function DialogoConfirmacion({
  titulo,
  mensaje,
  textoConfirmar = 'Borrar',
  procesando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Dialogo
      titulo={titulo}
      onCerrar={onCancelar}
      bloqueado={procesando}
      ancho="400px"
    >
      <p className="dialogo__mensaje">{mensaje}</p>
      <div className="dialogo__pie">
        <ButtonComponent
          cssClass="e-flat"
          disabled={procesando}
          onClick={onCancelar}
        >
          Cancelar
        </ButtonComponent>
        <ButtonComponent
          cssClass="e-danger"
          disabled={procesando}
          onClick={onConfirmar}
        >
          {procesando ? 'Procesando…' : textoConfirmar}
        </ButtonComponent>
      </div>
    </Dialogo>
  );
}
