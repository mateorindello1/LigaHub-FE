import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PartidoFixture } from '../../modelos/fixture';
import type { Predio } from '../../modelos/predio';
import {
  esquemaProgramarPartido,
  type DatosFormularioProgramarPartido,
} from '../../validaciones/programar-partido.validacion';
import { Cargando } from '../comunes/Cargando';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoFechaHora } from '../formularios/CampoFechaHora';
import { CampoLista } from '../formularios/CampoLista';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

interface Props {
  partido: PartidoFixture;
  /** Predios con sus canchas. undefined mientras se cargan. */
  predios?: Predio[];
  onGuardar: (datos: DatosFormularioProgramarPartido) => Promise<void>;
  onCancelar: () => void;
}

/** Opción de la lista de canchas, agrupada por predio. */
interface OpcionCancha {
  id: number;
  texto: string;
  predio: string;
}

/**
 * Formulario para programar un partido: día y hora, y cancha (agrupadas por predio).
 * Los dos datos se pueden dejar vacíos: el partido queda "a confirmar".
 */
export function FormularioProgramarPartido({
  partido,
  predios,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioProgramarPartido>({
    resolver: zodResolver(esquemaProgramarPartido),
    defaultValues: {
      fechaHora: partido.fechaHora ? new Date(partido.fechaHora) : null,
      canchaId: partido.cancha?.id,
    },
  });

  // Mismo arreglo mientras no cambien los predios: la lista de Syncfusion no se recarga.
  const opciones = useMemo<OpcionCancha[]>(
    () =>
      (predios ?? []).flatMap((predio) =>
        predio.canchas.map((cancha) => ({
          id: cancha.id,
          texto: `Cancha ${cancha.numero} · ${cancha.descripcion}`,
          predio: predio.nombre,
        })),
      ),
    [predios],
  );

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, ['fechaHora', 'canchaId']);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      <p className="dialogo__mensaje">
        <strong>
          {partido.local.nombre} vs {partido.visitante.nombre}
        </strong>
      </p>
      <CampoFechaHora
        control={control}
        nombre="fechaHora"
        etiqueta="Día y hora"
        ayuda="Vacío: a confirmar."
      />
      {predios === undefined ? (
        <Cargando texto="Cargando canchas…" />
      ) : opciones.length === 0 ? (
        <p className="dialogo__mensaje">
          Todavía no hay canchas. Se cargan en la pantalla Predios.
        </p>
      ) : (
        <CampoLista
          control={control}
          nombre="canchaId"
          etiqueta="Cancha"
          opciones={opciones}
          campoTexto="texto"
          campoValor="id"
          campoGrupo="predio"
          permitirVacio
          ayuda="Vacía: a confirmar. No puede tener otro partido a menos de una hora."
        />
      )}
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario guardando={isSubmitting} onCancelar={onCancelar} />
    </form>
  );
}
