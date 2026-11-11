import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ButtonComponent,
  RadioButtonComponent,
} from '@syncfusion/ej2-react-buttons';
import { ErrorApi, mensajeDeError } from '../api/error-api';
import { Cargando } from '../componentes/comunes/Cargando';
import { Dialogo } from '../componentes/comunes/Dialogo';
import { DialogoConfirmacion } from '../componentes/comunes/DialogoConfirmacion';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import {
  FormularioEvento,
  type OpcionJugadorEvento,
} from '../componentes/resultado/FormularioEvento';
import {
  ListaEventos,
  type JugadorDeEvento,
} from '../componentes/resultado/ListaEventos';
import { MarcadorPartido } from '../componentes/resultado/MarcadorPartido';
import { PlantelPartido } from '../componentes/resultado/PlantelPartido';
import {
  useAnularResultado,
  useCargarResultado,
  usePlanilla,
} from '../hooks/resultados.hooks';
import { EstadoPartido, EstadoTorneo } from '../modelos/estados';
import type {
  CargarResultado,
  EventoACargar,
  PlanillaPartido,
} from '../modelos/partido';
import { formatearFechaHora } from '../utilidades/formato';
import { calcularMarcador, type Marcador } from '../utilidades/marcador';
import type { DatosFormularioEvento } from '../validaciones/evento.validacion';
import { IrAlInicio } from '../componentes/comunes/IrAlInicio';

const PATRON_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Goles con los que se registra un W.O. (igual que GOLES_WO del backend). */
const GOLES_WO = 3;

/** Qué pasó con el partido. */
type Tipo = 'jugado' | 'wo' | 'suspendido';

const ESTADO_DE_TIPO: Record<Tipo, EstadoPartido> = {
  jugado: EstadoPartido.Finalizado,
  wo: EstadoPartido.WO,
  suspendido: EstadoPartido.Suspendido,
};

/**
 * Caso de uso "cargar el resultado de un partido" (/fixture/partidos/:partidoId), para el
 * Asistente y el Administrador. Es la planilla del partido:
 * - Qué pasó: jugado, ganado por W.O. o suspendido.
 * - Jugado: quiénes jugaron (casillas por plantel) y los eventos (goles, tarjetas, cambios).
 *   El marcador se calcula de los goles mientras se carga y se confirma antes de guardar.
 *
 * La planilla se edita en pantalla y se envía entera al guardar (PUT): reemplaza lo anterior.
 */
export function ResultadoPartidoPagina() {
  const partidoId = useParams().partidoId ?? '';
  if (!PATRON_UUID.test(partidoId)) return <IrAlInicio />;
  return <CargaResultado partidoId={partidoId} />;
}

/** Carga la planilla y, cuando llega, dibuja el editor. */
function CargaResultado({ partidoId }: { partidoId: string }) {
  const { data: planilla, isPending, error, refetch } = usePlanilla(partidoId);

  if (isPending) return <Cargando texto="Cargando la planilla…" />;
  if (error) {
    // Un 404 (el partido no existe) no muestra error: lleva al inicio, para no confirmar qué ids existen.
    if (error instanceof ErrorApi && error.esErrorDelCliente) {
      return <IrAlInicio />;
    }
    return <MensajeError error={error} onReintentar={() => refetch()} />;
  }
  // key: si cambia el estado guardado (por ejemplo, después de anular), el editor arranca de nuevo.
  return (
    <EditorPlanilla
      key={`${planilla.id}-${planilla.estadoPartido}`}
      planilla={planilla}
    />
  );
}

/** Estado inicial del editor a partir de lo que ya estaba cargado. */
function tipoInicial(estado: EstadoPartido): Tipo {
  if (estado === EstadoPartido.WO) return 'wo';
  if (estado === EstadoPartido.Suspendido) return 'suspendido';
  return 'jugado';
}

