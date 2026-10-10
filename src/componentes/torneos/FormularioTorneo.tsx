import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Torneo } from '../../modelos/torneo';
import {
  esquemaTorneo,
  type DatosFormularioTorneo,
} from '../../validaciones/torneo.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoNumero } from '../formularios/CampoNumero';
import { CampoTexto } from '../formularios/CampoTexto';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

/**
 * Año que se propone en el alta. Se calcula al cargar el módulo y no al dibujar: React pide que
 * el dibujo sea "puro" (mismo resultado con los mismos datos), y new Date() no lo es.
 */
const ANIO_ACTUAL = new Date().getFullYear();

interface Props {
  /** Torneo a modificar. Si no se pasa, el formulario es de alta. */
  torneo?: Torneo;
  /**
   * Guarda los datos. Si la promesa falla, el error del backend se muestra en el formulario
   * y el diálogo queda abierto.
   */
  onGuardar: (datos: DatosFormularioTorneo) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario de alta y modificación de torneo. El estado no se edita: lo cambian los casos de uso. */
export function FormularioTorneo({ torneo, onGuardar, onCancelar }: Props) {
  // useForm administra los valores, la validación (con el esquema de Zod) y el envío.
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioTorneo>({
    resolver: zodResolver(esquemaTorneo),
    defaultValues: {
      nombre: torneo?.nombre ?? '',
      anio: torneo?.anio ?? ANIO_ACTUAL,
    },
  });

  // handleSubmit valida con Zod y solo llama a esta función si los datos son válidos.
  // isSubmitting queda en true mientras la promesa no termina: deshabilita los botones.
  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, ['nombre', 'anio']);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      <CampoTexto control={control} nombre="nombre" etiqueta="Nombre" />
      <CampoNumero
        control={control}
        nombre="anio"
        etiqueta="Año"
        ayuda="Entre 2000 y 2100."
      />
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario guardando={isSubmitting} onCancelar={onCancelar} />
    </form>
  );
}
