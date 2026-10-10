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
import { EscudoEquipo } from '../componentes/equipos/EscudoEquipo';
import { FormularioEquipo } from '../componentes/equipos/FormularioEquipo';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { IDIOMA } from '../config/textos-syncfusion';
import {
  useBorrarEquipo,
  useCrearEquipo,
  useEquipos,
  useModificarEquipo,
} from '../hooks/equipos.hooks';
import type { Equipo } from '../modelos/equipo';
import type { DatosFormularioEquipo } from '../validaciones/equipo.validacion';

/** Formulario abierto: sin equipo es un alta; con equipo, una modificación. */
interface Edicion {
  equipo?: Equipo;
}

/** ABM de equipos: grilla con alta, modificación y baja en ventanas modales. */
export function EquiposPagina() {
  // #region Estado
  const { data: equipos, isPending, error, refetch } = useEquipos();
  const crear = useCrearEquipo();
  const modificar = useModificarEquipo();
  const borrar = useBorrarEquipo();
  const notificaciones = useNotificaciones();

  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [aBorrar, setABorrar] = useState<Equipo | null>(null);
  // #endregion

  // #region Acciones
  async function guardar(datos: DatosFormularioEquipo) {
    // En el formulario, sin escudo es un texto vacío; la API espera null.
    const cuerpo = { nombre: datos.nombre, escudoURL: datos.escudoURL || null };

    if (edicion?.equipo) {
      await modificar.mutateAsync({ id: edicion.equipo.id, datos: cuerpo });
      notificaciones.exito(`Se modificó el equipo "${datos.nombre}".`);
    } else {
      await crear.mutateAsync(cuerpo);
      notificaciones.exito(`Se creó el equipo "${datos.nombre}".`);
    }
    setEdicion(null);
  }

  function confirmarBorrado() {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () =>
        notificaciones.exito(`Se borró el equipo "${aBorrar.nombre}".`),
      onError: (errorBorrado) => notificaciones.error(errorBorrado),
      onSettled: () => setABorrar(null),
    });
  }
  // #endregion

  // #region Plantillas de columnas
  const plantillaEquipo = useCallback(
    (equipo: Equipo) => (
      <div className="celda-equipo">
        <EscudoEquipo nombre={equipo.nombre} escudoURL={equipo.escudoURL} />
        <span>{equipo.nombre}</span>
      </div>
    ),
    [],
  );
  const plantillaAcciones = useCallback(
    (equipo: Equipo) => (
      <AccionesFila
        descripcion={equipo.nombre}
        onModificar={() => setEdicion({ equipo })}
        onBorrar={() => setABorrar(equipo)}
      />
    ),
    [],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Equipos"
        descripcion="Alta, modificación y baja de equipos."
        acciones={
          <ButtonComponent
            isPrimary
            iconCss="e-icons e-plus"
            onClick={() => setEdicion({})}
          >
            Nuevo equipo
          </ButtonComponent>
        }
      />

      {isPending && <Cargando texto="Cargando equipos…" />}
      {error && <MensajeError error={error} onReintentar={() => refetch()} />}

      {equipos && (
        <GridComponent
          dataSource={equipos}
          locale={IDIOMA}
          allowSorting
          allowPaging
          pageSettings={{ pageSize: 10 }}
          enableHover={false}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="nombre"
              headerText="Equipo"
              template={plantillaEquipo}
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
          titulo={edicion.equipo ? 'Modificar equipo' : 'Nuevo equipo'}
          onCerrar={() => setEdicion(null)}
        >
          <FormularioEquipo
            equipo={edicion.equipo}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        </Dialogo>
      )}

      {aBorrar && (
        <DialogoConfirmacion
          titulo="Borrar equipo"
          mensaje={`¿Borrar el equipo "${aBorrar.nombre}"? No se puede deshacer.`}
          procesando={borrar.isPending}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}
    </>
  );
}
