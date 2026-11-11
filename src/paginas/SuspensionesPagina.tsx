import { useCallback, useMemo } from 'react';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
} from '@syncfusion/ej2-react-grids';
import { Cargando } from '../componentes/comunes/Cargando';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { SelectorTorneo } from '../componentes/torneos/SelectorTorneo';
import { IDIOMA } from '../config/textos-syncfusion';
import { useSuspensiones } from '../hooks/estadisticas.hooks';
import { useTorneoSeleccionado } from '../hooks/torneo-seleccionado.hook';
import { useTorneos } from '../hooks/torneos.hooks';
import { EstadoTorneo } from '../modelos/estados';
import {
  AMONESTACIONES_PARA_SUSPENSION,
  type JugadorSancionado,
  type ResumenTarjetas,
  type Sancion,
} from '../modelos/suspensiones';
import {
  describirSancion,
  type TextosSancion,
} from '../utilidades/suspensiones';

/** Sanción con sus textos ya armados, para las plantillas de la grilla. */
type FilaSancion = Sancion & TextosSancion;

/** Columnas que solo se ven desde MD. */
const DESDE_MD = '(min-width: 768px)';

/**
 * Suspensiones del torneo elegido (caso de uso del alcance voluntario): el backend las calcula a
 * partir de las tarjetas de cada partido. Muestra las sanciones, con las fechas en que el jugador
 * no puede jugar, y las tarjetas de cada jugador.
 */
export function SuspensionesPagina() {
  const consultaTorneos = useTorneos();
  // Por defecto, el primer torneo en curso.
  const { torneo, seleccionar } = useTorneoSeleccionado(
    consultaTorneos.data,
    (t) => t.estadoTorneo === EstadoTorneo.EnCurso,
  );
  const consultaSuspensiones = useSuspensiones(torneo?.id ?? null);
  const datos = consultaSuspensiones.data;

  // useMemo: la grilla recibe el mismo arreglo mientras no cambien los datos.
  const sanciones = useMemo<FilaSancion[] | undefined>(
    () =>
      datos?.sanciones.map((sancion) => ({
        ...sancion,
        ...describirSancion(sancion),
      })),
    [datos],
  );

  // #region Plantillas de columnas
  const plantillaJugador = useCallback(
    (fila: JugadorSancionado) => (
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
  const plantillaMotivo = useCallback(
    (fila: FilaSancion) => (
      <span className="texto-ajustable">
        {fila.textoMotivo} en la fecha {fila.numeroFecha}
      </span>
    ),
    [],
  );
  const plantillaEstado = useCallback(
    (fila: FilaSancion) => <BadgeEstadoSancion fila={fila} />,
    [],
  );
  const plantillaNoJuega = useCallback(
    (fila: FilaSancion) => (
      <div className="celda-dos-lineas">
        <span>{fila.noJuega}</span>
        {/* En celular no está la columna Estado: va debajo. */}
        <span className="solo-sm">
          <BadgeEstadoSancion fila={fila} />
        </span>
      </div>
    ),
    [],
  );
  const plantillaAcumuladas = useCallback(
    (fila: ResumenTarjetas) =>
      `${fila.amonestacionesAcumuladas} de ${AMONESTACIONES_PARA_SUSPENSION}`,
    [],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Suspensiones"
        descripcion="Quiénes no pueden jugar por tarjetas, y en qué fechas."
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

          {consultaSuspensiones.isLoading && (
            <Cargando texto="Calculando suspensiones…" />
          )}
          {consultaSuspensiones.error && (
            <MensajeError
              error={consultaSuspensiones.error}
              onReintentar={() => consultaSuspensiones.refetch()}
            />
          )}

          {datos && sanciones && (
            <>
              <section className="seccion-listado">
                <h2>Sanciones</h2>
                {sanciones.length === 0 ? (
                  <p className="texto-secundario">
                    No hay jugadores sancionados en este torneo.
                  </p>
                ) : (
                  <GridComponent
                    dataSource={sanciones}
                    cssClass="tabla-compacta"
                    locale={IDIOMA}
                    enableHover={false}
                    rowHeight={48}
                  >
                    <ColumnsDirective>
                      <ColumnDirective
                        field="jugador.apellidos"
                        headerText="Jugador"
                        minWidth={140}
                        template={plantillaJugador}
                      />
                      <ColumnDirective
                        field="equipo.nombre"
                        headerText="Equipo"
                        minWidth={120}
                        hideAtMedia={DESDE_MD}
                      />
                      <ColumnDirective
                        field="textoMotivo"
                        headerText="Motivo"
                        minWidth={130}
                        template={plantillaMotivo}
                      />
                      <ColumnDirective
                        field="noJuega"
                        headerText="No juega"
                        minWidth={96}
                        template={plantillaNoJuega}
                      />
                      <ColumnDirective
                        field="estado"
                        headerText="Estado"
                        width={104}
                        template={plantillaEstado}
                        hideAtMedia={DESDE_MD}
                      />
                    </ColumnsDirective>
                  </GridComponent>
                )}
              </section>

              <section className="seccion-listado">
                <h2>Tarjetas</h2>
                {datos.tarjetas.length === 0 ? (
                  <p className="texto-secundario">
                    Todavía no hay tarjetas en este torneo.
                  </p>
                ) : (
                  <GridComponent
                    dataSource={datos.tarjetas}
                    cssClass="tabla-compacta"
                    locale={IDIOMA}
                    enableHover={false}
                    rowHeight={48}
                  >
                    <ColumnsDirective>
                      <ColumnDirective
                        field="jugador.apellidos"
                        headerText="Jugador"
                        minWidth={140}
                        template={plantillaJugador}
                      />
                      <ColumnDirective
                        field="equipo.nombre"
                        headerText="Equipo"
                        minWidth={120}
                        hideAtMedia={DESDE_MD}
                      />
                      <ColumnDirective
                        field="amonestaciones"
                        headerText="Amarillas"
                        width={96}
                        textAlign="Center"
                      />
                      <ColumnDirective
                        field="expulsiones"
                        headerText="Rojas"
                        width={72}
                        textAlign="Center"
                      />
                      <ColumnDirective
                        field="amonestacionesAcumuladas"
                        headerText="Acumuladas"
                        width={124}
                        textAlign="Center"
                        template={plantillaAcumuladas}
                        hideAtMedia={DESDE_MD}
                      />
                    </ColumnsDirective>
                  </GridComponent>
                )}
              </section>

              <p className="referencias">
                Una expulsión suspende una fecha. Cada{' '}
                {AMONESTACIONES_PARA_SUSPENSION} amarillas acumuladas en el
                torneo suspenden una fecha; las amarillas del partido en que el
                jugador fue expulsado no se acumulan. La suspensión se cumple en
                los próximos partidos de su equipo; los partidos suspendidos no
                cuentan. Un jugador suspendido no se puede anotar en la planilla
                de ese partido.
              </p>
            </>
          )}
        </>
      )}
    </>
  );
}

/** Estado de la sanción como badge: pendiente resalta, cumplida queda en segundo plano. */
function BadgeEstadoSancion({ fila }: { fila: FilaSancion }) {
  return (
    <span
      className={`e-badge ${fila.cumplida ? 'e-badge-secondary' : 'e-badge-warning'}`}
    >
      {fila.estado}
    </span>
  );
}
