import { z } from 'zod';
import { TipoEvento } from '../modelos/partido';

/** Último minuto que acepta el backend (MINUTO_MAXIMO). */
export const MINUTO_MAXIMO = 130;

const MENSAJE_MINUTO = `El minuto tiene que ser un entero entre 0 y ${MINUTO_MAXIMO}.`;

/**
 * Reglas del formulario de un evento del partido, con los mismos mensajes que el backend.
 * La regla del cambio cruza campos (como "rol Jugador necesita jugador" en usuarios): va en
 * superRefine. Que el jugador que entra sea del mismo equipo lo asegura la lista, que solo
 * ofrece compañeros.
 */
export const esquemaEvento = z
  .object({
    tipoEvento: z.number({ error: 'Elegí el tipo de evento.' }),
    minuto: z
      .number({ error: 'El minuto es obligatorio.' })
      .int(MENSAJE_MINUTO)
      .min(0, MENSAJE_MINUTO)
      .max(MINUTO_MAXIMO, MENSAJE_MINUTO),
    inscripcionJugadorId: z
      .string({ error: 'Elegí el jugador.' })
      .min(1, 'Elegí el jugador.'),
    inscripcionJugadorEntraId: z.string().nullish(),
  })
  .superRefine((datos, contexto) => {
    if (datos.tipoEvento !== TipoEvento.Cambio) return;
    if (!datos.inscripcionJugadorEntraId) {
      contexto.addIssue({
        code: 'custom',
        path: ['inscripcionJugadorEntraId'],
        message: 'Elegí el jugador que entra.',
      });
    } else if (datos.inscripcionJugadorEntraId === datos.inscripcionJugadorId) {
      contexto.addIssue({
        code: 'custom',
        path: ['inscripcionJugadorEntraId'],
        message: 'El jugador que entra tiene que ser otro.',
      });
    }
  });

export type DatosFormularioEvento = z.infer<typeof esquemaEvento>;
