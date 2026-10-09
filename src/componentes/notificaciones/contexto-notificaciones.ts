import { createContext, useContext } from 'react';

/** Avisos al usuario que muestra el ProveedorNotificaciones. */
export interface Notificaciones {
  /** Aviso de operación exitosa. */
  exito: (mensaje: string) => void;
  /** Aviso de error. Acepta un texto o un error (por ejemplo, un ErrorApi). */
  error: (errorOMensaje: unknown) => void;
}

/**
 * Contexto de React: permite que cualquier componente use las notificaciones sin pasarlas
 * por props de componente en componente. Equivale a un servicio registrado en el contenedor
 * e inyectado con @inject en Blazor.
 */
export const ContextoNotificaciones = createContext<Notificaciones | null>(
  null,
);

/** Hook para mostrar notificaciones desde cualquier componente. */
export function useNotificaciones(): Notificaciones {
  const notificaciones = useContext(ContextoNotificaciones);
  if (!notificaciones) {
    throw new Error(
      'useNotificaciones se tiene que usar dentro de ProveedorNotificaciones.',
    );
  }
  return notificaciones;
}
