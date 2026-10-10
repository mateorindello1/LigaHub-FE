import { useCallback, useState } from 'react';
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
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { BadgeEstadoTorneo } from '../componentes/torneos/BadgeEstadoTorneo';
import { FormularioTorneo } from '../componentes/torneos/FormularioTorneo';
import { IDIOMA } from '../config/textos-syncfusion';
import {
  useBorrarTorneo,
  useCrearTorneo,
  useModificarTorneo,
  useTorneos,
} from '../hooks/torneos.hooks';
import type { Torneo } from '../modelos/torneo';
import type { DatosFormularioTorneo } from '../validaciones/torneo.validacion';

/** Formulario abierto: sin torneo es un alta; con torneo, una modificación. */
interface Edicion {
  torneo?: Torneo;
}

/** ABM de torneos: grilla con alta, modificación y baja en ventanas modales. */
export function TorneosPagina() {
  // #region Estado
  const { data: torneos, isPending, error, refetch } = useTorneos();
  const crear = useCrearTorneo();
  const modificar = useModificarTorneo();
  const borrar = useBorrarTorneo();
  const notificaciones = useNotificaciones();

  // null: formulario cerrado.
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  // Torneo a borrar mientras se pide la confirmación.
  const [aBorrar, setABorrar] = useState<Torneo | null>(null);
  // #endregion

  // #region Acciones
  /** Guarda el formulario. Si falla, el error vuelve al formulario y el diálogo queda abierto. */
  async function guardar(datos: DatosFormularioTorneo) {
    if (edicion?.torneo) {
      await modificar.mutateAsync({ id: edicion.torneo.id, datos });
      notificaciones.exito(`Se modificó el torneo "${datos.nombre}".`);
    } else {
      await crear.mutateAsync(datos);
      notificaciones.exito(`Se creó el torneo "${datos.nombre}".`);
    }
    setEdicion(null);
  }

  /** Borra el torneo confirmado. Si el backend lo rechaza (por ejemplo, tiene equipos), avisa. */
  function confirmarBorrado() {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () =>
        notificaciones.exito(`Se borró el torneo "${aBorrar.nombre}".`),
      onError: (errorBorrado) => notificaciones.error(errorBorrado),
      onSettled: () => setABorrar(null),
    });
  }
  // #endregion

  // #region Plantillas de columnas
  // useCallback mantiene la misma función entre renders: si cambiara, la grilla redibujaría
  // las columnas cada vez. Los setters de useState no cambian, así que no hay dependencias.
  const plantillaNombre = useCallback(
    (torneo: Torneo) => (
      <div className="celda-torneo">
        <span>{torneo.nombre}</span>
        {/* En celular no está la columna Estado: el badge va debajo del nombre. */}
        <span className="solo-sm">
          <BadgeEstadoTorneo estado={torneo.estadoTorneo} />
        </span>
      </div>
    ),
    [],
  );
  const plantillaEstado = useCallback(
    (torneo: Torneo) => <BadgeEstadoTorneo estado={torneo.estadoTorneo} />,
    [],
  );
  const plantillaAcciones = useCallback(
    (torneo: Torneo) => (
      <AccionesFila
        descripcion={torneo.nombre}
        onModificar={() => setEdicion({ torneo })}
        onBorrar={() => setABorrar(torneo)}
      />
    ),
    [],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Torneos"
        descripcion="Alta, modificación y baja de torneos."
        acciones={
          <ButtonComponent
            isPrimary
            iconCss="e-icons e-plus"
            onClick={() => setEdicion({})}
          >
            Nuevo torneo
          </ButtonComponent>
        }
      />

      {isPending && <Cargando texto="Cargando torneos…" />}
      {error && <MensajeError error={error} onReintentar={() => refetch()} />}

      {torneos && (
        <GridComponent
          dataSource={torneos}
          locale={IDIOMA}
          allowSorting
          allowPaging
          pageSettings={{ pageSize: 10 }}
          enableHover={false}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="nombre"
              headerText="Nombre"
              template={plantillaNombre}
            />
            <ColumnDirective
              field="anio"
              headerText="Año"
              width={90}
              textAlign="Right"
              // Columna oculta en celular: solo se muestra desde MD.
              hideAtMedia="(min-width: 768px)"
            />
            <ColumnDirective
              field="estadoTorneo"
              headerText="Estado"
              width={170}
              template={plantillaEstado}
              hideAtMedia="(min-width: 768px)"
            />
            <ColumnDirective
              headerText="Acciones"
              width={110}
              textAlign="Right"
              template={plantillaAcciones}
            />
          </ColumnsDirective>
          <Inject services={[Sort, Page]} />
        </GridComponent>
      )}

      {edicion && (
        <Dialogo
          titulo={edicion.torneo ? 'Modificar torneo' : 'Nuevo torneo'}
          onCerrar={() => setEdicion(null)}
        >
          <FormularioTorneo
            torneo={edicion.torneo}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        </Dialogo>
      )}

      {aBorrar && (
        <DialogoConfirmacion
          titulo="Borrar torneo"
          mensaje={`¿Borrar el torneo "${aBorrar.nombre} ${aBorrar.anio}"? No se puede deshacer.`}
          procesando={borrar.isPending}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}
    </>
  );
}
