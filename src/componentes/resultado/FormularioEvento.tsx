import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NOMBRES_TIPO_EVENTO, TipoEvento } from '../../modelos/partido';
import {
  esquemaEvento,
  type DatosFormularioEvento,
} from '../../validaciones/evento.validacion';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoLista } from '../formularios/CampoLista';
import { CampoNumero } from '../formularios/CampoNumero';

/** Jugador que se puede elegir en un evento: uno de los que jugaron. */
export interface OpcionJugadorEvento {
  inscripcionJugadorId: string;
  /** "10 · Díaz, Matías". */
  texto: string;
  /** Nombre del equipo, para agrupar la lista. */
  equipo: string;
}

interface Props {
  /** Jugadores que jugaron, de los dos equipos. */
  jugadores: OpcionJugadorEvento[];
  /** Minuto sugerido (el del último evento). */
  minutoSugerido?: number;
  onAgregar: (datos: DatosFormularioEvento) => void;
  onCancelar: () => void;
}

/** Tipos de evento para la lista desplegable. */
const OPCIONES_TIPO = Object.values(TipoEvento).map((valor) => ({
  valor,
  texto: NOMBRES_TIPO_EVENTO[valor],
}));

/**
 * Formulario para agregar un evento a la planilla. No llama a la API: el evento se agrega a la
 * planilla en pantalla y se envía con el resto al guardar el resultado.
 */
export function FormularioEvento({
  jugadores,
  minutoSugerido,
  onAgregar,
  onCancelar,
}: Props) {
  const { control, handleSubmit } = useForm<DatosFormularioEvento>({
    resolver: zodResolver(esquemaEvento),
    defaultValues: {
      tipoEvento: TipoEvento.Gol,
      minuto: minutoSugerido,
      inscripcionJugadorEntraId: null,
    },
  });

  // Se vuelve a dibujar al cambiar el tipo o el jugador: el campo "entra" aparece solo en un
  // cambio y ofrece solo compañeros del que sale.
  const [tipoEvento, sale] = useWatch({
    control,
    name: ['tipoEvento', 'inscripcionJugadorId'],
  });
  const esCambio = tipoEvento === TipoEvento.Cambio;
  const companieros = useMemo(() => {
    const equipo = jugadores.find(
      (j) => j.inscripcionJugadorId === sale,
    )?.equipo;
    return jugadores.filter(
      (j) => j.equipo === equipo && j.inscripcionJugadorId !== sale,
    );
  }, [jugadores, sale]);

  const enviar = handleSubmit((datos) =>
    onAgregar({
      ...datos,
      inscripcionJugadorEntraId: esCambio
        ? datos.inscripcionJugadorEntraId
        : null,
    }),
  );

  return (
    <form onSubmit={enviar} noValidate>
      <CampoLista
        control={control}
        nombre="tipoEvento"
        etiqueta="Tipo de evento"
        opciones={OPCIONES_TIPO}
        campoTexto="texto"
        campoValor="valor"
      />
      <CampoNumero
        control={control}
        nombre="minuto"
        etiqueta="Minuto"
        ayuda="De 0 a 130."
      />
      <CampoLista
        control={control}
        nombre="inscripcionJugadorId"
        etiqueta={esCambio ? 'Sale' : 'Jugador'}
        opciones={jugadores}
        campoTexto="texto"
        campoValor="inscripcionJugadorId"
        campoGrupo="equipo"
        filtrable
        ayuda={
          tipoEvento === TipoEvento.GolEnContra
            ? 'El jugador que hizo el gol en contra: suma para el rival.'
            : undefined
        }
      />
      {esCambio && (
        <CampoLista
          // key: al cambiar el que sale cambian las opciones; la lista se crea de nuevo.
          key={sale ?? ''}
          control={control}
          nombre="inscripcionJugadorEntraId"
          etiqueta="Entra"
          opciones={companieros}
          campoTexto="texto"
          campoValor="inscripcionJugadorId"
          filtrable
          ayuda="Un compañero que haya jugado (marcado en el plantel)."
        />
      )}
      <BotonesFormulario
        guardando={false}
        onCancelar={onCancelar}
        textoGuardar="Agregar"
      />
    </form>
  );
}
