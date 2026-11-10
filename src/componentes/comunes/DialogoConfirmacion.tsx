import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Dialogo } from './Dialogo';

interface Props {
  titulo: string;
  mensaje: string;
  /** Texto del botón que confirma (por defecto, "Borrar"). */
  textoConfirmar?: string;
  /** Mientras es true, los botones quedan deshabilitados. */
  procesando?: boolean;
  /**
   * true (por defecto): el botón de confirmar es rojo, para acciones destructivas.
   * false: es el botón principal (por ejemplo, "Guardar").
   */
  peligroso?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Pide confirmación antes de una acción importante, como un borrado o guardar un resultado. */
export function DialogoConfirmacion({
  titulo,
  mensaje,
  textoConfirmar = 'Borrar',
  procesando = false,
  peligroso = true,
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
          cssClass={peligroso ? 'e-danger' : ''}
          isPrimary={!peligroso}
          disabled={procesando}
          onClick={onConfirmar}
        >
          {procesando ? 'Procesando…' : textoConfirmar}
        </ButtonComponent>
      </div>
    </Dialogo>
  );
}
