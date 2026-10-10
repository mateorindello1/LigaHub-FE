import { useCallback, useMemo, useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Page,
  Sort,
} from '@syncfusion/ej2-react-grids';
import { AccionesFila } from '../componentes/comunes/AccionesFila';
import { Cargando } from '../componentes/comunes/Cargando';
import { Dialogo } from '../componentes/comunes/Dialogo';
import { DialogoConfirmacion } from '../componentes/comunes/DialogoConfirmacion';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { EscudoEquipo } from '../componentes/equipos/EscudoEquipo';
import { FormularioInscripcion } from '../componentes/inscripciones/FormularioInscripcion';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { SelectorTorneo } from '../componentes/torneos/SelectorTorneo';
import { IDIOMA } from '../config/textos-syncfusion';
import { useEquipos } from '../hooks/equipos.hooks';
import {
  useBorrarInscripcion,
  useInscribirEquipo,
  useInscripciones,
  useModificarInscripcion,
} from '../hooks/inscripciones-equipo.hooks';
import { useTorneoSeleccionado } from '../hooks/torneo-seleccionado.hook';
import { useTorneos } from '../hooks/torneos.hooks';
import { EstadoTorneo } from '../modelos/estados';
import type { InscripcionEquipo } from '../modelos/inscripcion-equipo';
import type { DatosFormularioInscripcion } from '../validaciones/inscripcion-equipo.validacion';

/** Formulario abierto: sin inscripción es un alta; con inscripción, un cambio de equipo. */
interface Edicion {
  inscripcion?: InscripcionEquipo;
}

/**
 * CRUD dependiente: equipos inscriptos en un torneo. Primero se elige el torneo (filtro) y
 * después se inscriben, cambian o dan de baja equipos de ese torneo.
 */
