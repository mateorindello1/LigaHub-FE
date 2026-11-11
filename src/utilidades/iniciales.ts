import type { UsuarioSesion } from '../modelos/sesion';

/**
 * Iniciales de un usuario para cuando no tiene foto: las del jugador asociado, o la primera letra
 * del email.
 */
export function inicialesDe(
  usuario: Pick<UsuarioSesion, 'email' | 'jugador'>,
): string {
  if (usuario.jugador) {
    return (
      usuario.jugador.nombres.charAt(0) + usuario.jugador.apellidos.charAt(0)
    ).toUpperCase();
  }
  return usuario.email.charAt(0).toUpperCase();
}
