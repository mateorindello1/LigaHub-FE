import { z } from 'zod';

const MENSAJE_DORSAL = 'El dorsal tiene que ser un número entre 1 y 99.';

/**
 * Reglas del formulario de inscripción de un jugador en el equipo. Lo que depende de otros datos
 * (que el jugador no esté en otro equipo del torneo, que el dorsal esté libre) lo responde el
 * backend con un 409.
 */
export const esquemaInscripcionJugador = z.object({
  // Al modificar no se elige el jugador: el formulario lo trae cargado.
  jugadorId: z
    .number({ error: 'Elegí un jugador.' })
    .int()
    .min(1, 'Elegí un jugador.'),
  dorsal: z
    .number({ error: 'El dorsal es obligatorio.' })
    .int(MENSAJE_DORSAL)
    .min(1, MENSAJE_DORSAL)
    .max(99, MENSAJE_DORSAL),
  capitan: z.boolean(),
});

export type DatosFormularioInscripcionJugador = z.infer<
  typeof esquemaInscripcionJugador
>;
