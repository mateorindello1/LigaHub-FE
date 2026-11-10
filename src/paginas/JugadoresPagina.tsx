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
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { AccionesFila } from '../componentes/comunes/AccionesFila';
import { Cargando } from '../componentes/comunes/Cargando';
import { Dialogo } from '../componentes/comunes/Dialogo';
import { DialogoConfirmacion } from '../componentes/comunes/DialogoConfirmacion';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { FormularioJugador } from '../componentes/jugadores/FormularioJugador';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { IDIOMA } from '../config/textos-syncfusion';
import {
  useBorrarJugador,
  useCrearJugador,
  useJugadores,
  useModificarJugador,
} from '../hooks/jugadores.hooks';
import { nombreJugador, type Jugador } from '../modelos/jugador';
import { normalizarParaBuscar } from '../utilidades/formato';
import type { DatosFormularioJugador } from '../validaciones/jugador.validacion';

/** Formulario abierto: sin jugador es un alta; con jugador, una modificación. */
interface Edicion {
  jugador?: Jugador;
}

/** La columna del DNI se muestra desde MD (768 px) y la de contacto desde LG (992 px). */
const DESDE_MD = '(min-width: 768px)';
const DESDE_LG = '(min-width: 992px)';

/**
 * ABM de jugadores (solo el Administrador): grilla con buscador, alta, modificación y baja en
 * ventanas modales. Los jugadores se inscriben en los equipos desde el plantel de cada inscripción.
 */
export function JugadoresPagina() {
  // #region Estado
  const { data: jugadores, isPending, error, refetch } = useJugadores();
  const crear = useCrearJugador();
  const modificar = useModificarJugador();
  const borrar = useBorrarJugador();
  const notificaciones = useNotificaciones();

  const [busqueda, setBusqueda] = useState('');
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [aBorrar, setABorrar] = useState<Jugador | null>(null);

  /** Jugadores cuyo nombre, apellido o DNI contienen lo buscado (sin distinguir tildes). */
  const jugadoresFiltrados = useMemo(() => {
    const texto = normalizarParaBuscar(busqueda.trim());
    if (!texto) return jugadores;
    return jugadores?.filter((j) =>
      normalizarParaBuscar(`${j.apellidos} ${j.nombres} ${j.dni}`).includes(
        texto,
      ),
    );
  }, [jugadores, busqueda]);
  // #endregion

  // #region Acciones
  async function guardar(datos: DatosFormularioJugador) {
    if (edicion?.jugador) {
      await modificar.mutateAsync({ id: edicion.jugador.id, datos });
      notificaciones.exito(`Se modificó el jugador "${nombreJugador(datos)}".`);
    } else {
      await crear.mutateAsync(datos);
      notificaciones.exito(`Se creó el jugador "${nombreJugador(datos)}".`);
    }
    setEdicion(null);
  }

  function confirmarBorrado() {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () =>
        notificaciones.exito(
          `Se borró el jugador "${nombreJugador(aBorrar)}".`,
        ),
      onError: (errorBorrado) => notificaciones.error(errorBorrado),
      onSettled: () => setABorrar(null),
    });
  }
  // #endregion

  // #region Plantillas de columnas
  const plantillaJugador = useCallback(
    (jugador: Jugador) => (
      <div className="celda-doble">
        <span>{nombreJugador(jugador)}</span>
        {/* En SM no hay columna de DNI: se muestra debajo del nombre. */}
        <span className="celda-doble__secundario solo-sm">
          DNI {jugador.dni}
        </span>
      </div>
    ),
    [],
  );
  const plantillaContacto = useCallback(
    (jugador: Jugador) => (
      <div className="celda-doble">
        <span>{jugador.email}</span>
        <span className="celda-doble__secundario">{jugador.telefono}</span>
      </div>
    ),
    [],
  );
  const plantillaAcciones = useCallback(
    (jugador: Jugador) => (
      <AccionesFila
        descripcion={nombreJugador(jugador)}
        onModificar={() => setEdicion({ jugador })}
        onBorrar={() => setABorrar(jugador)}
      />
    ),
    [],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Jugadores"
        descripcion="Alta, modificación y baja de jugadores. Se inscriben en un equipo desde Inscripciones."
        acciones={
          <ButtonComponent
            isPrimary
            iconCss="e-icons e-plus"
            onClick={() => setEdicion({})}
          >
            Nuevo jugador
          </ButtonComponent>
        }
      />

      {isPending && <Cargando texto="Cargando jugadores…" />}
      {error && <MensajeError error={error} onReintentar={() => refetch()} />}

      {jugadoresFiltrados && (
        <>
          <div className="buscador">
            <TextBoxComponent
              placeholder="Buscar por nombre o DNI"
              floatLabelType="Auto"
              showClearButton
              value={busqueda}
              input={(e) => setBusqueda(e.value ?? '')}
              // El botón para borrar la búsqueda dispara "change", no "input".
              change={(e) => setBusqueda(e.value ?? '')}
            />
          </div>
          <p className="resumen">
            {jugadoresFiltrados.length === 1
              ? '1 jugador'
              : `${jugadoresFiltrados.length} jugadores`}
          </p>
          <GridComponent
            dataSource={jugadoresFiltrados}
            locale={IDIOMA}
            allowSorting
            allowPaging
            pageSettings={{ pageSize: 10 }}
            enableHover={false}
          >
            <ColumnsDirective>
              <ColumnDirective
                field="apellidos"
                headerText="Jugador"
                template={plantillaJugador}
              />
              <ColumnDirective
                field="dni"
                headerText="DNI"
                width={110}
                hideAtMedia={DESDE_MD}
              />
              <ColumnDirective
                field="email"
                headerText="Contacto"
                template={plantillaContacto}
                hideAtMedia={DESDE_LG}
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
        </>
      )}

      {edicion && (
        <Dialogo
          titulo={edicion.jugador ? 'Modificar jugador' : 'Nuevo jugador'}
          onCerrar={() => setEdicion(null)}
        >
          <FormularioJugador
            jugador={edicion.jugador}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        </Dialogo>
      )}

      {aBorrar && (
        <DialogoConfirmacion
          titulo="Borrar jugador"
          mensaje={`¿Borrar el jugador "${nombreJugador(aBorrar)}"? No se puede deshacer.`}
          procesando={borrar.isPending}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}
    </>
  );
}
