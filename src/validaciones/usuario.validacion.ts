import { z } from 'zod';
import { Rol } from '../modelos/sesion';

/** Largo mínimo de la contraseña. Igual que LARGO_MINIMO_CONTRASENIA del backend. */
export const LARGO_MINIMO_CONTRASENIA = 12;

/**
 * Regla de la contraseña, con los mismos mensajes que el backend (CrearUsuarioDto).
 * No se recorta: un espacio al principio o al final es parte de ella.
 */
const reglaContrasenia = z
  .string()
  .min(1, 'La contraseña es obligatoria.')
  .min(
    LARGO_MINIMO_CONTRASENIA,
    `La contraseña tiene que tener al menos ${LARGO_MINIMO_CONTRASENIA} caracteres.`,
  )
  .max(200, 'La contraseña admite hasta 200 caracteres.');

/**
 * Reglas del formulario de usuario, con los mismos mensajes que el backend.
 * En el alta se pide la contraseña; en la modificación no (se cambia aparte), y el campo queda vacío.
 *
 * La regla "el rol Jugador necesita un jugador" cruza dos campos: va en superRefine, que valida el
 * objeto entero (como un RuleFor(x => x).Must(...) de FluentValidation). El email repetido y el
 * jugador ya asociado a otro usuario los responde el backend con un 409.
 */
export function crearEsquemaUsuario(esAlta: boolean) {
  return z
    .object({
      email: z
        .string()
        .trim()
        .min(1, 'El email es obligatorio.')
        .max(254, 'El email admite hasta 254 caracteres.')
        .pipe(z.email('El email no tiene un formato válido.')),
      contrasenia: esAlta ? reglaContrasenia : z.string(),
      roles: z
        .array(z.number())
        .min(1, 'El usuario tiene que tener al menos un rol.'),
      /** Solo cuenta si el usuario tiene el rol Jugador; si no, se envía null. */
      jugadorId: z.number().nullish(),
    })
    .superRefine((datos, contexto) => {
      if (datos.roles.includes(Rol.Jugador) && !datos.jugadorId) {
        contexto.addIssue({
          code: 'custom',
          path: ['jugadorId'],
          message: 'Un usuario con rol Jugador necesita un jugador asociado.',
        });
      }
    });
}

export type DatosFormularioUsuario = z.infer<
  ReturnType<typeof crearEsquemaUsuario>
>;

/** Reglas del cambio de contraseña: la nueva y su repetición tienen que coincidir. */
export const esquemaContrasenia = z
  .object({
    contrasenia: reglaContrasenia,
    repeticion: z.string().min(1, 'Repetí la contraseña.'),
  })
  .refine((datos) => datos.contrasenia === datos.repeticion, {
    path: ['repeticion'],
    message: 'Las contraseñas no coinciden.',
  });

export type DatosFormularioContrasenia = z.infer<typeof esquemaContrasenia>;
