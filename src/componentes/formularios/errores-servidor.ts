import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ErrorApi, mensajeDeError } from '../../api/error-api';

/**
 * Muestra en el formulario un error que devolvió la API al guardar:
 * - Si trae errores por campo (400 de validación), cada uno va debajo de su campo.
 * - Si no (por ejemplo, un 409 "Ya existe un equipo llamado…"), va como error general
 *   del formulario, en errors.root.servidor.
 *
 * Es la contraparte de Zod: Zod valida antes de enviar; esto muestra lo que solo puede validar
 * el backend (unicidad, reglas de negocio) o lo que se haya escapado.
 */
export function mostrarErrorDelServidor<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  campos: readonly Path<T>[],
): void {
  const detalles = error instanceof ErrorApi ? error.detalles : [];
  const detallesDeCampos = detalles.filter((d) =>
    campos.includes(d.campo as Path<T>),
  );

  if (detallesDeCampos.length === 0) {
    setError('root.servidor', {
      type: 'servidor',
      message: mensajeDeError(error),
    });
    return;
  }

  detallesDeCampos.forEach((detalle, indice) =>
    setError(
      detalle.campo as Path<T>,
      { type: 'servidor', message: detalle.mensajes[0] },
      // El foco va al primer campo con error.
      { shouldFocus: indice === 0 },
    ),
  );
}
