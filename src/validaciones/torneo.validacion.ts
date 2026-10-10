import { z } from 'zod';

/**
 * Reglas del formulario de torneo. Son las mismas del backend (CrearTorneoDto), con los mismos
 * mensajes: el usuario ve el error antes de enviar y el backend vuelve a validar igual.
 * Equivale a un AbstractValidator<T> de FluentValidation.
 */
export const esquemaTorneo = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre admite hasta 100 caracteres.'),
  anio: z
    // Si el campo queda vacío llega null, que no es un número: se informa como obligatorio.
    .number({ error: 'El año es obligatorio.' })
    .int('El año debe ser un número entero.')
    .min(2000, 'El año no puede ser anterior a 2000.')
    .max(2100, 'El año no puede ser posterior a 2100.'),
});

/** Datos del formulario de torneo, deducidos del esquema (no hace falta escribir el tipo aparte). */
export type DatosFormularioTorneo = z.infer<typeof esquemaTorneo>;
