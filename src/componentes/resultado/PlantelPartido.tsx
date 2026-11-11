import {
  ButtonComponent,
  CheckBoxComponent,
} from '@syncfusion/ej2-react-buttons';
import type { EquipoPlanilla } from '../../modelos/partido';
import { EscudoEquipo } from '../equipos/EscudoEquipo';

interface Props {
  equipo: EquipoPlanilla;
  /** Inscripciones de los jugadores marcados como "jugó" (de los dos equipos). */
  jugaron: Set<string>;
  onCambiar: (inscripcionJugadorId: string, jugo: boolean) => void;
  /** Marca o desmarca a todo el plantel del equipo. */
  onTodos: (jugo: boolean) => void;
  deshabilitado?: boolean;
}

/**
 * Plantel de un equipo con una casilla "jugó" por jugador. Un jugador que cumple una suspensión en
 * este partido aparece marcado y no se puede anotar ("Todos" lo saltea). Si igual figura como que
 * jugó (una planilla cargada antes de la sanción), la casilla queda habilitada para sacarlo.
 */
export function PlantelPartido({
  equipo,
  jugaron,
  onCambiar,
  onTodos,
  deshabilitado = false,
}: Props) {
  const cantidad = equipo.plantel.filter((j) =>
    jugaron.has(j.inscripcionJugadorId),
  ).length;

  return (
    <section className="plantel-partido">
      <header className="plantel-partido__encabezado">
        <EscudoEquipo nombre={equipo.nombre} escudoURL={equipo.escudoURL} />
        <div>
          <h3>{equipo.nombre}</h3>
          <span className="texto-secundario">
            Jugaron {cantidad} de {equipo.plantel.length}
          </span>
        </div>
      </header>

      {equipo.plantel.length === 0 ? (
        <p className="texto-secundario">
          El equipo no tiene jugadores inscriptos en este torneo.
        </p>
      ) : (
        <>
          <div className="plantel-partido__acciones">
            <ButtonComponent
              type="button"
              cssClass="e-flat e-small"
              disabled={deshabilitado}
              onClick={() => onTodos(true)}
            >
              Todos
            </ButtonComponent>
            <ButtonComponent
              type="button"
              cssClass="e-flat e-small"
              disabled={deshabilitado}
              onClick={() => onTodos(false)}
            >
              Ninguno
            </ButtonComponent>
          </div>
          <ul className="plantel-partido__lista">
            {equipo.plantel.map((jugador) => {
              const jugo = jugaron.has(jugador.inscripcionJugadorId);
              return (
                <li key={jugador.inscripcionJugadorId}>
                  <CheckBoxComponent
                    label={`${jugador.dorsal} · ${jugador.apellidos}, ${jugador.nombres}${jugador.capitan ? ' (C)' : ''}${jugador.suspendido ? ' — suspendido' : ''}`}
                    checked={jugo}
                    disabled={deshabilitado || (jugador.suspendido && !jugo)}
                    change={(e) =>
                      onCambiar(
                        jugador.inscripcionJugadorId,
                        Boolean(e.checked),
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
