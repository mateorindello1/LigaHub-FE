import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Sort,
} from '@syncfusion/ej2-react-grids';
import { ErrorApi } from '../api/error-api';
import { AccionesFila } from '../componentes/comunes/AccionesFila';
import { Cargando } from '../componentes/comunes/Cargando';
import { Dialogo } from '../componentes/comunes/Dialogo';
import { DialogoConfirmacion } from '../componentes/comunes/DialogoConfirmacion';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { EscudoEquipo } from '../componentes/equipos/EscudoEquipo';
import { FormularioInscripcionJugador } from '../componentes/inscripciones/FormularioInscripcionJugador';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { useSesion } from '../componentes/sesion/contexto-sesion';
import { BadgeEstadoTorneo } from '../componentes/torneos/BadgeEstadoTorneo';
import { IDIOMA } from '../config/textos-syncfusion';
import {
  useBorrarInscripcionJugador,
  useInscribirJugador,
  useInscripcionEquipo,
  useModificarInscripcionJugador,
  usePlantel,
} from '../hooks/inscripciones-jugador.hooks';
import { useJugadoresDisponibles } from '../hooks/jugadores.hooks';
import { useTorneos } from '../hooks/torneos.hooks';
import { EstadoTorneo } from '../modelos/estados';
import type { InscripcionJugador } from '../modelos/inscripcion-jugador';
import { nombreJugador } from '../modelos/jugador';
import { Rol } from '../modelos/sesion';
import type { DatosFormularioInscripcionJugador } from '../validaciones/inscripcion-jugador.validacion';
import { IrAlInicio } from '../componentes/comunes/IrAlInicio';

/** Formato de los UUID que genera la base para las inscripciones. */
const PATRON_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Plantel de un equipo en un torneo (/inscripciones/:torneoId/:inscripcionId): CRUD dependiente de
 * la inscripción del equipo. Todos pueden consultarlo; el Administrador inscribe jugadores, cambia
 * dorsales y capitán, y da de baja, mientras el torneo no esté finalizado.
 * La ruta cuelga de /inscripciones para que el menú marque esa opción.
 */
export function PlantelPagina() {
  const parametros = useParams();
  const torneoId = Number(parametros.torneoId);
  const inscripcionId = parametros.inscripcionId ?? '';
  const idsValidos =
    Number.isInteger(torneoId) &&
    torneoId > 0 &&
    PATRON_UUID.test(inscripcionId);

  // Igual que en el detalle del equipo: los hooks van en un componente aparte, con los ids válidos.
  if (!idsValidos) return <IrAlInicio />;
  return <Plantel torneoId={torneoId} inscripcionId={inscripcionId} />;
}

interface Props {
  torneoId: number;
  inscripcionId: string;
}

/** Formulario abierto: sin inscripción es un alta; con inscripción, un cambio de dorsal o capitanía. */
interface Edicion {
  inscripcion?: InscripcionJugador;
}

