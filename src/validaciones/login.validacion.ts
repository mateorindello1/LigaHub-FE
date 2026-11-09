import { z } from 'zod';

/** Reglas del formulario de login, con los mismos mensajes que el backend (IniciarSesionDto). */
export const esquemaLogin = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio.')
    .pipe(z.email('El email no tiene un formato válido.')),
  // La contraseña no se recorta: un espacio al principio o al final es parte de ella.
  contrasenia: z.string().min(1, 'La contraseña es obligatoria.'),
});

export type DatosFormularioLogin = z.infer<typeof esquemaLogin>;
