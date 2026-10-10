import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

interface Props {
  /** Nombre del registro, para lectores de pantalla ("Modificar Apertura"). */
  descripcion: string;
  onModificar: () => void;
  onBorrar: () => void;
}

/** Botones de modificar y borrar de cada fila de una grilla. */
export function AccionesFila({ descripcion, onModificar, onBorrar }: Props) {
  return (
    <div className="acciones-fila">
      <ButtonComponent
        cssClass="e-flat e-round"
        iconCss="e-icons e-edit"
        title={`Modificar ${descripcion}`}
        aria-label={`Modificar ${descripcion}`}
        onClick={onModificar}
      />
      <ButtonComponent
        cssClass="e-flat e-round e-danger"
        iconCss="e-icons e-trash"
        title={`Borrar ${descripcion}`}
        aria-label={`Borrar ${descripcion}`}
        onClick={onBorrar}
      />
    </div>
  );
}
