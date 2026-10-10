import { useMemo } from 'react';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { IDIOMA } from '../../config/textos-syncfusion';
import type { Torneo } from '../../modelos/torneo';
import { BadgeEstadoTorneo } from './BadgeEstadoTorneo';

/** Propiedades de cada opción que usa la lista (fuera del componente: es siempre el mismo objeto). */
const CAMPOS = { text: 'texto', value: 'id' };

interface Props {
  torneos: Torneo[];
  /** Id del torneo elegido (input property). */
  valor: number | null;
  /** Avisa que el usuario eligió otro torneo (output property). */
  onCambiar: (torneoId: number) => void;
}

/**
 * Filtro por torneo: lista desplegable con los torneos y el estado del elegido.
 * No guarda estado propio: muestra "valor" y avisa el cambio, y la pantalla decide qué hacer
 * (como un componente Blazor con [Parameter] Value y EventCallback ValueChanged).
 */
export function SelectorTorneo({ torneos, valor, onCambiar }: Props) {
  // Texto de cada opción: "Apertura 2026". useMemo lo recalcula solo si cambian los torneos.
  const opciones = useMemo(
    () => torneos.map((t) => ({ id: t.id, texto: `${t.nombre} ${t.anio}` })),
    [torneos],
  );
  const elegido = torneos.find((t) => t.id === valor);

  return (
    <div className="selector-torneo">
      <div className="selector-torneo__lista">
        <DropDownListComponent
          dataSource={opciones}
          fields={CAMPOS}
          placeholder="Torneo"
          floatLabelType="Always"
          locale={IDIOMA}
          value={valor ?? undefined}
          change={(e) => {
            // "isInteracted" distingue la elección del usuario de un cambio hecho por código.
            if (e.isInteracted && typeof e.value === 'number') {
              onCambiar(e.value);
            }
          }}
        />
      </div>
      {elegido && <BadgeEstadoTorneo estado={elegido.estadoTorneo} />}
    </div>
  );
}
