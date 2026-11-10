import { useCallback, useState } from 'react';
import { Link } from 'react-router';
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
import { FormularioPredio } from '../componentes/predios/FormularioPredio';
import { IDIOMA } from '../config/textos-syncfusion';
import {
  useBorrarPredio,
  useCrearPredio,
  useModificarPredio,
  usePredios,
} from '../hooks/predios.hooks';
import type { Predio } from '../modelos/predio';
import type { DatosFormularioPredio } from '../validaciones/predio.validacion';

/** Formulario abierto: sin predio es un alta; con predio, una modificación. */
interface Edicion {
  predio?: Predio;
}

/** La columna de dirección se muestra desde MD (768 px). */
const DESDE_MD = '(min-width: 768px)';

/**
 * ABM de predios (solo el Administrador). El nombre de cada predio lleva a sus canchas
 * (CanchasPagina), igual que un equipo inscripto lleva a su plantel.
 */
export function PrediosPagina() {
  // #region Estado
  const { data: predios, isPending, error, refetch } = usePredios();
  const crear = useCrearPredio();
  const modificar = useModificarPredio();
  const borrar = useBorrarPredio();
  const notificaciones = useNotificaciones();

  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [aBorrar, setABorrar] = useState<Predio | null>(null);
  // #endregion

  // #region Acciones
  async function guardar(datos: DatosFormularioPredio) {
    if (edicion?.predio) {
      await modificar.mutateAsync({ id: edicion.predio.id, datos });
      notificaciones.exito(`Se modificó el predio "${datos.nombre}".`);
    } else {
      await crear.mutateAsync(datos);
      notificaciones.exito(`Se creó el predio "${datos.nombre}".`);
    }
    setEdicion(null);
  }

  function confirmarBorrado() {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () =>
        notificaciones.exito(`Se borró el predio "${aBorrar.nombre}".`),
      onError: (errorBorrado) => notificaciones.error(errorBorrado),
      onSettled: () => setABorrar(null),
    });
  }
  // #endregion

  // #region Plantillas de columnas
  const plantillaPredio = useCallback(
    (predio: Predio) => (
      <div className="celda-doble">
        <Link
          className="enlace-equipo"
          to={`/predios/${predio.id}`}
          title={`Ver las canchas de ${predio.nombre}`}
        >
          <span>{predio.nombre}</span>
        </Link>
        {/* En SM no hay columna de dirección: se muestra debajo del nombre. */}
        <span className="celda-doble__secundario solo-sm">
          {predio.direccion}
        </span>
      </div>
    ),
    [],
  );
  const plantillaCanchas = useCallback(
    (predio: Predio) =>
      predio.canchas.length === 1
        ? '1 cancha'
        : `${predio.canchas.length} canchas`,
    [],
  );
  const plantillaAcciones = useCallback(
    (predio: Predio) => (
      <AccionesFila
        descripcion={predio.nombre}
        onModificar={() => setEdicion({ predio })}
        onBorrar={() => setABorrar(predio)}
      />
    ),
    [],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Predios"
        descripcion="Lugares donde se juegan los partidos. Elegí un predio para ver y cargar sus canchas."
        acciones={
          <ButtonComponent
            isPrimary
            iconCss="e-icons e-plus"
            onClick={() => setEdicion({})}
          >
            Nuevo predio
          </ButtonComponent>
        }
      />

      {isPending && <Cargando texto="Cargando predios…" />}
      {error && <MensajeError error={error} onReintentar={() => refetch()} />}

      {predios && (
        <GridComponent
          dataSource={predios}
          locale={IDIOMA}
          allowSorting
          allowPaging
          pageSettings={{ pageSize: 10 }}
          enableHover={false}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="nombre"
              headerText="Predio"
              template={plantillaPredio}
            />
            <ColumnDirective
              field="direccion"
              headerText="Dirección"
              hideAtMedia={DESDE_MD}
            />
            <ColumnDirective
              headerText="Canchas"
              width={100}
              template={plantillaCanchas}
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
          titulo={edicion.predio ? 'Modificar predio' : 'Nuevo predio'}
          onCerrar={() => setEdicion(null)}
        >
          <FormularioPredio
            predio={edicion.predio}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        </Dialogo>
      )}

      {aBorrar && (
        <DialogoConfirmacion
          titulo="Borrar predio"
          mensaje={`¿Borrar el predio "${aBorrar.nombre}"? Solo se puede si no tiene canchas. No se puede deshacer.`}
          procesando={borrar.isPending}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}
    </>
  );
}
