import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import {
  NOMBRES_TIPO_EVENTO,
  TipoEvento,
  type EventoACargar,
} from '../../modelos/partido';

/** Color del badge de cada tipo de evento. */
const COLOR_TIPO: Record<TipoEvento, string> = {
  [TipoEvento.Gol]: 'e-badge-success',
  [TipoEvento.GolEnContra]: 'e-badge-secondary',
  [TipoEvento.Amonestacion]: 'e-badge-warning',
  [TipoEvento.Expulsion]: 'e-badge-danger',
  [TipoEvento.Cambio]: 'e-badge-info',
};

/** Datos de un jugador para mostrarlo en un evento. */
export interface JugadorDeEvento {
  nombre: string;
  equipo: string;
}

interface Props {
  /** Eventos, ya ordenados por minuto. */
  eventos: EventoACargar[];
  /** Nombre y equipo de cada inscripción. */
  jugador: (inscripcionJugadorId: string) => JugadorDeEvento | undefined;
  /** Quita un evento (por su posición). Sin esta función, la lista es solo de lectura. */
  onQuitar?: (indice: number) => void;
}

/** Eventos del partido por minuto: "23' Gol — Díaz, Matías (Los Halcones)". */
export function ListaEventos({ eventos, jugador, onQuitar }: Props) {
  if (eventos.length === 0) {
    return <p className="texto-secundario">Todavía no hay eventos.</p>;
  }

  return (
    <ol className="lista-eventos">
      {eventos.map((evento, indice) => {
        const protagonista = jugador(evento.inscripcionJugadorId);
        const entra = evento.inscripcionJugadorEntraId
          ? jugador(evento.inscripcionJugadorEntraId)
          : undefined;
        const tipo = NOMBRES_TIPO_EVENTO[evento.tipoEvento];
        return (
          <li key={indice} className="lista-eventos__item">
            <span className="lista-eventos__minuto">{evento.minuto}'</span>
            <span className={`e-badge ${COLOR_TIPO[evento.tipoEvento]}`}>
              {tipo}
            </span>
            <span className="lista-eventos__detalle">
              {entra
                ? `Sale ${protagonista?.nombre}, entra ${entra.nombre}`
                : protagonista?.nombre}{' '}
              <span className="texto-secundario">({protagonista?.equipo})</span>
            </span>
            {onQuitar && (
              <ButtonComponent
                type="button"
                cssClass="e-flat e-round e-danger"
                iconCss="e-icons e-trash"
                title={`Quitar ${tipo} del minuto ${evento.minuto}`}
                aria-label={`Quitar ${tipo} del minuto ${evento.minuto}`}
                onClick={() => onQuitar(indice)}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