export function InscripcionesPagina() {
  // #region Estado
  const consultaTorneos = useTorneos();
  // Por defecto, el primer torneo con las inscripciones abiertas.
  const { torneo, seleccionar } = useTorneoSeleccionado(
    consultaTorneos.data,
    (t) => t.estadoTorneo === EstadoTorneo.Inscripcion,
  );
  const torneoId = torneo?.id ?? null;

  const consultaInscripciones = useInscripciones(torneoId);
  const { data: equipos } = useEquipos();

  // Los hooks no se pueden llamar dentro de un if: con torneoId null reciben 0, pero en ese
  // caso no se muestran los botones que los usan.
  const inscribir = useInscribirEquipo(torneoId ?? 0);
  const modificar = useModificarInscripcion(torneoId ?? 0);
  const borrar = useBorrarInscripcion(torneoId ?? 0);
  const notificaciones = useNotificaciones();

  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [aBorrar, setABorrar] = useState<InscripcionEquipo | null>(null);

  // Las inscripciones solo se modifican con el torneo en estado Inscripción (el backend también lo controla).
  const abiertas = torneo?.estadoTorneo === EstadoTorneo.Inscripcion;
  const inscripciones = consultaInscripciones.data;

  /**
   * Equipos que se pueden elegir en el formulario: los no inscriptos. Al cambiar el equipo de
   * una inscripción, también el que tiene ahora (para que aparezca elegido).
   * useMemo: la lista desplegable recibe el mismo arreglo mientras no cambien los datos
   * (si recibiera uno nuevo en cada dibujo, se recargaría mientras el usuario elige).
   */
  const equiposDisponibles = useMemo(() => {
    const inscriptos = new Set(inscripciones?.map((i) => i.equipoId));
    const actual = edicion?.inscripcion?.equipoId;
    return (equipos ?? []).filter(
      (e) => !inscriptos.has(e.id) || e.id === actual,
    );
  }, [equipos, inscripciones, edicion]);
  // #endregion

  // #region Acciones

  /** Nombre de un equipo a partir de su id, para los avisos. */
  function nombreEquipo(equipoId: number) {
    return equipos?.find((e) => e.id === equipoId)?.nombre ?? 'El equipo';
  }

  async function guardar(datos: DatosFormularioInscripcion) {
    if (edicion?.inscripcion) {
      await modificar.mutateAsync({ id: edicion.inscripcion.id, datos });
      notificaciones.exito(
        `Se cambió la inscripción a "${nombreEquipo(datos.equipoId)}".`,
      );
    } else {
      await inscribir.mutateAsync(datos);
      notificaciones.exito(
        `"${nombreEquipo(datos.equipoId)}" quedó inscripto en ${torneo?.nombre}.`,
      );
    }
    setEdicion(null);
  }

  function confirmarBaja() {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () =>
        notificaciones.exito(
          `Se dio de baja la inscripción de "${aBorrar.equipo.nombre}".`,
        ),
      onError: (errorBaja) => notificaciones.error(errorBaja),
      onSettled: () => setABorrar(null),
    });
  }
  // #endregion

  // #region Plantillas de columnas
  const plantillaEquipo = useCallback(
    (inscripcion: InscripcionEquipo) => (
      <div className="celda-equipo">
        <EscudoEquipo
          nombre={inscripcion.equipo.nombre}
          escudoURL={inscripcion.equipo.escudoURL}
        />
        <span>{inscripcion.equipo.nombre}</span>
      </div>
    ),
    [],
  );
  const plantillaAcciones = useCallback(
    (inscripcion: InscripcionEquipo) => (
      <AccionesFila
        descripcion={inscripcion.equipo.nombre}
        onModificar={() => setEdicion({ inscripcion })}
        onBorrar={() => setABorrar(inscripcion)}
      />
    ),
    [],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Inscripciones"
        descripcion="Equipos inscriptos en cada torneo."
        acciones={
          <ButtonComponent
            isPrimary
            iconCss="e-icons e-plus"
            disabled={!abiertas}
            onClick={() => setEdicion({})}
          >
            Inscribir equipo
          </ButtonComponent>
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

          {!abiertas && (
            <p className="aviso" role="status">
              <span className="e-icons e-lock" aria-hidden="true" />
              Las inscripciones de este torneo están cerradas: solo se pueden
              consultar.
            </p>
          )}

          {consultaInscripciones.isLoading && (
            <Cargando texto="Cargando inscripciones…" />
          )}
          {consultaInscripciones.error && (
            <MensajeError
              error={consultaInscripciones.error}
              onReintentar={() => consultaInscripciones.refetch()}
            />
          )}

          {inscripciones && (
            <>
              <p className="resumen">
                {inscripciones.length === 1
                  ? '1 equipo inscripto'
                  : `${inscripciones.length} equipos inscriptos`}
              </p>
              <GridComponent
                // key: al cambiar de torneo la grilla se crea de nuevo, con las columnas que
                // correspondan (sin acciones si las inscripciones están cerradas).
                key={`${torneo.id}-${abiertas}`}
                dataSource={inscripciones}
                locale={IDIOMA}
                allowSorting
                allowPaging
                pageSettings={{ pageSize: 10 }}
                enableHover={false}
              >
                <ColumnsDirective>
                  <ColumnDirective
                    field="equipo.nombre"
                    headerText="Equipo"
                    template={plantillaEquipo}
                  />
                  {abiertas && (
                    <ColumnDirective
                      headerText="Acciones"
                      width={110}
                      textAlign="Right"
                      template={plantillaAcciones}
                    />
                  )}
                </ColumnsDirective>
                <Inject services={[Sort, Page]} />
              </GridComponent>
            </>
          )}
        </>
      )}

      {edicion && (
        <Dialogo
          titulo={
            edicion.inscripcion
              ? 'Cambiar el equipo inscripto'
              : `Inscribir equipo en ${torneo?.nombre}`
          }
          onCerrar={() => setEdicion(null)}
        >
          <FormularioInscripcion
            equipos={equiposDisponibles}
            inscripcion={edicion.inscripcion}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        </Dialogo>
      )}

      {aBorrar && (
        <DialogoConfirmacion
          titulo="Dar de baja la inscripción"
          mensaje={`¿Dar de baja a "${aBorrar.equipo.nombre}" de ${torneo?.nombre}?`}
          textoConfirmar="Dar de baja"
          procesando={borrar.isPending}
          onConfirmar={confirmarBaja}
          onCancelar={() => setABorrar(null)}
        />
      )}
    </>
  );
}
