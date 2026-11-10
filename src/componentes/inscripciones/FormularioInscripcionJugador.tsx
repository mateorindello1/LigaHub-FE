import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nombreJugador, type Jugador } from '../../modelos/jugador';
import type { InscripcionJugador } from '../../modelos/inscripcion-jugador';
import {
  esquemaInscripcionJugador,
  type DatosFormularioInscripcionJugador,
} from '../../validaciones/inscripcion-jugador.validacion';
import { Cargando } from '../comunes/Cargando';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoCasilla } from '../formularios/CampoCasilla';
import { CampoLista } from '../formularios/CampoLista';
import { CampoNumero } from '../formularios/CampoNumero';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

interface Props {
  /**
   * Jugadores que se pueden elegir en un alta (los que no están en ningún equipo del torneo).
   * undefined mientras se cargan. No se usa al modificar.
   */
  jugadores?: Jugador[];
  /** Inscripción a modificar. Si no se pasa, el formulario es de alta. */
  inscripcion?: InscripcionJugador;
  /** Nombre del capitán actual del equipo, para avisar que deja de serlo si se marca otro. */
  capitanActual?: string;
  onGuardar: (datos: DatosFormularioInscripcionJugador) => Promise<void>;
  onCancelar: () => void;
}

/** Opción de la lista de jugadores: "Apellidos, Nombres (DNI x)". */
interface OpcionJugador {
  id: number;
  texto: string;
}

/**
 * Formulario para inscribir un jugador en el equipo o cambiar su dorsal y capitanía.
 * El jugador se elige solo en el alta: para cambiarlo, se da de baja y se inscribe otro.
 */
export function FormularioInscripcionJugador({
  jugadores,
  inscripcion,
  capitanActual,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioInscripcionJugador>({
    resolver: zodResolver(esquemaInscripcionJugador),
    defaultValues: {
      jugadorId: inscripcion?.jugadorId,
      dorsal: inscripcion?.dorsal,
      capitan: inscripcion?.capitan ?? false,
    },
  });
  // Al marcar la casilla se vuelve a dibujar, para mostrar el aviso del capitán anterior.
  const esCapitan = useWatch({ control, name: 'capitan' });

  // Mismo arreglo mientras no cambien los jugadores: la lista de Syncfusion no se recarga.
  const opciones = useMemo<OpcionJugador[]>(
    () =>
      (jugadores ?? []).map((j) => ({
        id: j.id,
        texto: `${nombreJugador(j)} (DNI ${j.dni})`,
      })),
    [jugadores],
  );

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, [
        'jugadorId',
        'dorsal',
        'capitan',
      ]);
    }
  });

  // Hay otro capitán y este jugador pasa a serlo: el otro deja de serlo.
  const reemplazaCapitan =
    capitanActual !== undefined && esCapitan && !inscripcion?.capitan;

  return (
    <form onSubmit={enviar} noValidate>
      {inscripcion ? (
        <p className="dialogo__mensaje">
          <strong>{nombreJugador(inscripcion.jugador)}</strong>
        </p>
      ) : jugadores === undefined ? (
        <Cargando texto="Cargando jugadores…" />
      ) : jugadores.length === 0 ? (
        <p className="dialogo__mensaje">
          Todos los jugadores ya están en algún equipo de este torneo. Para
          inscribir otro, primero hay que crearlo en Jugadores.
        </p>
      ) : (
        <CampoLista
          control={control}
          nombre="jugadorId"
          etiqueta="Jugador"
          opciones={opciones}
          campoTexto="texto"
          campoValor="id"
          filtrable
          ayuda="Solo aparecen los jugadores que no están en otro equipo del torneo."
        />
      )}
      <CampoNumero control={control} nombre="dorsal" etiqueta="Dorsal" />
      <CampoCasilla
        control={control}
        nombre="capitan"
        etiqueta="Capitán del equipo"
        ayuda={
          reemplazaCapitan
            ? `${capitanActual} deja de ser el capitán.`
            : 'Cada equipo tiene un solo capitán.'
        }
      />
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario guardando={isSubmitting} onCancelar={onCancelar} />
    </form>
  );
}
