import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { calcularResumenFixture } from '../../utilidades/resumen-fixture';
import {
  esquemaGenerarFixture,
  type DatosFormularioGenerarFixture,
} from '../../validaciones/generar-fixture.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoCasilla } from '../formularios/CampoCasilla';
import { CampoFechaHora } from '../formularios/CampoFechaHora';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';

interface Props {
  /** Equipos inscriptos en el torneo: con ellos se calcula el resumen. */
  cantidadEquipos: number;
  onGuardar: (datos: DatosFormularioGenerarFixture) => Promise<void>;
  onCancelar: () => void;
}

/**
 * Opciones del caso de uso "generar fixture": ida y vuelta y día y hora de la primera fecha.
 * Muestra, mientras se elige, cuántas fechas y partidos se van a crear.
 */
export function FormularioGenerarFixture({
  cantidadEquipos,
  onGuardar,
  onCancelar,
}: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioGenerarFixture>({
    resolver: zodResolver(esquemaGenerarFixture),
    defaultValues: { idaYVuelta: false, fechaInicio: null },
  });

  // El resumen se recalcula al marcar o desmarcar "ida y vuelta".
  const idaYVuelta = useWatch({ control, name: 'idaYVuelta' });
  const resumen = calcularResumenFixture(cantidadEquipos, idaYVuelta);

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, ['idaYVuelta', 'fechaInicio']);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      <CampoCasilla
        control={control}
        nombre="idaYVuelta"
        etiqueta="Ida y vuelta"
        ayuda="Dos ruedas: en la segunda se invierte la localía."
      />
      <CampoFechaHora
        control={control}
        nombre="fechaInicio"
        etiqueta="Primera fecha (opcional)"
        ayuda="Las siguientes fechas se programan una semana después cada una. Sin fecha, los partidos quedan a confirmar."
      />

      <div className="resumen-fixture" aria-live="polite">
        Con {cantidadEquipos} equipos se van a crear{' '}
        <strong>
          {resumen.fechas} fechas de {resumen.partidosPorFecha}{' '}
          {resumen.partidosPorFecha === 1 ? 'partido' : 'partidos'}
        </strong>{' '}
        ({resumen.partidosTotales} en total).
        {resumen.hayEquipoLibre && ' En cada fecha un equipo queda libre.'} El
        torneo pasa a En curso y se cierran las inscripciones.
      </div>

      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario
        guardando={isSubmitting}
        onCancelar={onCancelar}
        textoGuardar="Generar"
        textoProcesando="Generando…"
      />
    </form>
  );
}
