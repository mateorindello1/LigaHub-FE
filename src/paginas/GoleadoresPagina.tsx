import { useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
} from '@syncfusion/ej2-react-grids';
import { Cargando } from '../componentes/comunes/Cargando';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { EscudoEquipo } from '../componentes/equipos/EscudoEquipo';
import { SelectorTorneo } from '../componentes/torneos/SelectorTorneo';
import { IDIOMA } from '../config/textos-syncfusion';
import { useGoleadores } from '../hooks/estadisticas.hooks';
import { useTorneoSeleccionado } from '../hooks/torneo-seleccionado.hook';
import { useTorneos } from '../hooks/torneos.hooks';
import { EstadoTorneo } from '../modelos/estados';
import type { FilaGoleadores } from '../modelos/goleadores';

/** Fila con el torneo, para armar el enlace al detalle del equipo. */
type FilaConTorneo = FilaGoleadores & { torneoId: number };

/** Columnas que solo se ven desde MD. */
const DESDE_MD = '(min-width: 768px)';

/**
 * Listado con filtro: goleadores del torneo elegido (alcance voluntario).
 * El equipo es un enlace a su detalle en el torneo, como en Posiciones.
 */
export function GoleadoresPagina() {
  const consultaTorneos = useTorneos();
  // Por defecto, el primer torneo en curso.
  const { torneo, seleccionar } = useTorneoSeleccionado(
    consultaTorneos.data,
    (t) => t.estadoTorneo === EstadoTorneo.EnCurso,
  );
  const consultaGoleadores = useGoleadores(torneo?.id ?? null);
  const datos = consultaGoleadores.data;

  // useMemo: la grilla recibe el mismo arreglo mientras no cambien los datos.
  const filas = useMemo<FilaConTorneo[] | undefined>(
    () =>
      torneo && datos
        ? datos.map((fila) => ({ ...fila, torneoId: torneo.id }))
        : undefined,
    [datos, torneo],
  );

  // #region Plantillas de columnas
  const plantillaJugador = useCallback(
    (fila: FilaGoleadores) => (
      <div className="celda-dos-lineas">
        <span>
          {fila.jugador.apellidos}, {fila.jugador.nombres}
        </span>
        {/* En celular no está la columna Equipo: va debajo del nombre. */}
        <span className="solo-sm texto-secundario">{fila.equipo.nombre}</span>
      </div>
    ),
    [],
  );
  const plantillaEquipo = useCallback(
    (fila: FilaConTorneo) => (
      <Link
        className="celda-equipo enlace-equipo"
        to={`/posiciones/${fila.torneoId}/equipos/${fila.equipo.id}`}
      >
        <EscudoEquipo
          nombre={fila.equipo.nombre}
          escudoURL={fila.equipo.escudoURL}
        />
        <span>{fila.equipo.nombre}</span>
      </Link>
    ),
    [],
  );
  const plantillaGoles = useCallback(
    (fila: FilaGoleadores) => <strong>{fila.goles}</strong>,
    [],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Goleadores"
        descripcion="Quiénes hicieron más goles en el torneo. Tocá un equipo para ver su detalle."
      />

      {consultaTorneos.isPending && <Cargando texto="Cargando torneos…" />}
      {consultaTorneos.error && (
        <MensajeError
          error={consultaTorneos.error}
          onReintentar={() => consultaTorneos.refetch()}
        />
      )}
      {consultaTorneos.data?.length === 0 && (
        <p>Todavía no hay torneos. Creá uno en la pantalla Torneos.</p>
      )}

      {consultaTorneos.data && torneo && (
        <>
          <SelectorTorneo
            torneos={consultaTorneos.data}
            valor={torneo.id}
            onCambiar={seleccionar}
          />

          {consultaGoleadores.isLoading && <Cargando texto="Contando goles…" />}
          {consultaGoleadores.error && (
            <MensajeError
              error={consultaGoleadores.error}
              onReintentar={() => consultaGoleadores.refetch()}
            />
          )}

          {filas?.length === 0 && (
            <p className="texto-secundario">
              Todavía no hay goles en este torneo. Aparecen cuando se carga el
              resultado de un partido jugado.
            </p>
          )}

          {filas && filas.length > 0 && (
            <>
              <GridComponent
                dataSource={filas}
                cssClass="tabla-compacta"
                locale={IDIOMA}
                enableHover={false}
                rowHeight={48}
              >
                <ColumnsDirective>
                  <ColumnDirective
                    field="posicion"
                    headerText="#"
                    width={40}
                    textAlign="Center"
                  />
                  <ColumnDirective
                    field="jugador.apellidos"
                    headerText="Jugador"
                    minWidth={140}
                    template={plantillaJugador}
                  />
                  <ColumnDirective
                    field="equipo.nombre"
                    headerText="Equipo"
                    minWidth={140}
                    template={plantillaEquipo}
                    hideAtMedia={DESDE_MD}
                  />
                  <ColumnDirective
                    field="partidosJugados"
                    headerText="PJ"
                    width={48}
                    textAlign="Center"
                    hideAtMedia={DESDE_MD}
                  />
                  <ColumnDirective
                    field="goles"
                    headerText="Goles"
                    width={76}
                    textAlign="Center"
                    template={plantillaGoles}
                  />
                </ColumnsDirective>
              </GridComponent>
              <p className="referencias">
                PJ: partidos jugados. Cuentan los goles de los partidos jugados;
                los goles en contra no se suman al jugador. A igual cantidad de
                goles se comparte la posición y primero va quien jugó menos
                partidos.
              </p>
            </>
          )}
        </>
      )}
    </>
  );
}
