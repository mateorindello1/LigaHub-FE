import type { ReactNode } from 'react';
import type { Rol } from '../../modelos/sesion';
import { useSesion } from './contexto-sesion';

interface Props {
  /** Roles que pueden ver el contenido (alcanza con uno). */
  roles: Rol[];
  children: ReactNode;
  /** Lo que se muestra a quien no tiene el rol (por defecto, nada). */
  alternativa?: ReactNode;
}

/**
 * Muestra su contenido solo si el usuario de la sesión tiene alguno de los roles.
 * Equivale a <AuthorizeView Roles="..."> de Blazor. Se usa para botones y acciones
 * (por ejemplo, "Nuevo torneo" o "Generar fixture") dentro de pantallas que ve cualquiera.
 */
export function SoloConRol({ roles, children, alternativa = null }: Props) {
  const { tieneRol } = useSesion();
  return <>{tieneRol(...roles) ? children : alternativa}</>;
}
