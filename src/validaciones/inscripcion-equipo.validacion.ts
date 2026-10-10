import { z } from 'zod';

/**
 * Reglas del formulario de inscripción. Que el equipo no esté ya inscripto y que las
 * inscripciones estén abiertas lo valida el backend (responde 409).
 */
export const esquemaInscripcionEquipo = z.object({
  // Sin elección el valor es undefined, que no es un número: se informa como obligatorio.
  equipoId: z
    .number({ error: 'Elegí un equipo.' })
    .int()
    .min(1, 'Elegí un equipo.'),
});

export type DatosFormularioInscripcion = z.infer<
  typeof esquemaInscripcionEquipo
>;
