import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Equipo } from '../../modelos/equipo';
import {
  esquemaEquipo,
  type DatosFormularioEquipo,
} from '../../validaciones/equipo.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoTexto } from '../formularios/CampoTexto';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';
import { EscudoEquipo } from './EscudoEquipo';

interface Props {
  /** Equipo a modificar. Si no se pasa, el formulario es de alta. */
  equipo?: Equipo;
  /** Guarda los datos. Si la promesa falla, el error se muestra en el formulario. */
  onGuardar: (datos: DatosFormularioEquipo) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario de alta y modificación de equipo, con vista previa del escudo. */
export function FormularioEquipo({ equipo, onGuardar, onCancelar }: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioEquipo>({
    resolver: zodResolver(esquemaEquipo),
    defaultValues: {
      nombre: equipo?.nombre ?? '',
      escudoURL: equipo?.escudoURL ?? '',
    },
  });

  // useWatch vuelve a dibujar el componente cuando cambian estos campos: la vista previa
  // se actualiza mientras el usuario escribe.
  const [nombre, escudoURL] = useWatch({
    control,
    name: ['nombre', 'escudoURL'],
  });

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, ['nombre', 'escudoURL']);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      <div className="vista-previa-escudo">
        <EscudoEquipo
          nombre={nombre.trim() || '?'}
          escudoURL={escudoURL.trim() || null}
          tamanio={56}
        />
      </div>
      <CampoTexto control={control} nombre="nombre" etiqueta="Nombre" />
      <CampoTexto
        control={control}
        nombre="escudoURL"
        etiqueta="URL del escudo"
        tipo="url"
        ayuda="Opcional. Dirección de una imagen (http o https)."
      />
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario guardando={isSubmitting} onCancelar={onCancelar} />
    </form>
  );
}
