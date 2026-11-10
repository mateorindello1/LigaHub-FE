import { z } from 'zod';

/**
 * Programación de un partido. Los dos datos son opcionales: vacíos, el partido queda
 * "a confirmar". Que la cancha y los equipos estén libres a esa hora lo valida el backend (409).
 */
export const esquemaProgramarPartido = z.object({
  fechaHora: z.date().nullable(),
  // null cuando la lista queda sin elegir; undefined si el partido no tenía cancha.
  canchaId: z.number().int().nullish(),
});

export type DatosFormularioProgramarPartido = z.infer<
  typeof esquemaProgramarPartido
>;
