import { z } from 'zod';

/**
 * Reglas del formulario de predio, con los mismos mensajes que el backend (CrearPredioDto).
 * El nombre repetido lo responde el backend con un 409.
 */
export const esquemaPredio = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre admite hasta 100 caracteres.'),
  direccion: z
    .string()
    .trim()
    .min(1, 'La dirección es obligatoria.')
    .max(200, 'La dirección admite hasta 200 caracteres.'),
});

export type DatosFormularioPredio = z.infer<typeof esquemaPredio>;

const MENSAJE_NUMERO =
  'El número de cancha tiene que ser un entero entre 1 y 99.';

/**
 * Reglas del formulario de cancha (CrearCanchaDto). El número repetido en el predio lo responde
 * el backend con un 409.
 */
export const esquemaCancha = z.object({
  numero: z
    .number({ error: 'El número de cancha es obligatorio.' })
    .int(MENSAJE_NUMERO)
    .min(1, MENSAJE_NUMERO)
    .max(99, MENSAJE_NUMERO),
  descripcion: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(200, 'La descripción admite hasta 200 caracteres.'),
});

export type DatosFormularioCancha = z.infer<typeof esquemaCancha>;
