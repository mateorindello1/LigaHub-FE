import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Cancha } from '../../modelos/predio';
import {
  esquemaCancha,
  type DatosFormularioCancha,
} from '../../validaciones/predio.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoNumero } from '../formularios/CampoNumero';
import { CampoTexto } from '../formularios/CampoTexto';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

interface Props {
  /** Cancha a modificar. Si no se pasa, el formulario es de alta. */
  cancha?: Cancha;
  /** Número sugerido para una cancha nueva (el siguiente al mayor del predio). */
  numeroSugerido?: number;
  onGuardar: (datos: DatosFormularioCancha) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario de alta y modificación de cancha. */
export function FormularioCancha({
  cancha,
  numeroSugerido,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioCancha>({
    resolver: zodResolver(esquemaCancha),
    defaultValues: {
      numero: cancha?.numero ?? numeroSugerido,
      descripcion: cancha?.descripcion ?? '',
    },
  });

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, ['numero', 'descripcion']);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      <CampoNumero control={control} nombre="numero" etiqueta="Número" />
      <CampoTexto
        control={control}
        nombre="descripcion"
        etiqueta="Descripción"
        ayuda='Por ejemplo: "Fútbol 7, césped sintético".'
      />
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario guardando={isSubmitting} onCancelar={onCancelar} />
    </form>
  );
}
