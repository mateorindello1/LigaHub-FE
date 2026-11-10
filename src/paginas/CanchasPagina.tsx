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
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { FormularioCancha } from '../componentes/predios/FormularioCancha';
import { IDIOMA } from '../config/textos-syncfusion';
import {
  useBorrarCancha,
  useCrearCancha,
  useModificarCancha,
  usePredio,
} from '../hooks/predios.hooks';
import type { Cancha } from '../modelos/predio';
import type { DatosFormularioCancha } from '../validaciones/predio.validacion';
import { NoEncontradaPagina } from './NoEncontradaPagina';

/**
 * Canchas de un predio (/predios/:predioId): CRUD dependiente del predio, solo para el
 * Administrador. La ruta cuelga de /predios para que el menú marque esa opción.
 */
export function CanchasPagina() {
  const predioId = Number(useParams().predioId);
  // Con un id inválido no se muestra la pantalla; los hooks van en un componente aparte.
  if (!Number.isInteger(predioId) || predioId <= 0) {
    return <NoEncontradaPagina />;
  }
  return <Canchas predioId={predioId} />;
}

/** Formulario abierto: sin cancha es un alta; con cancha, una modificación. */
interface Edicion {
  cancha?: Cancha;
}

/** Contenido de la pantalla, con el id del predio ya validado. */
function Canchas({ predioId }: { predioId: number }) {
  // #region Estado
  const { data: predio, isPending, error, refetch } = usePredio(predioId);
  const crear = useCrearCancha(predioId);
  const modificar = useModificarCancha(predioId);
  const borrar = useBorrarCancha(predioId);
  const notificaciones = useNotificaciones();

  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [aBorrar, setABorrar] = useState<Cancha | null>(null);

  // Número sugerido para una cancha nueva: el siguiente al mayor.
  const numeroSugerido =
    Math.max(0, ...(predio?.canchas.map((c) => c.numero) ?? [])) + 1;
  // #endregion

  // #region Acciones
  async function guardar(datos: DatosFormularioCancha) {
    if (edicion?.cancha) {
      await modificar.mutateAsync({ id: edicion.cancha.id, datos });
      notificaciones.exito(`Se modificó la cancha ${datos.numero}.`);
    } else {
      await crear.mutateAsync(datos);
      notificaciones.exito(`Se creó la cancha ${datos.numero}.`);
    }
    setEdicion(null);
  }

  function confirmarBorrado() {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () =>
        notificaciones.exito(`Se borró la cancha ${aBorrar.numero}.`),
      onError: (errorBorrado) => notificaciones.error(errorBorrado),
      onSettled: () => setABorrar(null),
    });
  }
  // #endregion

  const plantillaAcciones = useCallback(
    (cancha: Cancha) => (
      <AccionesFila
        descripcion={`la cancha ${cancha.numero}`}
        onModificar={() => setEdicion({ cancha })}
        onBorrar={() => setABorrar(cancha)}
      />
    ),
    [],
  );

  const volver = (
    <Link className="enlace-volver" to="/predios">
      <span className="e-icons e-chevron-left" aria-hidden="true" />
      Volver a los predios
    </Link>
  );

  if (isPending) return <Cargando texto="Cargando el predio…" />;
  if (error) {
    // Un 404 (el predio no existe) no se arregla reintentando.
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
      <EncabezadoPagina
        titulo={`Canchas de ${predio.nombre}`}
        descripcion={predio.direccion}
        acciones={
          <ButtonComponent
            isPrimary
            iconCss="e-icons e-plus"
            onClick={() => setEdicion({})}
          >
            Nueva cancha
          </ButtonComponent>
        }
      />

      <div className="detalle-equipo__jugadores">
        <p className="resumen">
          {predio.canchas.length === 1
            ? '1 cancha'
            : `${predio.canchas.length} canchas`}
        </p>
        <GridComponent
          dataSource={predio.canchas}
          locale={IDIOMA}
          allowSorting
          enableHover={false}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="numero"
              headerText="N°"
              width={70}
              textAlign="Center"
            />
            <ColumnDirective
              field="descripcion"
              headerText="Descripción"
              clipMode="EllipsisWithTooltip"
            />
            <ColumnDirective
              headerText="Acciones"
              width={110}
              textAlign="Right"
              template={plantillaAcciones}
            />
          </ColumnsDirective>
          <Inject services={[Sort]} />
        </GridComponent>
      </div>

      {edicion && (
        <Dialogo
          titulo={
            edicion.cancha
              ? `Modificar la cancha ${edicion.cancha.numero}`
              : `Nueva cancha en ${predio.nombre}`
          }
          onCerrar={() => setEdicion(null)}
        >
          <FormularioCancha
            cancha={edicion.cancha}
            numeroSugerido={numeroSugerido}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        </Dialogo>
      )}

      {aBorrar && (
        <DialogoConfirmacion
          titulo="Borrar cancha"
          mensaje={`¿Borrar la cancha ${aBorrar.numero} de ${predio.nombre}? Solo se puede si no tiene partidos asignados.`}
          procesando={borrar.isPending}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}
    </>
  );
}
