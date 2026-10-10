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
import { usePosiciones } from '../hooks/posiciones.hooks';
import { useTorneoSeleccionado } from '../hooks/torneo-seleccionado.hook';
import { useTorneos } from '../hooks/torneos.hooks';
import { EstadoTorneo } from '../modelos/estados';
import type { FilaPosiciones } from '../modelos/posiciones';
import { formatearDiferencia } from '../utilidades/formato';

/** Fila de la tabla con el torneo, para armar el enlace al detalle del equipo. */
type FilaConTorneo = FilaPosiciones & { torneoId: number };

/** Columnas que solo se ven desde MD: en celular quedan posición, equipo, PJ, DG y puntos. */
const DESDE_MD = '(min-width: 768px)';

/**
 * Listado con filtro: tabla de posiciones del torneo elegido.
 * Cada equipo es un enlace a su detalle en el torneo.
 */
export function PosicionesPagina() {
  const consultaTorneos = useTorneos();
  // Por defecto, el primer torneo en curso.
  const { torneo, seleccionar } = useTorneoSeleccionado(
    consultaTorneos.data,
    (t) => t.estadoTorneo === EstadoTorneo.EnCurso,
  );
  const consultaPosiciones = usePosiciones(torneo?.id ?? null);
  const datos = consultaPosiciones.data;

  // Se agrega el torneo a cada fila. useMemo: la grilla recibe el mismo arreglo mientras no
  // cambien los datos (uno nuevo en cada dibujo la haría recargarse).
  const filas = useMemo<FilaConTorneo[] | undefined>(
    () =>
      torneo && datos
        ? datos.map((fila) => ({ ...fila, torneoId: torneo.id }))
        : undefined,
    [datos, torneo],
  );

  // #region Plantillas de columnas
  const plantillaEquipo = useCallback(
    (fila: FilaConTorneo) => (
      <Link
        className="celda-equipo enlace-equipo"
        // El torneo sale de la fila de la tabla y no del estado de la pantalla: así la plantilla
        // no depende de nada que cambie y la grilla no la vuelve a crear.
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
  const plantillaDiferencia = useCallback(
    (fila: FilaPosiciones) => formatearDiferencia(fila.diferenciaGoles),
    [],
  );
  const plantillaPuntos = useCallback(
    (fila: FilaPosiciones) => <strong>{fila.puntos}</strong>,
    [],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Posiciones"
        descripcion="Tabla del torneo. Tocá un equipo para ver su detalle."
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

          {consultaPosiciones.isLoading && (
            <Cargando texto="Calculando posiciones…" />
          )}
          {consultaPosiciones.error && (
            <MensajeError
              error={consultaPosiciones.error}
              onReintentar={() => consultaPosiciones.refetch()}
            />
          )}

          {filas && (
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
                    field="equipo.nombre"
                    headerText="Equipo"
                    minWidth={140}
                    template={plantillaEquipo}
                  />
                  <ColumnDirective
                    field="partidosJugados"
                    headerText="PJ"
                    width={48}
                    textAlign="Center"
                  />
                  <ColumnDirective
                    field="ganados"
                    headerText="G"
                    width={48}
                    textAlign="Center"
                    hideAtMedia={DESDE_MD}
                  />
                  <ColumnDirective
                    field="empatados"
                    headerText="E"
                    width={48}
                    textAlign="Center"
                    hideAtMedia={DESDE_MD}
                  />
                  <ColumnDirective
                    field="perdidos"
                    headerText="P"
                    width={48}
                    textAlign="Center"
                    hideAtMedia={DESDE_MD}
                  />
                  <ColumnDirective
                    field="golesAFavor"
                    headerText="GF"
                    width={48}
                    textAlign="Center"
                    hideAtMedia={DESDE_MD}
                  />
                  <ColumnDirective
                    field="golesEnContra"
                    headerText="GC"
                    width={48}
                    textAlign="Center"
                    hideAtMedia={DESDE_MD}
                  />
                  <ColumnDirective
                    field="diferenciaGoles"
                    headerText="DG"
                    width={48}
                    textAlign="Center"
                    template={plantillaDiferencia}
                  />
                  <ColumnDirective
                    field="puntos"
                    headerText="Pts"
                    width={52}
                    textAlign="Center"
                    template={plantillaPuntos}
                  />
                </ColumnsDirective>
              </GridComponent>
              <p className="referencias">
                PJ: partidos jugados · G: ganados · E: empatados · P: perdidos ·
                GF: goles a favor · GC: goles en contra · DG: diferencia de gol.
                Ganar suma 3 puntos y empatar, 1. A igual puntaje se ordena por
                diferencia de gol, goles a favor y nombre.
              </p>
            </>
          )}
        </>
      )}
    </>
  );
}
