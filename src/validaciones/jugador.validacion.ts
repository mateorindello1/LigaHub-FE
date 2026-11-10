import { z } from 'zod';

/** DNI argentino: 7 u 8 dígitos, sin puntos (como PATRON_DNI del backend). */
const PATRON_DNI = /^\d{7,8}$/;

/** Teléfono: dígitos, espacios, guiones, paréntesis y el + del código de país. */
const PATRON_TELEFONO = /^[\d\s()+-]+$/;

/**
 * Reglas del formulario de jugador, con los mismos mensajes que el backend (CrearJugadorDto).
 * Que el DNI no se repita lo responde el backend con un 409, que se muestra en el formulario.
 */
export const esquemaJugador = z.object({
  dni: z
    .string()
    .trim()
    .regex(PATRON_DNI, 'El DNI tiene que tener 7 u 8 dígitos, sin puntos.'),
  nombres: z
    .string()
    .trim()
    .min(1, 'Los nombres son obligatorios.')
    .max(100, 'Los nombres admiten hasta 100 caracteres.'),
  apellidos: z
    .string()
    .trim()
    .min(1, 'Los apellidos son obligatorios.')
    .max(100, 'Los apellidos admiten hasta 100 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio.')
    .max(254, 'El email admite hasta 254 caracteres.')
    .pipe(z.email('El email no tiene un formato válido.')),
  telefono: z
    .string()
    .trim()
    .min(1, 'El teléfono es obligatorio.')
    .max(20, 'El teléfono admite hasta 20 caracteres.')
    .regex(
      PATRON_TELEFONO,
      'El teléfono solo puede tener números, espacios, guiones, paréntesis y +.',
    ),
  direccion: z
    .string()
    .trim()
    .min(1, 'La dirección es obligatoria.')
    .max(200, 'La dirección admite hasta 200 caracteres.'),
});

export type DatosFormularioJugador = z.infer<typeof esquemaJugador>;
