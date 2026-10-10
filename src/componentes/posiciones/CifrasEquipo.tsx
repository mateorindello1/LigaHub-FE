import type { FilaPosiciones } from '../../modelos/posiciones';
import { formatearDiferencia } from '../../utilidades/formato';

interface Props {
  /** Línea del equipo en la tabla de posiciones. */
  posicion: Omit<FilaPosiciones, 'equipo'>;
}

/** Cifras del equipo en el torneo (posición, puntos, partidos y goles) como tarjetas chicas. */
export function CifrasEquipo({ posicion }: Props) {
  const cifras = [
    { etiqueta: 'Posición', valor: `${posicion.posicion}°`, destacada: true },
    { etiqueta: 'Puntos', valor: posicion.puntos, destacada: true },
    { etiqueta: 'Jugados', valor: posicion.partidosJugados },
    { etiqueta: 'Ganados', valor: posicion.ganados },
    { etiqueta: 'Empatados', valor: posicion.empatados },
    { etiqueta: 'Perdidos', valor: posicion.perdidos },
    { etiqueta: 'Goles a favor', valor: posicion.golesAFavor },
    { etiqueta: 'Goles en contra', valor: posicion.golesEnContra },
    {
      etiqueta: 'Diferencia',
      valor: formatearDiferencia(posicion.diferenciaGoles),
    },
  ];

  return (
    <dl className="cifras">
      {cifras.map((cifra) => (
        <div
          key={cifra.etiqueta}
          className={cifra.destacada ? 'cifra cifra--destacada' : 'cifra'}
        >
          <dt>{cifra.etiqueta}</dt>
          <dd>{cifra.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