/** Contenido del plantel, con los ids ya validados. */
function Plantel({ torneoId, inscripcionId }: Props) {
  // #region Estado
  const torneo = useTorneos().data?.find((t) => t.id === torneoId);
  const consultaInscripcion = useInscripcionEquipo(torneoId, inscripcionId);
  const consultaPlantel = usePlantel(torneoId, inscripcionId);
  const plantel = consultaPlantel.data;

  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [aBorrar, setABorrar] = useState<InscripcionJugador | null>(null);

  // Los jugadores disponibles se piden recién al abrir el formulario de alta.
  const esAlta = edicion !== null && !edicion.inscripcion;
  const { data: disponibles } = useJugadoresDisponibles(torneoId, esAlta);

  const inscribir = useInscribirJugador(torneoId, inscripcionId);
  const modificar = useModificarInscripcionJugador(torneoId, inscripcionId);
  const borrar = useBorrarInscripcionJugador(torneoId, inscripcionId);
  const notificaciones = useNotificaciones();

  // El plantel se modifica mientras el torneo no esté finalizado (también en curso: un equipo
  // puede sumar jugadores). Solo lo modifica el Administrador; el backend controla las dos cosas.
  const finalizado = torneo?.estadoTorneo === EstadoTorneo.Finalizado;
  const esAdministrador = useSesion().tieneRol(Rol.Administrador);
  const editable = esAdministrador && torneo !== undefined && !finalizado;
  const capitan = plantel?.find((i) => i.capitan);
  // #endregion

  // #region Acciones
  async function guardar(datos: DatosFormularioInscripcionJugador) {
    if (edicion?.inscripcion) {
      await modificar.mutateAsync({
        id: edicion.inscripcion.id,
        datos: { dorsal: datos.dorsal, capitan: datos.capitan },
      });
      notificaciones.exito(
        `Se modificó la inscripción de "${nombreJugador(edicion.inscripcion.jugador)}".`,
      );
    } else {
      const creada = await inscribir.mutateAsync(datos);
      notificaciones.exito(
        `"${nombreJugador(creada.jugador)}" quedó inscripto con el ${creada.dorsal}.`,
      );
    }
    setEdicion(null);
  }

  function confirmarBaja() {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () =>
        notificaciones.exito(
          `Se dio de baja a "${nombreJugador(aBorrar.jugador)}" del equipo.`,
        ),
      onError: (errorBaja) => notificaciones.error(errorBaja),
      onSettled: () => setABorrar(null),
    });
  }
  // #endregion

  // #region Plantillas de columnas
  const plantillaJugador = useCallback(
    (inscripcion: InscripcionJugador) => (
      <span className="celda-jugador">
        {nombreJugador(inscripcion.jugador)}
        {inscripcion.capitan && (
          <span className="e-badge e-badge-primary" title="Capitán">
            C
          </span>
        )}
      </span>
    ),
    [],
  );
  const plantillaAcciones = useCallback(
    (inscripcion: InscripcionJugador) => (
      <AccionesFila
        descripcion={nombreJugador(inscripcion.jugador)}
        onModificar={() => setEdicion({ inscripcion })}
        onBorrar={() => setABorrar(inscripcion)}
      />
    ),
    [],
  );
  // #endregion

  const volver = (
    <Link className="enlace-volver" to={`/inscripciones?torneo=${torneoId}`}>
      <span className="e-icons e-chevron-left" aria-hidden="true" />
      Volver a las inscripciones
    </Link>
  );

  if (consultaInscripcion.isPending) {
    return <Cargando texto="Cargando el plantel…" />;
  }
  if (consultaInscripcion.error) {
    // Un 404 (la inscripción no existe en ese torneo) no muestra error: lleva al inicio, para no
    // confirmar qué ids existen.
    const error = consultaInscripcion.error;
    if (error instanceof ErrorApi && error.esErrorDelCliente) {
      return <IrAlInicio />;
    }
    return (
      <>
        {volver}
        <MensajeError
          error={error}
          onReintentar={() => consultaInscripcion.refetch()}
        />
      </>
    );
  }

  const { equipo } = consultaInscripcion.data;

  return (
    <>
      {volver}

      <title>{`Plantel de ${equipo.nombre} · LigaHub`}</title>
      <header className="encabezado-pagina">
        <div className="encabezado-equipo">
          <EscudoEquipo
            nombre={equipo.nombre}
            escudoURL={equipo.escudoURL}
            tamanio={56}
          />
          <div>
            <h1>Plantel de {equipo.nombre}</h1>
            {torneo && (
              <p className="encabezado-equipo__torneo">
                {torneo.nombre} {torneo.anio}{' '}
                <BadgeEstadoTorneo estado={torneo.estadoTorneo} />
              </p>
            )}
          </div>
        </div>
        {esAdministrador && (
          <div className="encabezado-pagina__acciones">
            <ButtonComponent
              isPrimary
              iconCss="e-icons e-plus"
              disabled={!editable}
              onClick={() => setEdicion({})}
            >
              Inscribir jugador
            </ButtonComponent>
          </div>
        )}
      </header>

      {finalizado && (
        <p className="aviso" role="status">
          <span className="e-icons e-lock" aria-hidden="true" />
          El torneo está finalizado: el plantel solo se puede consultar.
        </p>
      )}

      {consultaPlantel.isPending && <Cargando texto="Cargando jugadores…" />}
      {consultaPlantel.error && (
        <MensajeError
          error={consultaPlantel.error}
          onReintentar={() => consultaPlantel.refetch()}
        />
      )}

      {plantel && (
        <div className="detalle-equipo__jugadores">
          <p className="resumen">
            {plantel.length === 1
              ? '1 jugador inscripto'
              : `${plantel.length} jugadores inscriptos`}
            {capitan && ` · Capitán: ${nombreJugador(capitan.jugador)}`}
          </p>
          <GridComponent
            // key: al cambiar la sesión la grilla se crea de nuevo, con o sin la columna de acciones.
            key={String(editable)}
            dataSource={plantel}
            locale={IDIOMA}
            allowSorting
            enableHover={false}
          >
            <ColumnsDirective>
              <ColumnDirective
                field="dorsal"
                headerText="N°"
                width={70}
                textAlign="Center"
              />
              <ColumnDirective
                field="jugador.apellidos"
                headerText="Jugador"
                template={plantillaJugador}
              />
              {editable && (
                <ColumnDirective
                  headerText="Acciones"
                  width={110}
                  textAlign="Right"
                  template={plantillaAcciones}
                />
              )}
            </ColumnsDirective>
            <Inject services={[Sort]} />
          </GridComponent>
          {capitan && <p className="referencias">C: capitán.</p>}
        </div>
      )}

      {edicion && (
        <Dialogo
          titulo={
            edicion.inscripcion
              ? 'Modificar la inscripción'
              : `Inscribir jugador en ${equipo.nombre}`
          }
          onCerrar={() => setEdicion(null)}
        >
          <FormularioInscripcionJugador
            jugadores={disponibles}
            inscripcion={edicion.inscripcion}
            capitanActual={capitan && nombreJugador(capitan.jugador)}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        </Dialogo>
      )}

      {aBorrar && (
        <DialogoConfirmacion
          titulo="Dar de baja del equipo"
          mensaje={`¿Dar de baja a "${nombreJugador(aBorrar.jugador)}" del plantel de ${equipo.nombre}?`}
          textoConfirmar="Dar de baja"
          procesando={borrar.isPending}
          onConfirmar={confirmarBaja}
          onCancelar={() => setABorrar(null)}
        />
      )}
    </>
  );
}
