import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

interface Props {
  /** Mientras es true, los botones quedan deshabilitados y el principal dice "Guardando…". */
  guardando: boolean;
  onCancelar: () => void;
}

/** Pie de los formularios: Cancelar y Guardar (este último envía el formulario). */
export function BotonesFormulario({ guardando, onCancelar }: Props) {
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
        {guardando ? 'Guardando…' : 'Guardar'}
      </ButtonComponent>
    </div>
  );
}
