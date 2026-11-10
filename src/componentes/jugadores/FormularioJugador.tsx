import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Jugador } from '../../modelos/jugador';
import {
  esquemaJugador,
  type DatosFormularioJugador,
} from '../../validaciones/jugador.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoTexto } from '../formularios/CampoTexto';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

interface Props {
  /** Jugador a modificar. Si no se pasa, el formulario es de alta. */
  jugador?: Jugador;
  /**
   * Solo los datos de contacto (email, teléfono y dirección): lo que el propio jugador puede
   * modificar. El DNI y el nombre no se muestran, pero quedan en el formulario con sus valores
   * actuales para que la validación pase; quien guarda envía solo los de contacto.
   */
  soloContacto?: boolean;
  /** Guarda los datos. Si la promesa falla, el error se muestra en el formulario. */
  onGuardar: (datos: DatosFormularioJugador) => Promise<void>;
  onCancelar: () => void;
}

const CAMPOS: (keyof DatosFormularioJugador)[] = [
  'dni',
  'nombres',
  'apellidos',
  'email',
  'telefono',
  'direccion',
];

/** Formulario de alta y modificación de jugador. */
export function FormularioJugador({
  jugador,
  soloContacto = false,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioJugador>({
    resolver: zodResolver(esquemaJugador),
    defaultValues: {
      dni: jugador?.dni ?? '',
      nombres: jugador?.nombres ?? '',
      apellidos: jugador?.apellidos ?? '',
      email: jugador?.email ?? '',
      telefono: jugador?.telefono ?? '',
      direccion: jugador?.direccion ?? '',
    },
  });

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, CAMPOS);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      {!soloContacto && (
        <>
          <CampoTexto
            control={control}
            nombre="dni"
            etiqueta="DNI"
            ayuda="7 u 8 dígitos, sin puntos."
          />
          <CampoTexto
            control={control}
            nombre="apellidos"
            etiqueta="Apellidos"
          />
          <CampoTexto control={control} nombre="nombres" etiqueta="Nombres" />
        </>
      )}
      <CampoTexto
        control={control}
        nombre="email"
        etiqueta="Email de contacto"
        tipo="email"
        autocompletar="email"
      />
      <CampoTexto
        control={control}
        nombre="telefono"
        etiqueta="Teléfono"
        autocompletar="tel"
      />
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
