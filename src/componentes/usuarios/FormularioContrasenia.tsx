import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  esquemaContrasenia,
  LARGO_MINIMO_CONTRASENIA,
  type DatosFormularioContrasenia,
} from '../../validaciones/usuario.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoTexto } from '../formularios/CampoTexto';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

interface Props {
  /** Guarda la contraseña nueva. Si la promesa falla, el error se muestra en el formulario. */
  onGuardar: (datos: DatosFormularioContrasenia) => Promise<void>;
  onCancelar: () => void;
}

/** Cambio de contraseña de un usuario: la nueva y su repetición. */
export function FormularioContrasenia({ onGuardar, onCancelar }: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioContrasenia>({
    resolver: zodResolver(esquemaContrasenia),
    defaultValues: { contrasenia: '', repeticion: '' },
  });

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, ['contrasenia']);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      <CampoTexto
        control={control}
        nombre="contrasenia"
        etiqueta="Contraseña nueva"
        tipo="password"
        autocompletar="new-password"
        ayuda={`Al menos ${LARGO_MINIMO_CONTRASENIA} caracteres.`}
      />
      <CampoTexto
        control={control}
        nombre="repeticion"
        etiqueta="Repetir contraseña"
        tipo="password"
        autocompletar="new-password"
      />
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario
        guardando={isSubmitting}
        onCancelar={onCancelar}
        textoGuardar="Cambiar contraseña"
      />
    </form>
  );
}
