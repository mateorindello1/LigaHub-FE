import { z } from 'zod';

/**
 * Opciones para generar el fixture. Que el torneo esté en inscripción y tenga al menos dos
 * equipos lo valida el backend (responde 409).
 */
export const esquemaGenerarFixture = z.object({
  idaYVuelta: z.boolean(),
  /** Día y hora de la primera fecha. Opcional: sin ella, los partidos quedan "a confirmar". */
  fechaInicio: z
    .date()
    .nullable()
    .refine(
      (fecha) => fecha === null || fecha.getTime() > Date.now(),
      'La primera fecha tiene que ser posterior a este momento.',
    ),
});

export type DatosFormularioGenerarFixture = z.infer<
  typeof esquemaGenerarFixture
>;
