import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Equipo } from '../../modelos/equipo';
import type { InscripcionEquipo } from '../../modelos/inscripcion-equipo';
import {
  esquemaInscripcionEquipo,
  type DatosFormularioInscripcion,
} from '../../validaciones/inscripcion-equipo.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoLista } from '../formularios/CampoLista';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

interface Props {
  /** Equipos que se pueden elegir (los que no están inscriptos en el torneo). */
  equipos: Equipo[];
  /** Inscripción a modificar. Si no se pasa, el formulario es de alta. */
  inscripcion?: InscripcionEquipo;
  onGuardar: (datos: DatosFormularioInscripcion) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario para inscribir un equipo en un torneo o cambiar el equipo de una inscripción. */
export function FormularioInscripcion({
  equipos,
  inscripcion,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioInscripcion>({
    resolver: zodResolver(esquemaInscripcionEquipo),
    defaultValues: { equipoId: inscripcion?.equipoId },
  });

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, ['equipoId']);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      {equipos.length === 0 ? (
        <p className="dialogo__mensaje">
          Todos los equipos ya están inscriptos en este torneo. Para inscribir
          otro, primero hay que crearlo en Equipos.
        </p>
      ) : (
        <CampoLista
          control={control}
          nombre="equipoId"
          etiqueta="Equipo"
          opciones={equipos}
          campoTexto="nombre"
          campoValor="id"
          ayuda="Solo aparecen los equipos que no están inscriptos."
        />
      )}
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario guardando={isSubmitting} onCancelar={onCancelar} />
    </form>
  );
}
