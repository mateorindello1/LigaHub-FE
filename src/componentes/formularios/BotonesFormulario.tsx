import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

interface Props {
  /** Mientras es true, los botones quedan deshabilitados y el principal muestra textoProcesando. */
  guardando: boolean;
  onCancelar: () => void;
  /** Texto del botón que envía el formulario (por defecto, "Guardar"). */
  textoGuardar?: string;
  /** Texto del botón mientras se envía (por defecto, "Guardando…"). */
  textoProcesando?: string;
}

/** Pie de los formularios: Cancelar y el botón que envía el formulario. */
export function BotonesFormulario({
  guardando,
  onCancelar,
  textoGuardar = 'Guardar',
  textoProcesando = 'Guardando…',
}: Props) {
  return (
    <div className="dialogo__pie">
      <ButtonComponent
        type="button"
        cssClass="e-flat"
        disabled={guardando}
        onClick={onCancelar}
      >
        Cancelar
      </ButtonComponent>
      <ButtonComponent type="submit" isPrimary disabled={guardando}>
        {guardando ? textoProcesando : textoGuardar}
      </ButtonComponent>
    </div>
  );
}
