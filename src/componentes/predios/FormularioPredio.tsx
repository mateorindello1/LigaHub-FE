import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Predio } from '../../modelos/predio';
import {
  esquemaPredio,
  type DatosFormularioPredio,
} from '../../validaciones/predio.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoTexto } from '../formularios/CampoTexto';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

interface Props {
  /** Predio a modificar. Si no se pasa, el formulario es de alta. */
  predio?: Predio;
  onGuardar: (datos: DatosFormularioPredio) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario de alta y modificación de predio. */
export function FormularioPredio({ predio, onGuardar, onCancelar }: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioPredio>({
    resolver: zodResolver(esquemaPredio),
    defaultValues: {
      nombre: predio?.nombre ?? '',
      direccion: predio?.direccion ?? '',
    },
  });

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, ['nombre', 'direccion']);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      <CampoTexto control={control} nombre="nombre" etiqueta="Nombre" />
      <CampoTexto
        control={control}
        nombre="direccion"
        etiqueta="Dirección"
        autocompletar="street-address"
      />
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario guardando={isSubmitting} onCancelar={onCancelar} />
    </form>
  );
}
