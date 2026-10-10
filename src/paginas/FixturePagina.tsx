import { useState } from 'react';
import { Link } from 'react-router';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Cargando } from '../componentes/comunes/Cargando';
import { Dialogo } from '../componentes/comunes/Dialogo';
import { DialogoConfirmacion } from '../componentes/comunes/DialogoConfirmacion';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { FormularioGenerarFixture } from '../componentes/fixture/FormularioGenerarFixture';
import { TarjetaFecha } from '../componentes/fixture/TarjetaFecha';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { SelectorTorneo } from '../componentes/torneos/SelectorTorneo';
import {
  useDeshacerFixture,
  useFixture,
  useGenerarFixture,
} from '../hooks/fixture.hooks';
import { useInscripciones } from '../hooks/inscripciones-equipo.hooks';
import { useTorneoSeleccionado } from '../hooks/torneo-seleccionado.hook';
import { useTorneos } from '../hooks/torneos.hooks';
import { EstadoTorneo } from '../modelos/estados';
import type { DatosFormularioGenerarFixture } from '../validaciones/generar-fixture.validacion';

/**
 * Caso de uso "generar fixture": muestra el fixture del torneo elegido y, si el torneo está en
 * inscripción y todavía no tiene, permite generarlo. También permite deshacerlo mientras no
 * haya partidos jugados.
 */
export function FixturePagina() {
  // #region Estado
  const consultaTorneos = useTorneos();
  // Por defecto, el primer torneo en curso.
  const { torneo, seleccionar } = useTorneoSeleccionado(
    consultaTorneos.data,
    (t) => t.estadoTorneo === EstadoTorneo.EnCurso,
  );
  const torneoId = torneo?.id ?? null;

  const consultaFixture = useFixture(torneoId);
  const { data: inscripciones } = useInscripciones(torneoId);
  const generar = useGenerarFixture(torneoId ?? 0);
  const deshacer = useDeshacerFixture(torneoId ?? 0);
  const notificaciones = useNotificaciones();

  const [generando, setGenerando] = useState(false);
  const [confirmandoDeshacer, setConfirmandoDeshacer] = useState(false);

  const fechas = consultaFixture.data;
  const tieneFixture = fechas !== undefined && fechas.length > 0;
  const enInscripcion = torneo?.estadoTorneo === EstadoTorneo.Inscripcion;
  const cantidadEquipos = inscripciones?.length ?? 0;
  const puedeGenerar = enInscripcion && fechas !== undefined && !tieneFixture;
  // #endregion

  // #region Acciones
  async function confirmarGeneracion(datos: DatosFormularioGenerarFixture) {
    if (!torneo) return;
    const generadas = await generar.mutateAsync({
      idaYVuelta: datos.idaYVuelta,
      // El backend recibe ISO 8601. toISOString() lo pasa a UTC: "2026-11-07T18:00:00.000Z".
      fechaInicio: datos.fechaInicio?.toISOString(),
    });
    // Se fija el torneo en la URL: al pasar a En curso, el torneo por defecto podría ser otro.
    seleccionar(torneo.id);
    notificaciones.exito(
      `Se generó el fixture de ${torneo.nombre}: ${generadas.length} fechas.`,
    );
    setGenerando(false);
  }

  function confirmarDeshacer() {
    if (!torneo) return;
    deshacer.mutate(undefined, {
      onSuccess: () => {
        seleccionar(torneo.id);
        notificaciones.exito(
          `Se deshizo el fixture de ${torneo.nombre}. Las inscripciones vuelven a estar abiertas.`,
        );
      },
      onError: (error) => notificaciones.error(error),
      onSettled: () => setConfirmandoDeshacer(false),
    });
  }
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Fixture"
        descripcion="Fechas y partidos del torneo, todos contra todos."
        acciones={
          <>
            {puedeGenerar && (
              <ButtonComponent
                isPrimary
                iconCss="e-icons e-month"
                disabled={cantidadEquipos < 2}
                onClick={() => setGenerando(true)}
              >
                Generar fixture
              </ButtonComponent>
            )}
            {tieneFixture && (
              <ButtonComponent
                cssClass="e-outline"
                iconCss="e-icons e-undo"
                onClick={() => setConfirmandoDeshacer(true)}
              >
                Deshacer fixture
              </ButtonComponent>
            )}
          </>
        }
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

          {consultaFixture.isLoading && <Cargando texto="Cargando fixture…" />}
          {consultaFixture.error && (
            <MensajeError
              error={consultaFixture.error}
              onReintentar={() => consultaFixture.refetch()}
            />
          )}

          {fechas && !tieneFixture && (
            <div className="aviso aviso--columna" role="status">
              <p>Este torneo todavía no tiene fixture.</p>
              {enInscripcion && cantidadEquipos >= 2 && (
                <p>
                  Hay {cantidadEquipos} equipos inscriptos. Con "Generar
                  fixture" se arman todas las fechas y se cierran las
                  inscripciones.
                </p>
              )}
              {enInscripcion && cantidadEquipos < 2 && (
                <p>
                  Se necesitan al menos 2 equipos inscriptos (hay{' '}
                  {cantidadEquipos}).{' '}
                  <Link to={`/inscripciones?torneo=${torneo.id}`}>
                    Inscribir equipos
                  </Link>
                </p>
              )}
            </div>
          )}

          {tieneFixture && (
            <div className="grilla-fechas">
              {fechas.map((fecha) => (
                <TarjetaFecha key={fecha.id} fecha={fecha} />
              ))}
            </div>
          )}
        </>
      )}

      {generando && (
        <Dialogo
          titulo={`Generar el fixture de ${torneo?.nombre}`}
          onCerrar={() => setGenerando(false)}
        >
          <FormularioGenerarFixture
            cantidadEquipos={cantidadEquipos}
            onGuardar={confirmarGeneracion}
            onCancelar={() => setGenerando(false)}
          />
        </Dialogo>
      )}

      {confirmandoDeshacer && (
        <DialogoConfirmacion
          titulo="Deshacer el fixture"
          mensaje={`¿Borrar todas las fechas y partidos de ${torneo?.nombre}? El torneo vuelve a inscripción. Solo se puede si todavía no se jugó ningún partido.`}
          textoConfirmar="Deshacer"
          procesando={deshacer.isPending}
          onConfirmar={confirmarDeshacer}
          onCancelar={() => setConfirmandoDeshacer(false)}
        />
      )}
    </>
  );
}