/** Editor de la planilla. El estado vive acá, como los campos de un ViewModel de edición. */
function EditorPlanilla({ planilla }: { planilla: PlanillaPartido }) {
  // #region Estado
  const { local, visitante, torneo } = planilla;
  const navegar = useNavigate();
  const notificaciones = useNotificaciones();
  const cargar = useCargarResultado(planilla.id, torneo.id);
  const anular = useAnularResultado(planilla.id, torneo.id);

  const [tipo, setTipo] = useState<Tipo>(tipoInicial(planilla.estadoPartido));
  const [jugaron, setJugaron] = useState(
    () =>
      new Set(
        [...local.plantel, ...visitante.plantel]
          .filter((j) => j.jugo)
          .map((j) => j.inscripcionJugadorId),
      ),
  );
  const [eventos, setEventos] = useState<EventoACargar[]>(() =>
    planilla.eventos.map(({ id: _id, ...evento }) => evento),
  );
  const [ganadorWO, setGanadorWO] = useState<number | null>(() => {
    if (planilla.estadoPartido !== EstadoPartido.WO) return null;
    return (planilla.golesLocal ?? 0) > (planilla.golesVisitante ?? 0)
      ? local.id
      : visitante.id;
  });
  const [agregandoEvento, setAgregandoEvento] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmandoAnular, setConfirmandoAnular] = useState(false);

  const editable = torneo.estadoTorneo !== EstadoTorneo.Finalizado;
  const tieneResultado = planilla.estadoPartido !== EstadoPartido.Programado;
  // #endregion

  // #region Datos calculados

  /** Nombre y equipo de cada inscripción, para la lista de eventos y los avisos. */
  const jugadores = useMemo(() => {
    const mapa = new Map<string, JugadorDeEvento & { esLocal: boolean }>();
    for (const [equipo, esLocal] of [
      [local, true],
      [visitante, false],
    ] as const) {
      for (const j of equipo.plantel) {
        mapa.set(j.inscripcionJugadorId, {
          nombre: `${j.apellidos}, ${j.nombres}`,
          equipo: equipo.nombre,
          esLocal,
        });
      }
    }
    return mapa;
  }, [local, visitante]);

  /** Opciones del formulario de evento: solo los que jugaron, agrupados por equipo. */
  const opcionesEvento = useMemo<OpcionJugadorEvento[]>(
    () =>
      [...local.plantel, ...visitante.plantel]
        .filter((j) => jugaron.has(j.inscripcionJugadorId))
        .map((j) => ({
          inscripcionJugadorId: j.inscripcionJugadorId,
          texto: `${j.dorsal} · ${j.apellidos}, ${j.nombres}`,
          equipo: jugadores.get(j.inscripcionJugadorId)!.equipo,
        })),
    [local, visitante, jugaron, jugadores],
  );

  /** Marcador que va a quedar al guardar. */
  const marcador: Marcador | null = useMemo(() => {
    if (tipo === 'jugado') {
      return calcularMarcador(
        eventos,
        (id) => jugadores.get(id)?.esLocal ?? false,
      );
    }
    if (tipo === 'wo' && ganadorWO !== null) {
      return ganadorWO === local.id
        ? { golesLocal: GOLES_WO, golesVisitante: 0 }
        : { golesLocal: 0, golesVisitante: GOLES_WO };
    }
    return null;
  }, [tipo, eventos, jugadores, ganadorWO, local.id]);

  // El seed carga marcadores sin planilla: se avisa que al guardar se recalcula.
  const resultadoSinPlanilla =
    planilla.estadoPartido === EstadoPartido.Finalizado &&
    planilla.eventos.length === 0 &&
    (planilla.golesLocal ?? 0) + (planilla.golesVisitante ?? 0) > 0;
  // #endregion

  // #region Acciones

  /** Marca o desmarca a un jugador. Si se lo desmarca, se quitan sus eventos. */
  function cambiarJugo(ids: string[], jugo: boolean) {
    setJugaron((anterior) => {
      const nuevo = new Set(anterior);
      ids.forEach((id) => (jugo ? nuevo.add(id) : nuevo.delete(id)));
      return nuevo;
    });
    if (jugo) return;
    const quitados = eventos.filter(
      (e) =>
        ids.includes(e.inscripcionJugadorId) ||
        ids.includes(e.inscripcionJugadorEntraId ?? ''),
    );
    if (quitados.length > 0) {
      setEventos((anteriores) =>
        anteriores.filter((e) => !quitados.includes(e)),
      );
      notificaciones.exito(
        quitados.length === 1
          ? 'Se quitó 1 evento de un jugador que ya no figura entre los que jugaron.'
          : `Se quitaron ${quitados.length} eventos de jugadores que ya no figuran entre los que jugaron.`,
      );
    }
  }

  function agregarEvento(datos: DatosFormularioEvento) {
    setEventos((anteriores) =>
      [
        ...anteriores,
        {
          tipoEvento: datos.tipoEvento as EventoACargar['tipoEvento'],
          minuto: datos.minuto,
          inscripcionJugadorId: datos.inscripcionJugadorId,
          inscripcionJugadorEntraId: datos.inscripcionJugadorEntraId ?? null,
        },
      ].sort((a, b) => a.minuto - b.minuto),
    );
    setAgregandoEvento(false);
  }

  /** Antes de confirmar: lo que falta para poder guardar. */
  function validar(): string | null {
    if (tipo === 'wo' && ganadorWO === null) {
      return 'Elegí qué equipo se presentó.';
    }
    if (tipo === 'jugado' && jugaron.size === 0) {
      return 'Marcá los jugadores que jugaron.';
    }
    return null;
  }

  function pedirConfirmacion() {
    const falta = validar();
    if (falta) notificaciones.error(falta);
    else setConfirmando(true);
  }

  function guardar() {
    const datos: CargarResultado = { estadoPartido: ESTADO_DE_TIPO[tipo] };
    if (tipo === 'jugado') {
      datos.jugadores = [...jugaron];
      datos.eventos = eventos;
    } else if (tipo === 'wo' && ganadorWO !== null) {
      datos.equipoGanadorId = ganadorWO;
    }
    cargar.mutate(datos, {
      onSuccess: () => {
        notificaciones.exito(`Se guardó el resultado: ${descripcion()}.`);
        navegar(`/fixture?torneo=${torneo.id}`);
      },
      // Un 400 trae el detalle por campo (por ejemplo, el de un evento): se agrega al mensaje.
      onError: (error) =>
        notificaciones.error(
          error instanceof ErrorApi && error.detalles.length > 0
            ? `${error.message} ${error.detalles[0].mensajes[0]}`
            : mensajeDeError(error),
        ),
      onSettled: () => setConfirmando(false),
    });
  }

  function confirmarAnulacion() {
    anular.mutate(undefined, {
      onSuccess: () =>
        notificaciones.exito(
          'Se anuló el resultado: el partido vuelve a estar programado.',
        ),
      onError: (error) => notificaciones.error(error),
      onSettled: () => setConfirmandoAnular(false),
    });
  }

  /** "Los Halcones 2 - 1 Deportivo Sur", "W.O.: gana ..." o "suspendido". */
  function descripcion(): string {
    if (tipo === 'suspendido') return 'el partido queda suspendido';
    const prefijo = tipo === 'wo' ? 'W.O., ' : '';
    return `${prefijo}${local.nombre} ${marcador?.golesLocal} - ${marcador?.golesVisitante} ${visitante.nombre}`;
  }
  // #endregion

  const datosPartido = [
    torneo.nombre,
    `Fecha ${planilla.numeroFecha}`,
    formatearFechaHora(planilla.fechaHora),
    planilla.cancha
      ? `${planilla.cancha.predio}, cancha ${planilla.cancha.numero}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <Link className="enlace-volver" to={`/fixture?torneo=${torneo.id}`}>
        <span className="e-icons e-chevron-left" aria-hidden="true" />
        Volver al fixture
      </Link>
      <EncabezadoPagina
        titulo="Resultado del partido"
        descripcion={datosPartido}
      />

      {!editable && (
        <p className="aviso" role="status">
          <span className="e-icons e-lock" aria-hidden="true" />
          El torneo está finalizado: el resultado solo se puede consultar.
        </p>
      )}
      {resultadoSinPlanilla && (
        <p className="aviso" role="status">
          El resultado guardado ({planilla.golesLocal} -{' '}
          {planilla.golesVisitante}) no tiene la planilla cargada. Al guardar,
          el marcador se calcula a partir de los goles que cargues.
        </p>
      )}

      <MarcadorPartido
        local={local}
        visitante={visitante}
        golesLocal={marcador?.golesLocal ?? null}
        golesVisitante={marcador?.golesVisitante ?? null}
      />

      <fieldset className="campo-roles planilla__tipo" disabled={!editable}>
        <legend>¿Qué pasó?</legend>
        <div className="campo-roles__opciones">
          {(
            [
              ['jugado', 'Se jugó'],
              ['wo', 'Ganó por W.O.'],
              ['suspendido', 'Se suspendió'],
            ] as const
          ).map(([valor, texto]) => (
            <RadioButtonComponent
              key={valor}
              name="tipo"
              label={texto}
              value={valor}
              checked={tipo === valor}
              disabled={!editable}
              change={() => setTipo(valor)}
            />
          ))}
        </div>
      </fieldset>

      {tipo === 'wo' && (
        <fieldset className="campo-roles planilla__tipo" disabled={!editable}>
          <legend>¿Qué equipo se presentó? Gana 3 a 0.</legend>
          <div className="campo-roles__opciones">
            {[local, visitante].map((equipo) => (
              <RadioButtonComponent
                key={equipo.id}
                name="ganador"
                label={equipo.nombre}
                value={String(equipo.id)}
                checked={ganadorWO === equipo.id}
                disabled={!editable}
                change={() => setGanadorWO(equipo.id)}
              />
            ))}
          </div>
        </fieldset>
      )}

      {tipo === 'jugado' && (
        <>
          <h2 className="planilla__titulo">Quiénes jugaron</h2>
          <div className="planilla__planteles">
            {[local, visitante].map((equipo) => (
              <PlantelPartido
                key={equipo.id}
                equipo={equipo}
                jugaron={jugaron}
                deshabilitado={!editable}
                onCambiar={(id, jugo) => cambiarJugo([id], jugo)}
                onTodos={(jugo) =>
                  cambiarJugo(
                    // "Todos" no anota a los suspendidos; "Ninguno" sí los saca.
                    equipo.plantel
                      .filter((j) => !jugo || !j.suspendido)
                      .map((j) => j.inscripcionJugadorId),
                    jugo,
                  )
                }
              />
            ))}
          </div>

          <div className="planilla__encabezado-eventos">
            <h2 className="planilla__titulo">Eventos</h2>
            {editable && (
              <ButtonComponent
                type="button"
                iconCss="e-icons e-plus"
                disabled={opcionesEvento.length === 0}
                title={
                  opcionesEvento.length === 0
                    ? 'Primero marcá quiénes jugaron'
                    : undefined
                }
                onClick={() => setAgregandoEvento(true)}
              >
                Agregar evento
              </ButtonComponent>
            )}
          </div>
          <ListaEventos
            eventos={eventos}
            jugador={(id) => jugadores.get(id)}
            onQuitar={
              editable
                ? (indice) =>
                    setEventos((anteriores) =>
                      anteriores.filter((_e, i) => i !== indice),
                    )
                : undefined
            }
          />
        </>
      )}

      {editable && (
        <div className="planilla__pie">
          {tieneResultado && (
            <ButtonComponent
              type="button"
              cssClass="e-outline e-danger"
              iconCss="e-icons e-undo"
              onClick={() => setConfirmandoAnular(true)}
            >
              Anular resultado
            </ButtonComponent>
          )}
          <ButtonComponent
            type="button"
            isPrimary
            iconCss="e-icons e-save"
            onClick={pedirConfirmacion}
          >
            Guardar resultado
          </ButtonComponent>
        </div>
      )}

      {agregandoEvento && (
        <Dialogo
          titulo="Agregar evento"
          onCerrar={() => setAgregandoEvento(false)}
        >
          <FormularioEvento
            jugadores={opcionesEvento}
            minutoSugerido={eventos.at(-1)?.minuto}
            onAgregar={agregarEvento}
            onCancelar={() => setAgregandoEvento(false)}
          />
        </Dialogo>
      )}

      {confirmando && (
        <DialogoConfirmacion
          titulo="Guardar el resultado"
          mensaje={`¿Guardar el resultado? ${descripcion().replace(/^./, (c) => c.toUpperCase())}.${
            tipo === 'jugado'
              ? ` Jugaron ${jugaron.size} jugadores y hay ${eventos.length} eventos.`
              : ''
          }${tieneResultado ? ' Reemplaza el resultado cargado antes.' : ''}`}
          textoConfirmar="Guardar"
          peligroso={false}
          procesando={cargar.isPending}
          onConfirmar={guardar}
          onCancelar={() => setConfirmando(false)}
        />
      )}

      {confirmandoAnular && (
        <DialogoConfirmacion
          titulo="Anular el resultado"
          mensaje="¿Anular el resultado? Se borran los jugadores, los eventos y el marcador, y el partido vuelve a estar programado."
          textoConfirmar="Anular"
          procesando={anular.isPending}
          onConfirmar={confirmarAnulacion}
          onCancelar={() => setConfirmandoAnular(false)}
        />
      )}
    </>
  );
}
