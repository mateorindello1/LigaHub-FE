import { useCallback } from 'react';
import { Link, useParams } from 'react-router';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
} from '@syncfusion/ej2-react-grids';
import { ErrorApi } from '../api/error-api';
import { Cargando } from '../componentes/comunes/Cargando';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { EscudoEquipo } from '../componentes/equipos/EscudoEquipo';
import { CifrasEquipo } from '../componentes/posiciones/CifrasEquipo';
import { ResultadoPartido } from '../componentes/posiciones/ResultadoPartido';
import { BadgeEstadoTorneo } from '../componentes/torneos/BadgeEstadoTorneo';
import { IDIOMA } from '../config/textos-syncfusion';
import { useDetalleEquipo } from '../hooks/posiciones.hooks';
import type { JugadorDetalle, PartidoDetalle } from '../modelos/posiciones';
import { formatearFechaHora } from '../utilidades/formato';
import { NoEncontradaPagina } from './NoEncontradaPagina';

/**
 * Pantalla de detalle (/posiciones/:torneoId/equipos/:equipoId): el equipo en un torneo.
 * La ruta cuelga de /posiciones para que el menú marque esa opción.
 * Combina datos de varias clases de negocio: Torneo, Equipo, su línea de la tabla,
 * sus Partidos y los Jugadores inscriptos.
 */
export function DetalleEquipoPagina() {
  // useParams lee los parámetros de la ruta, como los [Parameter] de una ruta "@page "/x/{id:int}"".
  const parametros = useParams();
  const torneoId = Number(parametros.torneoId);
  const equipoId = Number(parametros.equipoId);
  const idsValidos =
    Number.isInteger(torneoId) &&
    torneoId > 0 &&
    Number.isInteger(equipoId) &&
    equipoId > 0;

  // Con ids inválidos no se muestra la pantalla. El detalle va en un componente aparte porque
  // un hook (useDetalleEquipo) no se puede llamar después de un return condicional.
  if (!idsValidos) return <NoEncontradaPagina />;
  return <DetalleEquipo torneoId={torneoId} equipoId={equipoId} />;
}

interface Props {
  torneoId: number;
  equipoId: number;
}

/** Contenido del detalle, con los ids ya validados. */
function DetalleEquipo({ torneoId, equipoId }: Props) {
  const {
    data: detalle,
    isPending,
    error,
    refetch,
  } = useDetalleEquipo(torneoId, equipoId);

  // #region Plantillas de columnas
  const plantillaRival = useCallback(
    (partido: PartidoDetalle) => (
      <span className="texto-ajustable">
        {partido.rival.nombre}{' '}
        <span className="texto-secundario">
          ({partido.condicion === 'Local' ? 'L' : 'V'})
        </span>
      </span>
    ),
    [],
  );
  const plantillaFechaHora = useCallback(
    (partido: PartidoDetalle) => formatearFechaHora(partido.fechaHora),
    [],
  );
  const plantillaResultado = useCallback(
    (partido: PartidoDetalle) => <ResultadoPartido partido={partido} />,
    [],
  );
  const plantillaCancha = useCallback(
    (partido: PartidoDetalle) =>
      partido.cancha
        ? `${partido.cancha.predio}, cancha ${partido.cancha.numero}`
        : 'A confirmar',
    [],
  );
  const plantillaJugador = useCallback(
    (jugador: JugadorDetalle) => (
      <span className="celda-jugador">
        {jugador.apellidos}, {jugador.nombres}
        {jugador.capitan && (
          <span className="e-badge e-badge-primary" title="Capitán">
            C
          </span>
        )}
      </span>
    ),
    [],
  );
  // #endregion

  const volver = (
    <Link className="enlace-volver" to={`/posiciones?torneo=${torneoId}`}>
      <span className="e-icons e-chevron-left" aria-hidden="true" />
      Volver a la tabla
    </Link>
  );

  if (isPending) return <Cargando texto="Cargando el equipo…" />;
  if (error) {
    // Un 404 (el equipo no está inscripto en el torneo) no se arregla reintentando.
    const reintentable = !(
      error instanceof ErrorApi && error.esErrorDelCliente
    );
    return (
      <>
        {volver}
        <MensajeError
          error={error}
          onReintentar={reintentable ? () => refetch() : undefined}
        />
      </>
    );
  }

  return (
    <>
      {volver}

      <title>{`${detalle.equipo.nombre} · ${detalle.torneo.nombre} · LigaHub`}</title>
      <header className="encabezado-equipo">
        <EscudoEquipo
          nombre={detalle.equipo.nombre}
          escudoURL={detalle.equipo.escudoURL}
          tamanio={64}
        />
        <div>
          <h1>{detalle.equipo.nombre}</h1>
          <p className="encabezado-equipo__torneo">
            {detalle.torneo.nombre} {detalle.torneo.anio}{' '}
            <BadgeEstadoTorneo estado={detalle.torneo.estadoTorneo} />
          </p>
        </div>
      </header>

      <CifrasEquipo posicion={detalle.posicion} />

      <div className="detalle-equipo__secciones">
        <section>
          <h2>Partidos</h2>
          {detalle.partidos.length === 0 ? (
            <p className="texto-secundario">
              Todavía no hay partidos: el fixture no está generado.
            </p>
          ) : (
            <GridComponent
              dataSource={detalle.partidos}
              cssClass="tabla-compacta"
              locale={IDIOMA}
              enableHover={false}
            >
              <ColumnsDirective>
                <ColumnDirective
                  field="numeroFecha"
                  headerText="Fecha"
                  width={70}
                  textAlign="Center"
                />
                <ColumnDirective
                  field="rival.nombre"
                  headerText="Rival"
                  minWidth={120}
                  template={plantillaRival}
                />
                <ColumnDirective
                  field="resultado"
                  headerText="Resultado"
                  width={130}
                  template={plantillaResultado}
                />
                <ColumnDirective
                  field="fechaHora"
                  headerText="Día y hora"
                  width={170}
                  template={plantillaFechaHora}
                  hideAtMedia="(min-width: 768px)"
                />
                <ColumnDirective
                  field="cancha.predio"
                  headerText="Cancha"
                  minWidth={180}
                  template={plantillaCancha}
                  hideAtMedia="(min-width: 992px)"
                />
              </ColumnsDirective>
            </GridComponent>
          )}
        </section>

        <section className="detalle-equipo__jugadores">
          <h2>Jugadores</h2>
          {detalle.jugadores.length === 0 ? (
            <p className="texto-secundario">
              Todavía no hay jugadores inscriptos en el equipo.
            </p>
          ) : (
            <>
              <GridComponent
                dataSource={detalle.jugadores}
                locale={IDIOMA}
                enableHover={false}
              >
                <ColumnsDirective>
                  <ColumnDirective
                    field="dorsal"
                    headerText="N°"
                    width={60}
                    textAlign="Center"
                  />
                  <ColumnDirective
                    field="apellidos"
                    headerText="Jugador"
                    template={plantillaJugador}
                  />
                </ColumnsDirective>
              </GridComponent>
              <p className="texto-secundario">C: capitán.</p>
            </>
          )}
        </section>
      </div>
    </>
  );
}
